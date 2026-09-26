import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, MessageSquare, ChevronRight, 
  Trash2, FileText, Activity, Menu, X 
} from 'lucide-react';

const Sidebar = ({ isMobileOpen, setIsMobileOpen, onNewChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const history = [];

  const reports = [];

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#0b1326] rounded-xl border border-white/10 text-white"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`hidden lg:flex flex-col w-72 bg-[#0b1326]/40 backdrop-blur-md border-r border-white/5 h-full relative z-20 shrink-0`}
      >
        <div className="p-6">
          <button 
            onClick={() => {
              if (onNewChat) onNewChat();
              if (isMobileOpen) setIsMobileOpen(false);
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20 mb-6 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold tracking-wide">New Chat</span>
          </button>
          
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input 
              type="text" 
              placeholder="Search chats & reports..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all placeholder:text-white/30 text-white"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-2 h-[calc(100vh-250px)]">
            
            {/* Recent Diagnoses */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-green-400/80 font-bold mb-3 flex items-center gap-2">
                <Activity size={12} /> Recent Diagnoses
              </p>
              <div className="space-y-2">
                {history.filter(h => h.type === 'diagnosis').length > 0 ? (
                  history.filter(h => h.type === 'diagnosis').map(item => (
                    <button key={item.id} className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-left transition-all border border-transparent hover:border-green-500/30 group">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium text-white/90 group-hover:text-green-400 transition-colors truncate pr-2">{item.title}</span>
                      </div>
                      <div className="text-[10px] text-white/40">{item.date}</div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-white/30 italic text-center border border-dashed border-white/10 rounded-xl">No recent diagnoses</div>
                )}
              </div>
            </div>

            {/* Conversation History */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3 flex items-center gap-2">
                <MessageSquare size={12} /> Conversations
              </p>
              <div className="space-y-2">
                {history.filter(h => h.type === 'chat').length > 0 ? (
                  history.filter(h => h.type === 'chat').map(item => (
                    <button key={`chat-${item.id}`} className="w-full p-3 rounded-xl hover:bg-white/5 text-left transition-all group border border-transparent">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors truncate">{item.title}</span>
                        <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all opacity-0 group-hover:opacity-100" />
                      </div>
                      <div className="text-[10px] text-white/30">{item.date}</div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-white/30 italic text-center border border-dashed border-white/10 rounded-xl">No past conversations</div>
                )}
              </div>
            </div>

            {/* Saved Reports */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-3 flex items-center gap-2">
                <FileText size={12} /> Saved Reports
              </p>
              <div className="space-y-2">
                {reports.length > 0 ? (
                  reports.map(item => (
                    <button key={`rep-${item.id}`} className="w-full p-3 rounded-xl hover:bg-white/5 text-left transition-all group border border-transparent">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                          <FileText size={14} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{item.title}</div>
                          <div className="text-[10px] text-white/30">{item.date}</div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-white/30 italic text-center border border-dashed border-white/10 rounded-xl">No saved reports</div>
                )}
              </div>
            </div>

          </div>
        </div>
        
        {/* User Profile Area */}
        <div className="mt-auto p-4 mx-4 mb-4 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl flex items-center gap-3 backdrop-blur-md">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-sm font-bold shadow-lg shadow-green-500/20 text-white">
            AG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">AgroGuardian</p>
            <p className="text-[10px] text-green-400 font-medium tracking-widest uppercase">Pro Plan</p>
          </div>
        </div>
      </motion.div>
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
