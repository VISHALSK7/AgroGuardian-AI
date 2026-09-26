import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowDown } from 'lucide-react';
import MessageBubble from './messages/MessageBubble';
import TypingIndicator from './messages/TypingIndicator';
import LoadingSkeleton from './messages/LoadingSkeleton';
import { useState } from 'react';

const ChatArea = ({ messages, isLoading, isStreaming }) => {
  const scrollRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll logic
  const scrollToBottom = (behavior = 'smooth') => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      scrollRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isStreaming]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isAtBottom);
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-[var(--ag-bg)]">
      {/* Scrollable Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 md:px-8 py-10 custom-scrollbar scroll-smooth"
      >
        {/* Welcome Screen */}
        {messages.length === 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto"
          >
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center border border-green-500/20 rotate-12">
                <Sparkles size={40} className="text-green-500 dark:text-green-400" />
              </div>
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-10 h-10 bg-green-500/20 blur-xl rounded-full"
              />
            </div>
            <h2 className="text-4xl font-bold text-[var(--ag-text)] mb-4 font-display tracking-tight">
              AgroGuardian <span className="text-green-500 dark:text-green-400">Intelligence</span>
            </h2>
            <p className="text-base text-[var(--ag-text-muted)] leading-relaxed">
              Your expert agricultural companion. Ask me about crop health, soil conditions, 
              or weather forecasts. I'm here to grow with you.
            </p>
            
            <div className="mt-10 grid grid-cols-2 gap-3 w-full">
              {['Diagnose Crop', 'Weather Forecast', 'Soil Advice', 'Market Prices'].map((tag) => (
                <div key={tag} className="px-4 py-3 bg-[var(--ag-surface-container)] border border-[var(--ag-border-soft)] rounded-2xl text-sm text-[var(--ag-text-secondary)] hover:bg-[var(--ag-hover-bg)] hover:border-green-500/30 cursor-pointer transition-all">
                  {tag}
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Message List */}
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {messages.map((m, index) => (
              <MessageBubble 
                key={m.id || index} 
                message={m} 
                isStreaming={isStreaming && index === messages.length - 1 && m.role === 'assistant'}
              />
            ))}
          </AnimatePresence>
        </div>
        
        {/* Loading States */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4"
            >
              <div className="flex flex-col gap-4">
                <LoadingSkeleton />
                <div className="pl-12">
                  <TypingIndicator />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Spacer */}
        <div className="h-10" />
      </div>

      {/* Floating Scroll Button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-6 right-8 p-3 bg-green-600 text-white rounded-full shadow-2xl hover:bg-green-500 transition-colors z-20 border border-white/20"
          >
            <ArrowDown size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatArea;

