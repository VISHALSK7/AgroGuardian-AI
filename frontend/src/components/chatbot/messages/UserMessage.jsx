import React from 'react';
import { motion } from 'framer-motion';
import { User, Paperclip } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

const AttachmentPreview = ({ attachment }) => {
  if (!attachment) return null;
  
  return (
    <div className="mt-3 flex items-center gap-3 p-2 bg-[var(--ag-surface-container)] border border-[var(--ag-border-soft)] rounded-xl max-w-sm">
      <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600 dark:text-green-400">
        <Paperclip size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--ag-text)] truncate">{attachment.name || 'Attachment'}</p>
        <p className="text-[10px] text-[var(--ag-text-dim)] uppercase">{attachment.type || 'File'}</p>
      </div>
    </div>
  );
};

const UserMessage = ({ message }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="flex justify-end mb-6 group"
    >
      <div className="flex flex-col items-end max-w-[85%] md:max-w-[70%]">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-end order-1">
            <div className={`px-5 py-3.5 rounded-[2rem] rounded-tr-none border transition-all duration-300 shadow-lg ${
              isLight
                ? 'bg-green-600/10 text-green-900 border-green-500/20 hover:bg-green-600/15'
                : 'bg-green-600/20 backdrop-blur-md text-white border-green-500/30 hover:bg-green-600/30 shadow-green-900/10'
            }`}>
              {message.image && (
                <div className="mb-3 rounded-xl overflow-hidden border border-[var(--ag-border-soft)]">
                  <img src={message.image} alt="Upload" className="max-w-full max-h-64 object-cover" />
                </div>
              )}
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
              {message.attachments?.map((att, i) => (
                <AttachmentPreview key={i} attachment={att} />
              ))}
            </div>
            <span className="text-[10px] text-[var(--ag-text-dim)] mt-1.5 mr-2 font-medium tracking-tight">
              {message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--ag-surface-high)] flex items-center justify-center border border-[var(--ag-border-soft)] order-2 mt-1 shadow-inner">
            <User size={16} className="text-[var(--ag-text-secondary)]" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserMessage;
