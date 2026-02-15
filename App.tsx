import React, { useState, useCallback } from 'react';
import { Menu, Globe } from 'lucide-react';
import Sidebar from './components/Sidebar';
import WelcomeScreen from './components/WelcomeScreen';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import { Message, ViewState, ChatSession } from './types';
import { streamHealthResponse } from './services/geminiService';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewState, setViewState] = useState<ViewState>(ViewState.WELCOME);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock History
  const [history, setHistory] = useState<ChatSession[]>([
    { id: '1', title: 'ডায়াবেটিস: লক্ষণ, প্রতিকার...', date: 'Today' },
    { id: '2', title: 'ডেঙ্গু জ্বরের ঘরোয়া চিকিৎসা', date: 'Yesterday' }
  ]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setViewState(ViewState.WELCOME);
    // On mobile, close sidebar automatically
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleVoiceMode = () => {
    setViewState(ViewState.VOICE);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleCloseVoiceMode = () => {
    // Return to where we were, or Welcome
    if (messages.length > 0) {
        setViewState(ViewState.CHAT);
    } else {
        setViewState(ViewState.WELCOME);
    }
  };

  const handleSendMessage = async (query: string) => {
    if (!query.trim()) return;

    // 1. Set View to Chat
    if (viewState === ViewState.WELCOME) {
      setViewState(ViewState.CHAT);
    }

    // 2. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 3. Prepare context for AI (exclude current user msg as it's added in the service)
      const context = messages.map(m => ({ role: m.role, content: m.content }));
      
      // 4. Create placeholder for AI response
      const aiMsgId = (Date.now() + 1).toString();
      let aiContent = '';
      
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'model',
        content: '',
        isStreaming: true
      }]);

      // 5. Stream Response
      const stream = await streamHealthResponse(query, context);

      for await (const chunk of stream) {
        // chunk.text is a property getter, not a function call in the new SDK
        const text = chunk.text;
        if (text) {
          aiContent += text;
          
          setMessages(prev => prev.map(msg => 
            msg.id === aiMsgId 
              ? { ...msg, content: aiContent }
              : msg
          ));
        }
      }

      // 6. Finalize loading state
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId 
          ? { ...msg, isStreaming: false }
          : msg
      ));
      
      // 7. Update History (Mock)
      if (messages.length === 0) {
          const newSession: ChatSession = {
              id: Date.now().toString(),
              title: query.slice(0, 30) + "...",
              date: "Today"
          };
          setHistory(prev => [newSession, ...prev]);
      }

    } catch (error) {
      console.error("Failed to generate response", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "দুঃখিত, একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden relative">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar}
        recentHistory={history}
        onHistoryClick={(id) => console.log("Load history", id)}
        onNewChat={handleNewChat}
        onVoiceMode={handleVoiceMode}
      />

      {/* Main Content */}
      <main 
        className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}
      >
        {/* Header (Top Right Private/Menu) */}
        <header className="flex items-center justify-between p-4 h-16 shrink-0">
            <div className="flex items-center">
                 {!isSidebarOpen && (
                     <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 rounded-full mr-2">
                        <Menu size={20} className="text-slate-600" />
                     </button>
                 )}
                 {viewState === ViewState.CHAT && (
                     <span className="font-bold text-lg text-blue-600 md:hidden ml-2">স্বাস্থ্যতথ্য</span>
                 )}
            </div>
            
            <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Globe size={16} />
                <span>Private</span>
            </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-hidden relative">
           {viewState === ViewState.WELCOME ? (
             <WelcomeScreen onSearch={handleSendMessage} />
           ) : viewState === ViewState.CHAT ? (
             <ChatInterface 
               messages={messages}
               isLoading={isLoading}
               input={input}
               setInput={setInput}
               onSend={onFormSubmit}
             />
           ) : null}
        </div>
      </main>
      
      {/* Voice Mode Overlay */}
      {viewState === ViewState.VOICE && (
          <VoiceInterface onClose={handleCloseVoiceMode} />
      )}
    </div>
  );
};

export default App;