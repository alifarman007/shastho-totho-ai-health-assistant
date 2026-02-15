import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Loader2, Mic } from 'lucide-react';
import { Message } from '../types';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  input: string;
  setInput: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  input, 
  setInput, 
  onSend 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("দুঃখিত, আপনার ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়।");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'bn-BD';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.start();
  };

  const formatMessageContent = (content: string) => {
    // Simple formatter for handling the structured response
    // 1. Handles bolding via **text**
    // 2. Preserves whitespace for structure
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-700' : 'bg-blue-600'}`}>
              {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`px-5 py-3 rounded-2xl whitespace-pre-wrap leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-slate-100 text-slate-800 rounded-tr-none' 
                    : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                }`}
              >
                {formatMessageContent(msg.content)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-4">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <Bot size={16} className="text-white" />
             </div>
             <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl rounded-tl-none">
                <Loader2 className="animate-spin text-blue-500" size={20} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-100 bg-white/80 backdrop-blur-sm sticky bottom-0">
        <form onSubmit={onSend} className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "শুনছি..." : "আপনার প্রশ্ন লিখুন..."}
            disabled={isLoading}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-4 pr-24 focus:outline-none focus:ring-2 focus:bg-white transition-all disabled:opacity-50 ${
                isListening 
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100 ring-2 ring-red-100' 
                  : 'focus:ring-blue-500'
            }`}
          />
          <div className="absolute right-2 top-2 flex items-center gap-1">
            <button 
                type="button"
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`p-2 rounded-lg transition-all ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'text-slate-400 hover:bg-slate-100 hover:text-blue-600'
                }`}
            >
                <Mic size={20} />
            </button>
            <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
                <Send size={18} />
            </button>
          </div>
        </form>
        <p className="text-center text-xs text-slate-400 mt-2">
            Shastho Totho AI ভুল করতে পারে। চিকিৎসা পরামর্শের জন্য সর্বদা একজন ডাক্তারের সাথে পরামর্শ করুন।
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;