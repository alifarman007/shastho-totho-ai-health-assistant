import React, { useState, useRef } from 'react';
import { Mic, ArrowRight, Youtube, Linkedin, Instagram, Facebook } from 'lucide-react';

interface WelcomeScreenProps {
  onSearch: (query: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue);
    }
  };

  const toggleListening = () => {
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
      setInputValue(transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-500">
      
      {/* Central Logo */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 mb-2">
            <h1 className="text-5xl md:text-6xl font-bold text-blue-600 tracking-tight">স্বাস্থ্যতথ্য</h1>
            <div className="text-blue-500 mt-2">
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                   <path d="M12 5 v14" />
                   <path d="M5 12 h14" />
               </svg>
            </div>
        </div>
        <p className="text-blue-500 text-sm tracking-[0.2em] font-medium">shasthototho.com</p>
      </div>

      {/* Instructions */}
      <div className="text-center mb-8 text-slate-600 max-w-2xl">
        <p className="mb-1">নির্দেশিকা: ভাল ফলাফল বা প্রফেশনাল রেজাল্টের জন্য এই প্রম্পট ফরমেট গুলো ব্যবহার করুন।</p>
        <p>প্রম্পট গুলো দেখতে <button className="text-blue-600 underline hover:text-blue-700">ক্লিক করুন</button></p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl relative mb-8 group">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isListening ? "শুনছি..." : "আপনার সমস্যাগুলো টাইপ করে সার্চ করুন।"}
          className={`w-full p-4 pl-6 pr-32 rounded-full border-2 shadow-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all text-lg ${
            isListening 
              ? 'border-red-400 focus:border-red-500 focus:ring-red-100' 
              : 'border-blue-100 focus:border-blue-400 focus:ring-blue-100'
          }`}
        />
        
        <div className="absolute right-2 top-2 bottom-2 flex items-center gap-2">
            {!isListening && <span className="text-slate-400 text-sm hidden sm:block">অথবা ভয়েজ দিন</span>}
            <button 
                type="button" 
                onClick={toggleListening}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse shadow-red-200 shadow-lg' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
                <Mic size={20} />
            </button>
        </div>
      </form>

      {/* Social Box */}
      <div className="w-full max-w-xl border-2 border-blue-300 rounded-xl p-3 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-2">
            <div className="bg-blue-500 text-white rounded-full p-1">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                   <path d="M12 5 v14" />
                   <path d="M5 12 h14" />
               </svg>
            </div>
            <span className="text-xs font-semibold text-slate-700">স্বাস্থ্য সম্পর্কিত নানা তথ্য জানতে আমাদের সাথে যুক্ত থাকুন</span>
        </div>
        <div className="flex items-center gap-2">
            <a href="#" className="text-red-600 hover:scale-110 transition-transform"><Youtube size={24} fill="currentColor" /></a>
            <a href="#" className="text-blue-700 hover:scale-110 transition-transform"><Linkedin size={24} fill="currentColor" stroke="none" /></a>
            <a href="#" className="text-pink-600 hover:scale-110 transition-transform"><Instagram size={24} /></a>
            <a href="#" className="text-blue-600 hover:scale-110 transition-transform"><Facebook size={24} fill="currentColor" stroke="none" /></a>
            <a href="#" className="text-black hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
            </a>
        </div>
      </div>
      
      {/* Footer Whatsapp/Support */}
      <div className="fixed bottom-8 flex flex-col items-center gap-1">
         <div className="text-center text-sm font-medium text-slate-800">
            আমাদের সাথে যোগাযোগ করতে<br/>
            সরাসরি ম্যাসেজ করুনঃ
         </div>
         <button className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors mt-2">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
             </svg>
         </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;