import React, { useState } from 'react';
import Sidebar from './Sidebar';

const ChatbotLayout = ({ children, onNewChat }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex-1 flex min-h-0 min-w-0 antialiased font-sans relative w-full h-full">
      {/* Background Atmosphere - Scoped to this component */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-900/10 blur-[120px] rounded-full" />
      </div>

      <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} onNewChat={onNewChat} />
      
      {/* Fully extended Chatbot screen */}
      <main className="flex-1 flex flex-col relative z-10 min-w-0 w-full h-full bg-transparent">
        {children}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(34, 197, 94, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(34, 197, 94, 0.4);
        }
      `}</style>
    </div>
  );
};

export default ChatbotLayout;
