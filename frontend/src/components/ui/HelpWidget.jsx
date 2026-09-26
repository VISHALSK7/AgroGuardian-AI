import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, X, BookOpen, MessageCircle, ChevronDown, ChevronUp,
  UserPlus, Camera, Cloud, BarChart3, FileText, Bot, CheckCircle2,
} from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const STEP_ICONS   = [UserPlus, Camera, Cloud, BarChart3, FileText, Bot];
const STEP_COLORS  = ['#22c55e','#63b3ed','#fbbf24','#a78bfa','#f87171','#22c55e'];
const STEP_KEYS    = [
  ['help.step1Title','help.step1Desc'],
  ['help.step2Title','help.step2Desc'],
  ['help.step3Title','help.step3Desc'],
  ['help.step4Title','help.step4Desc'],
  ['help.step5Title','help.step5Desc'],
  ['help.step6Title','help.step6Desc'],
];
const FAQ_KEYS = [
  ['help.faq1Q','help.faq1A'],
  ['help.faq2Q','help.faq2A'],
  ['help.faq3Q','help.faq3A'],
];

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden" style={{ border:'1px solid rgba(42,56,41,0.4)', marginBottom:8 }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3.5 text-left"
        style={{ background: open ? 'rgba(34,197,94,0.06)' : 'rgba(20,26,22,0.6)' }}
      >
        <span className="text-[13px] font-semibold pr-4" style={{ color:'#dfe4e0' }}>{q}</span>
        {open
          ? <ChevronUp   size={14} style={{ color:'#22c55e', flexShrink:0 }} />
          : <ChevronDown size={14} style={{ color:'#6a8070', flexShrink:0 }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
            style={{ overflow:'hidden' }}
          >
            <p className="px-3.5 pb-3.5 text-[12px] leading-relaxed" style={{ color:'#96a899' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HelpWidget = ({ onAskAssistant }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [tab, setTab]   = useState('guide');

  return (
    <>
      {/* ── Floating Button ─────────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale:1.08 }} whileTap={{ scale:0.94 }}
        onClick={() => setOpen(true)}
        className="fixed z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl"
        style={{
          bottom:96, right:24,
          background:'linear-gradient(135deg,#1a2b1f,#1c2f22)',
          border:'1px solid rgba(34,197,94,0.35)',
          color:'#22c55e',
          boxShadow:'0 8px 30px rgba(34,197,94,0.18)',
        }}
        aria-label="Help"
      >
        <HelpCircle size={16} />
        <span className="text-[12px] font-bold">{t('help.title')}</span>
      </motion.button>

      {/* ── Panel ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 z-50"
              style={{ background:'rgba(0,0,0,0.55)', backdropFilter:'blur(4px)' }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity:0, x:60, scale:0.97 }}
              animate={{ opacity:1, x:0,  scale:1 }}
              exit={{ opacity:0,  x:60, scale:0.97 }}
              transition={{ type:'spring', stiffness:300, damping:28 }}
              className="fixed z-50 flex flex-col"
              style={{
                right:24, top:72, bottom:24,
                width:380, maxWidth:'calc(100vw - 48px)',
                background:'#0f1412',
                border:'1px solid rgba(42,56,41,0.5)',
                borderRadius:20,
                boxShadow:'0 32px 80px rgba(0,0,0,0.6)',
                overflow:'hidden',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                style={{ borderBottom:'1px solid rgba(42,56,41,0.35)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)' }}>
                    <HelpCircle size={18} style={{ color:'#22c55e' }} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold" style={{ color:'#e8eee9' }}>{t('help.title')}</p>
                    <p className="text-[11px]" style={{ color:'#6a8070' }}>{t('help.subtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ background:'rgba(38,43,41,0.8)', color:'#6a8070' }}
                  onMouseEnter={(e)=>{ e.currentTarget.style.color='#e8eee9'; }}
                  onMouseLeave={(e)=>{ e.currentTarget.style.color='#6a8070'; }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Ask-assistant banner */}
              <div className="px-5 pt-4 flex-shrink-0">
                <button
                  onClick={() => { setOpen(false); onAskAssistant?.(); }}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all"
                  style={{ background:'linear-gradient(135deg,rgba(34,197,94,0.12),rgba(22,163,74,0.08))', border:'1px solid rgba(34,197,94,0.25)' }}
                  onMouseEnter={(e)=>{ e.currentTarget.style.borderColor='rgba(34,197,94,0.5)'; }}
                  onMouseLeave={(e)=>{ e.currentTarget.style.borderColor='rgba(34,197,94,0.25)'; }}
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(34,197,94,0.18)' }}>
                    <MessageCircle size={16} style={{ color:'#22c55e' }} />
                  </div>
                  <div className="text-left">
                    <p className="text-[13px] font-bold" style={{ color:'#22c55e' }}>{t('help.askAssistant')}</p>
                    <p className="text-[11px]" style={{ color:'#6a8070' }}>Chat with AI about your farm</p>
                  </div>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex px-5 pt-4 gap-2 flex-shrink-0">
                {[['guide', BookOpen, t('help.guideTitle')], ['faq', HelpCircle, t('help.faqTitle')]].map(([id, Icon, label]) => (
                  <button key={id} onClick={() => setTab(id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-all flex-1 justify-center"
                    style={{
                      background: tab===id ? 'rgba(34,197,94,0.12)' : 'rgba(26,31,28,0.7)',
                      color:      tab===id ? '#22c55e' : '#6a8070',
                      border:`1px solid ${tab===id ? 'rgba(34,197,94,0.3)' : 'rgba(42,56,41,0.4)'}`,
                    }}>
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                {tab === 'guide' ? (
                  <div className="space-y-3">
                    {STEP_KEYS.map(([titleKey, descKey], i) => {
                      const Icon  = STEP_ICONS[i];
                      const color = STEP_COLORS[i];
                      return (
                        <motion.div key={i}
                          initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                          transition={{ delay:i*0.055, type:'spring', stiffness:300, damping:26 }}
                          className="flex gap-3.5 p-3.5 rounded-xl"
                          style={{ background:'rgba(20,26,22,0.7)', border:'1px solid rgba(42,56,41,0.3)' }}
                        >
                          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background:`${color}18`, border:`1px solid ${color}30` }}>
                              <Icon size={15} style={{ color }} />
                            </div>
                            <span className="text-[10px] font-black" style={{ color:`${color}90` }}>
                              {String(i+1).padStart(2,'0')}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-bold mb-1" style={{ color:'#dfe4e0' }}>{t(titleKey)}</p>
                            <p className="text-[12px] leading-relaxed" style={{ color:'#96a899' }}>{t(descKey)}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                    <div className="flex items-center gap-3 p-3.5 rounded-xl mt-2"
                      style={{ background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.2)' }}>
                      <CheckCircle2 size={20} style={{ color:'#22c55e', flexShrink:0 }} />
                      <p className="text-[12px] leading-relaxed" style={{ color:'#96a899' }}>
                        You're all set! Use the AI chatbot or contact support for further help.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {FAQ_KEYS.map(([qKey,aKey], i) => (
                      <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}>
                        <FAQItem q={t(qKey)} a={t(aKey)} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 flex-shrink-0" style={{ borderTop:'1px solid rgba(42,56,41,0.25)' }}>
                <p className="text-center text-[11px]" style={{ color:'#4a6050' }}>
                  AgroGuardian AI · Smart Farming Platform
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpWidget;
