import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Mic, 
  Image as ImageIcon,
  FileText,
  X,
  Square,
  Play
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../context/ThemeContext';

const ChatInput = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const currentLanguage = useAppStore(s => s.chatbotLanguage);
  const autoSpeak = useAppStore(s => s.autoSpeak);
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    speechSynthesis.getVoices();
  }, []);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (isLoading) return;
    if (!input.trim() && attachments.length === 0) return;
    onSend({ text: input, attachments });
    setInput('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e) => {
    if (isLoading) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    if (isLoading) return;
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // Drag and Drop Handlers
  const handleDragOver = (e) => {
    if (isLoading) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    if (isLoading) return;
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const newAttachments = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'document',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  // Voice Recognition (optimized for extremely low latency & robust multi-session stability)
  const toggleRecording = () => {
    if (isLoading) return;
    
    if (isRecording) {
      clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping recognition:", e);
        }
      }
      setIsRecording(false);
      setRecordingTime(0);
    } else {
      // Safety step: Abort any residual active recognition instances to clear Web Speech locks
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Voice input is not supported in this browser.');
        return;
      }
      
      const recognition = new SpeechRecognition();
      
      recognition.lang =
        currentLanguage === "kn"
          ? "kn-IN"
          : currentLanguage === "hi"
          ? "hi-IN"
          : "en-IN";
          
      // Use continuous=true for real-time speech-to-text typing that stays active and doesn't auto-stop aggressively,
      // and interimResults=true to type instantly word-by-word as they speak.
      recognition.interimResults = true;
      recognition.continuous = true;
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };
      
      recognition.onend = () => {
        clearInterval(timerRef.current);
        setIsRecording(false);
        setRecordingTime(0);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        clearInterval(timerRef.current);
        setIsRecording(false);
        setRecordingTime(0);
      };
      
      recognitionRef.current = recognition;
      setIsRecording(true);
      
      try {
        recognition.start();
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        // Force recovery by aborting and restarting after a brief timeout
        try {
          recognition.abort();
          setTimeout(() => {
            recognition.start();
          }, 100);
        } catch (e) {
          setIsRecording(false);
          setRecordingTime(0);
        }
      }
      
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`relative px-4 md:px-8 pb-8 pt-2 transition-all ${isDragging ? 'bg-[var(--ag-hover-bg)]' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-green-500/10 backdrop-blur-sm border-2 border-dashed border-green-500/50 rounded-3xl mx-4 md:mx-8 mb-8"
          >
            <div className="flex flex-col items-center text-green-400">
              <ImageIcon size={48} className="mb-4" />
              <p className="font-bold text-lg">Drop files here to upload</p>
              <p className="text-sm opacity-70">Supports images, PDFs, and documents</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-[var(--ag-surface-container)] backdrop-blur-xl border border-[var(--ag-border-soft)] rounded-3xl p-3 focus-within:border-green-500/40 transition-all shadow-2xl relative z-20">
        
        {/* Controls row: Premium Language picker & Auto-Speak controller directly at the point of action */}
        <div className="flex justify-between items-center px-2 pb-2 mb-2 border-b border-[var(--ag-border-soft)]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[var(--ag-text-dim)] tracking-wider">Language</span>
            <div className="flex bg-[var(--ag-surface-low)] p-0.5 rounded-lg border border-[var(--ag-border-soft)]">
              {[
                { code: 'en', label: 'EN' },
                { code: 'kn', label: 'ಕನ್ನಡ' },
                { code: 'hi', label: 'हिंदी' }
              ].map(lang => (
                <button
                  key={lang.code}
                  disabled={isLoading}
                  onClick={() => {
                    const setChatbotLanguage = useAppStore.getState().setChatbotLanguage;
                    if (setChatbotLanguage) setChatbotLanguage(lang.code);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    currentLanguage === lang.code
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                      : 'text-[var(--ag-text-dim)] hover:text-[var(--ag-text)] hover:bg-[var(--ag-hover-bg)]'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Attachments Preview Area */}
        {attachments.length > 0 && (
          <div className="flex gap-3 px-3 py-3 overflow-x-auto custom-scrollbar border-b border-[var(--ag-border-soft)] mb-2">
            {attachments.map(att => (
              <div key={att.id} className="relative flex-shrink-0 group">
                {att.type === 'image' ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[var(--ag-border-soft)]">
                    <img src={att.preview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                ) : att.type === 'audio' ? (
                  <div className="h-16 px-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3">
                    <Play size={16} className="text-green-400" />
                    <div className="w-16 h-4 flex items-center gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className="w-1 bg-green-400 rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[var(--ag-surface-low)] border border-[var(--ag-border-soft)] flex flex-col items-center justify-center text-[var(--ag-text-muted)]">
                    <FileText size={20} className="mb-1" />
                    <span className="text-[8px] uppercase font-bold truncate w-12 text-center">{att.name.split('.').pop()}</span>
                  </div>
                )}
                
                <button 
                  onClick={() => removeAttachment(att.id)}
                  disabled={isLoading}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* File Upload Input */}
          <input 
            type="file" 
            multiple 
            ref={fileInputRef}
            onChange={handleFileSelect} 
            className="hidden" 
            accept="image/*,.pdf,.doc,.docx,audio/*,video/*"
            disabled={isLoading}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 bg-[var(--ag-surface-high)] hover:bg-[var(--ag-hover-bg)] text-[var(--ag-text-muted)] hover:text-[var(--ag-text)] rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Attach File"
          >
            <Paperclip size={20} />
          </button>
          
          {/* Main Input area */}
          <div className="flex-1 relative">
            {isRecording ? (
              <div className="absolute inset-0 flex items-center justify-center gap-4 bg-[var(--ag-surface-container)] rounded-2xl">
                <div className="flex items-center gap-2 text-red-500">
                  <motion.div 
                    animate={{ opacity: [1, 0.3, 1] }} 
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 bg-red-500 rounded-full"
                  />
                  <span className="font-mono font-bold">{formatTime(recordingTime)}</span>
                </div>
                
                {/* Waveform animation */}
                <div className="flex items-center gap-1 h-8">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-green-400 rounded-full"
                      animate={{ height: ['20%', '80%', '20%'] }}
                      transition={{ 
                        duration: 0.8, 
                        repeat: Infinity, 
                        delay: i * 0.05,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={isLoading ? "AgroGuardian is typing a response..." : "Ask anything or describe your crop issue..."}
                className="w-full bg-transparent border-none focus:ring-0 text-[var(--ag-text)] placeholder:text-[var(--ag-text-dim)] text-sm py-3 px-2 resize-none custom-scrollbar min-h-[44px] disabled:opacity-50"
                rows={1}
              />
            )}
          </div>
          
          {/* Mic Button */}
          <button 
            onClick={toggleRecording}
            disabled={isLoading}
            className={`p-3 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              isRecording 
                ? 'bg-red-500/20 text-red-500 dark:text-red-400 hover:bg-red-500/30' 
                : 'bg-[var(--ag-surface-high)] hover:bg-[var(--ag-hover-bg)] text-[var(--ag-text-muted)] hover:text-[var(--ag-text)]'
            }`}
          >
            {isRecording ? <Square size={20} fill="currentColor" /> : <Mic size={20} />}
          </button>
          

          {/* Send Button */}
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || isLoading}
            className={`p-3 rounded-2xl transition-all ${
              (input.trim() || attachments.length > 0) && !isLoading
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/20 cursor-pointer' 
                : 'bg-[var(--ag-surface-high)] text-[var(--ag-text-dim)] cursor-not-allowed'
            }`}
          >
            <Send size={20} className={isLoading ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>
      <div className="text-center mt-3">
        <p className="text-[10px] text-[var(--ag-text-dim)] font-medium">
          AgroGuardian AI can make mistakes. Verify important agricultural decisions.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
