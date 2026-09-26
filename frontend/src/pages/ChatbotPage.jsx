import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, MessageSquare, FileText, Activity,
  Bot, User, Send, Paperclip, Mic, Square, X,
  Sparkles, Volume2, VolumeX, Image as ImageIcon, Play, Leaf, Info, Download, Trash2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from '../hooks/useTranslation';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../context/ThemeContext';

import ChatInput from '../components/chatbot/ChatInput';
import ChatArea from '../components/chatbot/ChatArea';


// ChatArea is now imported from components/chatbot/ChatArea

// ─── Left Sidebar ─────────────────────────────────────────────────────────────
const ChatSidebar = ({ onNewChat, conversations, activeSessionId, onSelectChat, onDeleteChat, onDownloadReport, onSelectLiked }) => {
  const [search, setSearch] = useState('');
  const user = useAppStore(s => s.user);
  const likedResponses = useAppStore(s => s.likedResponses || []);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.preview.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`w-64 shrink-0 border-r border-[var(--ag-border-soft)] flex flex-col ${isLight ? 'bg-green-500/5' : 'bg-black/20'} overflow-hidden`}>
      <div className="p-4 flex flex-col gap-3 flex-1 overflow-hidden">
        {/* New Chat */}
        <button onClick={onNewChat}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/15 group text-sm font-semibold cursor-pointer">
          <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
          New Chat
        </button>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-green-700/40' : 'text-white/25'}`} size={14} />
          <input
            type="text" placeholder="Search chats..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-[var(--ag-surface-container)] border border-[var(--ag-border-soft)] rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-green-500/40 placeholder:text-[var(--ag-text-dim)] text-[var(--ag-text)]"
          />
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-green-600 dark:text-green-400/70 font-bold mb-2 flex items-center gap-1.5">
              <Activity size={10} /> Recent Diagnoses
            </p>
            <div className="p-2.5 text-[11px] text-[var(--ag-text-dim)] italic text-center border border-dashed border-[var(--ag-border-soft)] rounded-xl">
              No recent diagnoses
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--ag-text-dim)] font-bold mb-2 flex items-center gap-1.5">
              <MessageSquare size={10} /> Conversations
            </p>
            <div className="space-y-1.5">
              {filtered.length > 0 ? filtered.map((chat) => (
                <button
                  key={chat.sessionId}
                  onClick={() => onSelectChat(chat.sessionId)}
                  className="w-full text-left p-2.5 rounded-xl border transition-all group cursor-pointer"
                  style={{
                    background: chat.sessionId === activeSessionId ? 'var(--ag-hover-bg)' : 'transparent',
                    borderColor: chat.sessionId === activeSessionId ? 'var(--ag-border)' : 'var(--ag-border-soft)'
                  }}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare size={13} className="text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[var(--ag-text)] font-semibold truncate">{chat.title}</p>
                      <p className="text-[10px] text-[var(--ag-text-dim)] truncate">{chat.preview}</p>
                    </div>
                    <Trash2
                      size={12}
                      className="text-[var(--ag-text-dim)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.sessionId); }}
                    />
                  </div>
                </button>
              )) : (
                <div className="p-2.5 text-[11px] text-[var(--ag-text-dim)] italic text-center border border-dashed border-[var(--ag-border-soft)] rounded-xl">
                  No past conversations
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-green-600 dark:text-green-400 font-bold mb-2 flex items-center gap-1.5">
              <Sparkles size={10} className="text-green-500 dark:text-green-400" /> Liked Advice
            </p>
            {likedResponses.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.06) transparent' }}>
                {likedResponses.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onSelectLiked(item)}
                    className="p-2.5 bg-[var(--ag-surface-container)] hover:bg-[var(--ag-hover-bg)] border border-[var(--ag-border-soft)] hover:border-green-500/20 rounded-xl flex flex-col gap-1 transition-all cursor-pointer group/liked text-left"
                  >
                    <div className="flex justify-between items-center text-[9px] text-[var(--ag-text-dim)]">
                      <span className="font-bold text-green-600 dark:text-green-400">SAVED TIP</span>
                      <span>{item.time}</span>
                    </div>
                    <p className="text-[11px] text-[var(--ag-text-secondary)] line-clamp-2 leading-relaxed">{item.text.replace(/\*\*|#/g, '')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2.5 text-[11px] text-[var(--ag-text-dim)] italic text-center border border-dashed border-[var(--ag-border-soft)] rounded-xl">
                No saved advice yet
              </div>
            )}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--ag-text-dim)] font-bold mb-2 flex items-center gap-1.5">
              <FileText size={10} /> Saved Reports
            </p>
            <button
              onClick={onDownloadReport}
              className="w-full p-2.5 text-[11px] text-green-700 dark:text-green-300 border border-green-500/20 bg-green-500/10 hover:bg-green-500/15 dark:hover:bg-green-500/20 rounded-xl flex items-center justify-center gap-2 font-bold cursor-pointer transition-colors"
            >
              <Download size={12} /> Download current report
            </button>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="p-3 border-t border-[var(--ag-border-soft)]">
        <div className="p-3 bg-[var(--ag-surface-container)] border border-[var(--ag-border-soft)] rounded-xl flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--ag-text)] truncate">{user?.name || 'AgroGuardian'}</p>
            <p className="text-[10px] text-green-600 dark:text-green-400 tracking-widest uppercase font-bold">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// ─── ChatbotPage (Main) ───────────────────────────────────────────────────────
