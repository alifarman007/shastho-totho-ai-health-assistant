import React, { useState, useRef } from 'react';
import { Mic, Youtube, Linkedin, Instagram, Facebook, X } from 'lucide-react';

interface WelcomeScreenProps {
  onSearch: (query: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSearch }) => {
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
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
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-in fade-in duration-500 relative">
      
      {/* Central Logo */}
      <div className="mb-10 flex flex-col items-center text-center">
        <div className="mb-4">
            <img src="https://i.ibb.co.com/PZ58mpHp/logo.png" alt="Shastho Totho" className="h-20 md:h-28 w-auto object-contain" />
        </div>
        <p className="text-blue-500 text-sm tracking-[0.2em] font-medium">shasthototho.com</p>
      </div>

      {/* Instructions Link */}
      <div className="text-center mb-8 text-slate-600 max-w-2xl">
        <p className="mb-1">নির্দেশিকা: ভাল ফলাফল বা প্রফেশনাল রেজাল্টের জন্য এই প্রম্পট ফরমেট গুলো ব্যবহার করুন।</p>
        <p>প্রম্পট গুলো দেখতে <button onClick={() => setShowInstructions(true)} className="text-blue-600 underline hover:text-blue-700 font-medium">ক্লিক করুন</button></p>
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
            <img src="https://i.ibb.co.com/M5ZBqYPL/main-icon.png" alt="Icon" className="h-8 w-8 object-contain" />
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

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">প্রম্পট নির্দেশিকা</h2>
              <button 
                onClick={() => setShowInstructions(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-8 text-slate-700 leading-relaxed custom-scrollbar">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm font-medium text-blue-900">
                নির্দেশিকা: ভালো ফলাফল বা প্রফেশনাল রেজাল্টের জন্য নিচের প্রম্পট ফরমেটগুলো ব্যবহার করুন। আপনার প্রয়োজন অনুযায়ী নির্দিষ্ট প্রম্পটটি কপি করে ব্র্যাকেটের ভেতরের [ ] অংশটুকু পরিবর্তন করে প্রশ্ন করুন।
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-blue-600 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 flex items-center justify-center rounded-full text-xs">১</span>
                    কোনো নির্দিষ্ট রোগ সম্পর্কে বিস্তারিত জানতে:
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-600 select-all">
                  "আমি [আপনার রোগের নাম] রোগ সম্পর্কে জানতে চাই। এই রোগের লক্ষণ ও এর প্রতিকার কী? এই রোগের প্রাকৃতিক সমাধান কী? রোগের তীব্রতা বৃদ্ধি পেলে করণীয় কী? এই রোগের জন্য কোন ধরনের স্পেশালিস্ট ডাক্তার দেখানো উচিত?"
                </div>
                <div className="text-sm text-slate-500 italic pl-2 border-l-2 border-slate-200">
                  <span className="font-medium text-slate-600 not-italic">উদাহরণ:</span> আমি ডায়াবেটিস রোগ সম্পর্কে জানতে চাই। এই রোগের লক্ষণ ও এর প্রতিকার কী? এই রোগের প্রাকৃতিক সমাধান কী? রোগের তীব্রতা বৃদ্ধি পেলে করণীয় কী? এই রোগের জন্য কোন ধরনের স্পেশালিস্ট ডাক্তার দেখানো উচিত?
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-blue-600 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 flex items-center justify-center rounded-full text-xs">২</span>
                    লক্ষণ বা উপসর্গ অনুযায়ী রোগ ও করণীয় জানতে:
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-600 select-all">
                  "[আপনার লক্ষণগুলো উল্লেখ করুন] – এই লক্ষণগুলো কোন রোগের লক্ষণ হতে পারে? এর প্রাকৃতিক সমাধান কী? অবস্থার তীব্রতা বৃদ্ধি পেলে করণীয় কী? এই লক্ষণগুলোর জন্য আমার কোন ধরনের স্পেশালিস্ট ডাক্তার দেখানো উচিত?"
                </div>
                <div className="text-sm text-slate-500 italic pl-2 border-l-2 border-slate-200">
                  <span className="font-medium text-slate-600 not-italic">উদাহরণ:</span> পেট ব্যথা, বমি বমি ভাব, মাথা ঘুরানো – এই লক্ষণগুলো কোন রোগের লক্ষণ হতে পারে? এর প্রাকৃতিক সমাধান কী? অবস্থার তীব্রতা বৃদ্ধি পেলে করণীয় কী? এই লক্ষণগুলোর জন্য আমার কোন ধরনের স্পেশালিস্ট ডাক্তার দেখানো উচিত?
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-blue-600 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-6 h-6 flex items-center justify-center rounded-full text-xs">৩</span>
                    দুর্ঘটনা বা সমস্যার প্রাথমিক ও উন্নত চিকিৎসা সম্পর্কে জানতে:
                </h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm font-mono text-slate-600 select-all">
                  "[আপনার সমস্যাটি উল্লেখ করুন]-এর প্রাথমিক চিকিৎসাগুলো কী কী? উন্নত চিকিৎসার জন্য পরবর্তী পদক্ষেপ কী হতে পারে?"
                </div>
                <div className="text-sm text-slate-500 italic pl-2 border-l-2 border-slate-200">
                  <span className="font-medium text-slate-600 not-italic">উদাহরণ:</span> হাত ভাঙার প্রাথমিক চিকিৎসাগুলো কী কী? উন্নত চিকিৎসার জন্য পরবর্তী পদক্ষেপ কী হতে পারে?
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end shrink-0">
              <button 
                onClick={() => setShowInstructions(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeScreen;