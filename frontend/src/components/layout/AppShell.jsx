import React, { useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ChatbotWidget from '../chatbot/ChatbotWidget';
import HelpWidget from '../ui/HelpWidget';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../context/ThemeContext';

const PAGE_TITLES = {
  '/dashboard':          'dashboard',
  '/dashboard/disease':  'diseaseDetection',
  '/dashboard/weather':  'weatherDisease',
  '/dashboard/schemes':  'schemes',
  '/dashboard/history':  'history',
  '/dashboard/chatbot':  'chatbotAssistant',
  '/dashboard/profile':  'profile',
  '/dashboard/settings': 'settings',
};

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0,        transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } },
};

const AppShell = () => {
  const location    = useLocation();
  const { t }       = useTranslation();
  const { theme }   = useTheme();
  const titleKey    = PAGE_TITLES[location.pathname] || 'dashboard';
  const openChatbot = useRef(null);
  const isChatbot   = location.pathname === '/dashboard/chatbot';

  const isLight   = theme === 'light';
  const shellBg   = isLight ? '#f0f7f2' : '#0a0f0d';
  const mainBg    = isLight ? '#edf6ee' : '#0f1412';
  const navBg     = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(12,18,16,0.95)';
  const navBorder = isLight ? 'rgba(34,197,94,0.15)'   : 'rgba(42,56,41,0.35)';

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: shellBg, transition: 'background 0.3s ease' }}
    >
      <Sidebar />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <style>{`
          header {
            background: ${navBg} !important;
            border-bottom-color: ${navBorder} !important;
          }
        `}</style>

        <Navbar title={t(titleKey)} />

        {/*
          main: flex column, flex-1, overflow-hidden.
          Non-chatbot pages get padding via the inner wrapper.
          ChatbotPage fills the full area with no padding.
        */}
        <main
          className="flex-1 flex flex-col min-h-0 overflow-hidden"
          style={{ background: mainBg, transition: 'background 0.3s ease' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex-1 flex flex-col min-h-0 overflow-hidden"
              style={{ willChange: 'opacity,transform' }}
            >
              {/* Padding wrapper — skipped for chatbot so it gets full area */}
              {isChatbot ? (
                <Outlet />
              ) : (
                <div className="flex-1 overflow-y-auto px-7 py-6 pb-10">
                  <Outlet />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global floating chatbot widget — only on non-chatbot pages */}
      {!isChatbot && <ChatbotWidget openRef={openChatbot} />}
      {!isChatbot && <HelpWidget onAskAssistant={() => openChatbot.current?.()} />}
    </div>
  );
};

export default AppShell;
