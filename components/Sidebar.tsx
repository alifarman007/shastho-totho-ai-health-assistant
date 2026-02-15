import React from 'react';
import { 
  Search, 
  MessageSquarePlus, 
  AudioLines, 
  Image as ImageIcon, 
  FolderOpen, 
  Clock, 
  Menu
} from 'lucide-react';
import { ChatSession } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  recentHistory: ChatSession[];
  onHistoryClick: (id: string) => void;
  onNewChat: () => void;
  onVoiceMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  toggleSidebar, 
  recentHistory, 
  onHistoryClick,
  onNewChat,
  onVoiceMode
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Content */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-slate-50 border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Header/Logo Area for Mobile */}
          <div className="md:hidden flex items-center justify-between mb-6">
            <span className="font-bold text-xl text-blue-600">স্বাস্থ্যতথ্য</span>
            <button onClick={toggleSidebar} className="p-1">
              <Menu size={24} />
            </button>
          </div>
          
           {/* Desktop Logo Area (mimicking the top left of screenshot) */}
           <div className="hidden md:flex flex-col items-start mb-6 px-2">
              <div className="flex items-center gap-2">
                 <h1 className="text-2xl font-bold text-blue-600 tracking-tighter">স্বাস্থ্যতথ্য</h1>
                 <div className="text-blue-500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        <path d="M12 5 v14" />
                        <path d="M5 12 h14" />
                    </svg>
                 </div>
              </div>
              <span className="text-xs text-blue-400 tracking-widest">shasthototho.com</span>
           </div>

          {/* Search */}
          <div className="mb-4 relative">
             <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
             <input 
               type="text" 
               placeholder="Search Ctrl+K" 
               className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
             />
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 flex-1">
            <button 
              onClick={onNewChat}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-200/60 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <MessageSquarePlus size={18} />
              Chat
            </button>
            <button 
              onClick={onVoiceMode}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <AudioLines size={18} />
              Voice
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <div className="relative">
                <ImageIcon size={18} />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-blue-500 rounded-full"></span>
              </div>
              Imagine
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <FolderOpen size={18} />
              Projects
            </button>
          </nav>

          {/* History Section */}
          <div className="mt-8">
            <div className="flex items-center gap-2 text-slate-500 mb-3 px-3">
              <Clock size={16} />
              <span className="text-sm font-semibold">History</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-medium text-slate-400 px-3 mb-2">Today</h3>
                {recentHistory.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => onHistoryClick(session.id)}
                    className="w-full text-left px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md truncate transition-colors"
                  >
                    {session.title}
                  </button>
                ))}
              </div>
              
              <button className="text-xs text-slate-500 hover:text-blue-600 px-3 mt-2">
                See all
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;