const STORAGE_KEY = 'ag_chat_conversations_v2';

const createSessionId = () => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const toVoiceLocale = (lang) => {
  if (lang === 'hi') return 'hi-IN';
  if (lang === 'kn') return 'kn-IN';
  return 'en-IN';
};

const createWelcomeMessage = (t) => ({
  id: 'welcome',
  role: 'bot',
  text: t('chat.welcome') || "Hello! I'm **AgroGuardian**, your AI agricultural assistant.\n\nAsk in English, Kannada, or Hindi about crop disease, pests, weather risk, yield, schemes, soil, or irrigation. Upload an image or file when you want analysis.",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
});

const ChatbotPage = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const currentLanguage = useAppStore(s => s.chatbotLanguage);
  const autoSpeak = useAppStore(s => s.autoSpeak);
  const setAutoSpeak = useAppStore(s => s.setAutoSpeak);
  const setActiveSpeakingId = useAppStore(s => s.setActiveSpeakingId);

  const [messages, setMessages] = useState(() => [createWelcomeMessage(t)]);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('ag_active_chat_session') || createSessionId());
  const [conversations, setConversations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeLikedResponse, setActiveLikedResponse] = useState(null);


  // Mount debug
  useEffect(() => {
    console.log('[ChatbotPage] mounted');
    return () => console.log('[ChatbotPage] unmounted');
  }, []);

  useEffect(() => {
    localStorage.setItem('ag_active_chat_session', sessionId);
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    const meaningful = messages.filter(m => m.id !== 'welcome');
    if (meaningful.length === 0) return;

    setConversations(prev => {
      const firstUser = meaningful.find(m => m.role === 'user')?.text || 'New AgroGuardian chat';
      const preview = meaningful[meaningful.length - 1]?.text || '';
      const next = {
        sessionId,
        title: firstUser.slice(0, 48),
        preview: preview.slice(0, 80),
        updatedAt: new Date().toISOString(),
        messages
      };
      return [next, ...prev.filter(c => c.sessionId !== sessionId)].slice(0, 20);
    });
  }, [messages, sessionId]);

  const handleNewChat = () => {
    const nextSession = createSessionId();
    setSessionId(nextSession);
    setMessages([{
      id: Date.now().toString(),
      role: 'bot',
      text: "New session started. Ask me anything about your farm in English, Kannada, or Hindi.",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    }]);
  };

  const handleSelectChat = (selectedSessionId) => {
    const chat = conversations.find(c => c.sessionId === selectedSessionId);
    if (!chat) return;
    setSessionId(selectedSessionId);
    setMessages(chat.messages?.length ? chat.messages : [createWelcomeMessage(t)]);
  };

  const handleDeleteChat = (selectedSessionId) => {
    setConversations(prev => prev.filter(c => c.sessionId !== selectedSessionId));
    if (selectedSessionId === sessionId) handleNewChat();
  };

  const handleDownloadReport = () => {
    const report = [
      'AgroGuardian AI Conversation Report',
      `Generated: ${new Date().toLocaleString()}`,
      `Session: ${sessionId}`,
      '',
      ...messages.map(m => `${m.role === 'user' ? 'Farmer' : 'AgroGuardian'}: ${m.text || ''}`)
    ].join('\n\n');
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agroguardian-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async ({ text, attachments }) => {
    const hasImage = attachments?.some(a => a.type === 'image');
    const documentAttachment = attachments?.find(a => a.type === 'document' || a.type === 'audio');
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: text || (hasImage ? 'Uploaded an image for analysis.' : 'Uploaded a file for analysis.'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    };
    if (hasImage) userMsg.image = attachments.find(a => a.type === 'image').preview;

    setMessages(p => [...p, userMsg]);
    setIsLoading(true);

    const addBot = (text, extra = {}) => {
      setMessages(p => [...p, {
        id: Date.now().toString() + Math.random(),
        role: 'bot', text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        ...extra
      }]);
    };

    try {
      if (hasImage) {
        const fd = new FormData();
        fd.append('image', attachments.find(a => a.type === 'image').file);
        fd.append('session_id', sessionId);
        const res = await fetch('http://localhost:5000/api/chatbot/image', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) addBot(data.data.explanation || data.data.message, { predictions: data.data.predictions || data.data.top_predictions, language: currentLanguage });
        else addBot('Failed to process the image. Please ensure it is a clear crop photo.');
      } else if (documentAttachment?.file) {
        const fd = new FormData();
        fd.append('file', documentAttachment.file);
        fd.append('query', text || 'Analyze this uploaded file for my farm.');
        fd.append('session_id', sessionId);
        const res = await fetch('http://localhost:5000/api/chatbot/file', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) addBot(data.data.response, { language: data.data.language });
        else addBot('Failed to analyze the file. Try a clear image, text, or CSV file.');
      } else {
        const res = await fetch('http://localhost:5000/api/chatbot/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text, session_id: sessionId })
        });
        const data = await res.json();
        if (data.success) addBot(data.data.response, { language: data.data.language });
        else addBot('I encountered an issue. Please try again.');
      }
    } catch {
      addBot('Connection error. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // CRITICAL: No fixed/absolute/h-screen — purely relative flex that lives
    // inside AppShell's <main> flex column
    <div className="relative flex flex-1 min-h-0 w-full overflow-hidden rounded-xl border border-[var(--ag-border)] bg-[var(--ag-surface-low)]">

      {/* Subtle background — pointer-events-none so it NEVER blocks clicks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 rounded-xl">
        <div className="absolute top-0 left-0 w-72 h-72 bg-green-900/8 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-emerald-900/6 blur-[80px] rounded-full" />
      </div>

      {/* Left Sidebar */}
      <div className="hidden lg:flex z-10 relative">
        <ChatSidebar
          onNewChat={handleNewChat}
          conversations={conversations}
          activeSessionId={sessionId}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onDownloadReport={handleDownloadReport}
          onSelectLiked={setActiveLikedResponse}
        />
      </div>

      {/* Center: Chat Feed + Input */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Header */}
        <div className="shrink-0 px-5 py-3.5 border-b border-[var(--ag-border-soft)] flex items-center gap-3 bg-[var(--ag-surface-container)]">
          <div className="p-2 bg-green-500/10 rounded-xl border border-green-500/20">
            <Sparkles size={18} className="text-green-500 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[var(--ag-text)] leading-tight">Agri-AI Assistant</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              <span className="text-[10px] text-[var(--ag-text-dim)] font-medium tracking-widest uppercase">System Online • v3.0</span>
            </div>
          </div>
          <button
            onClick={handleDownloadReport}
            className="ml-auto p-2 rounded-xl bg-[var(--ag-surface-high)] hover:bg-[var(--ag-hover-bg)] text-[var(--ag-text-muted)] hover:text-green-600 dark:hover:text-green-300 transition-all cursor-pointer"
            title="Download report"
          >
            <Download size={16} />
          </button>
        </div>

        {/* Messages */}
        <ChatArea messages={messages} isLoading={isLoading} isStreaming={isStreaming} />

        {/* Input */}
        <div className="shrink-0 px-4 pb-4 pt-2">
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Right Context Panel removed - Chatbot screen fully extended */}

      {/* Liked Response Modal */}
      <AnimatePresence>
        {activeLikedResponse && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-2xl overflow-hidden shadow-2xl z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-[var(--ag-border-soft)] bg-[var(--ag-surface-container)] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-green-600 dark:text-green-400" />
                  <h3 className="text-sm font-bold text-[var(--ag-text)]">Saved AI Advice</h3>
                </div>
                <span className="text-[10px] text-[var(--ag-text-dim)]">{activeLikedResponse.time}</span>
              </div>
              
              {/* Body */}
              <div className="p-6 max-h-[350px] overflow-y-auto custom-scrollbar text-sm text-[var(--ag-text-secondary)] leading-relaxed space-y-4 text-left">
                {activeLikedResponse.predictions && (
                  <div className="p-3.5 bg-[var(--ag-surface-container)] border border-[var(--ag-border-soft)] rounded-xl space-y-1.5 mb-2">
                    <p className="text-[9px] font-extrabold uppercase text-green-600 dark:text-green-400 tracking-wider">Classification Accuracy</p>
                    {activeLikedResponse.predictions.map((p, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[var(--ag-text)]">{p.disease}</span>
                        <span className="font-mono text-green-600 dark:text-green-400 font-bold">{(p.confidence*100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="markdown-body text-[var(--ag-text-secondary)]">
                  <ReactMarkdown>{activeLikedResponse.text}</ReactMarkdown>
                </div>
              </div>
              
              {/* Footer */}
              <div className="p-4 bg-[var(--ag-surface-container)] border-t border-[var(--ag-border-soft)] flex justify-end gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeLikedResponse.text);
                    toast.success("Advice copied to clipboard!");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-green-500/10 hover:bg-green-500/25 text-green-700 dark:text-green-400 border border-green-500/20 transition-all cursor-pointer"
                >
                  Copy Advice
                </button>
                <button
                  onClick={() => setActiveLikedResponse(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--ag-surface-high)] hover:bg-[var(--ag-hover-bg)] text-[var(--ag-text-secondary)] border border-[var(--ag-border-soft)] transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatbotPage;
