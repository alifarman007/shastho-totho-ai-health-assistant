import React, { useState, useEffect } from 'react';
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
  
  // Session Management
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  
  // Store all chat sessions: { sessionId: Message[] }
  const [sessions, setSessions] = useState<Record<string, Message[]>>({
    '1': [
        { id: '1a', role: 'user', content: 'ডায়াবেটিস: লক্ষণ, প্রতিকার ও স্পেশালিস্ট ডাক্তার' },
        { id: '1b', role: 'model', content: '**ডায়াবেটিস রোগ সম্পর্কে বিস্তারিত তথ্য**\n\nডায়াবেটিস (Diabetes Mellitus) একটি দীর্ঘমেয়াদি রোগ, যেখানে রক্তে শর্করা (গ্লুকোজ) এর মাত্রা অস্বাভাবিকভাবে বেড়ে যায়। এটি মূলত প্যানক্রিয়াস থেকে ইনসুলিন হরমোনের সমস্যার কারণে হয়।\n\n**রোগের লক্ষণ:**\n* অতিরিক্ত তৃষ্ণা পাওয়া এবং ঘন ঘন প্রস্রাব।\n* অতিরিক্ত ক্ষুধা লাগা, কিন্তু ওজন কমে যাওয়া।\n* ক্লান্তি ও দুর্বলতা।\n\n**রোগের প্রতিকার (চিকিত্সা):**\nডায়াবেটিস সম্পূর্ণ সারানো যায় না, কিন্তু নিয়ন্ত্রণে রাখা সম্ভব।\n* জীবনযাত্রার পরিবর্তন: স্বাস্থ্যকর খাদ্য, নিয়মিত ব্যায়াম।\n* ওষুধ ও ইনসুলিন (ডাক্তারের পরামর্শে)।\n\n**প্রাকৃতিক সমাধান:**\n* খাদ্যাভ্যাস: করলা, মেথি, দারুচিনি (সামান্য পরিমাণে)।\n* ব্যায়াম: নিয়মিত হাঁটা, সাঁতার।\n\n**কোন স্পেশালিস্ট ডাক্তার দেখাবেন?**\n* এন্ডোক্রাইনোলজিস্ট (Endocrinologist) বা ডায়াবেটোলজিস্ট।\n* বাংলাদেশে BIRDEM বা BSMMU-তে যোগাযোগ করতে পারেন।\n\n**সতর্কবার্তা:** এই তথ্য সাধারণ জ্ঞানের জন্য। আপনার অবস্থা অনুযায়ী ডাক্তার দেখান।' }
    ],
    '2': [
        { id: '2a', role: 'user', content: 'ডেঙ্গু জ্বরের ঘরোয়া চিকিৎসা' },
        { id: '2b', role: 'model', content: '**ডেঙ্গু জ্বরের ঘরোয়া চিকিৎসা**\n\nডেঙ্গু জ্বর এডিস মশা বাহিত একটি ভাইরাল রোগ।\n\n**প্রাথমিক চিকিৎসা ও ঘরোয়া যত্ন:**\n* **প্রচুর তরল পান:** ডিহাইড্রেশন রোধ করতে প্রচুর পানি, ডাবের পানি, ফলের রস এবং ওরাল স্যালাইন (ORS) পান করুন।\n* **বিশ্রাম:** পূর্ণ বিশ্রামে থাকুন। ভারী কাজ থেকে বিরত থাকুন।\n* **জ্বর নিয়ন্ত্রণ:** জ্বরের জন্য শুধুমাত্র প্যারাসিটামল (Paracetamol) ব্যবহার করুন। অ্যাসপিরিন বা ব্যথানাশক ওষুধ (NSAIDs) এড়িয়ে চলুন কারণ এতে রক্তপাতের ঝুঁকি বাড়ে।\n* **পুষ্টিকর খাবার:** রোগ প্রতিরোধ ক্ষমতা বাড়াতে ভিটামিন সি যুক্ত ফল (যেমন কমলা, মাল্টা) এবং প্রোটিন সমৃদ্ধ খাবার খান।\n\n**সতর্কতা:** পেটে তীব্র ব্যথা, ক্রমাগত বমি, বা মাড়ি/নাক দিয়ে রক্তক্ষরণ হলে দ্রুত হাসপাতালে যোগাযোগ করুন।' }
    ]
  });

  const [history, setHistory] = useState<ChatSession[]>([
    { id: '1', title: 'ডায়াবেটিস: লক্ষণ, প্রতিকার...', date: 'Today' },
    { id: '2', title: 'ডেঙ্গু জ্বরের ঘরোয়া চিকিৎসা', date: 'Yesterday' }
  ]);

  // Sync current messages to sessions state whenever they update
  useEffect(() => {
    if (currentSessionId && messages.length > 0) {
      setSessions(prev => ({
        ...prev,
        [currentSessionId]: messages
      }));
    }
  }, [messages, currentSessionId]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setCurrentSessionId(null);
    setViewState(ViewState.WELCOME);
    // On mobile, close sidebar automatically
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleHistoryClick = (id: string) => {
    const sessionMessages = sessions[id];
    if (sessionMessages) {
        setMessages(sessionMessages);
        setCurrentSessionId(id);
        setViewState(ViewState.CHAT);
        // On mobile, close sidebar automatically
        if (window.innerWidth < 768) {
            setIsSidebarOpen(false);
        }
    } else {
        // Fallback if message history is missing for some reason
        handleNewChat();
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

    // 2. Determine Session ID
    let activeId = currentSessionId;
    if (!activeId) {
        activeId = Date.now().toString();
        setCurrentSessionId(activeId);
        
        // Create new history entry
        const newSession: ChatSession = {
            id: activeId,
            title: query.slice(0, 30) + (query.length > 30 ? "..." : ""),
            date: "Today"
        };
        setHistory(prev => [newSession, ...prev]);
    }

    // 3. Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 4. Prepare context for AI
      const context = messages.map(m => ({ role: m.role, content: m.content }));
      
      // 5. Create placeholder for AI response
      const aiMsgId = (Date.now() + 1).toString();
      let aiContent = '';
      
      setMessages(prev => [...prev, {
        id: aiMsgId,
        role: 'model',
        content: '',
        isStreaming: true
      }]);

      // 6. Stream Response
      const stream = await streamHealthResponse(query, context);

      for await (const chunk of stream) {
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

      // 7. Finalize loading state
      setMessages(prev => prev.map(msg => 
        msg.id === aiMsgId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

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
        onHistoryClick={handleHistoryClick}
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