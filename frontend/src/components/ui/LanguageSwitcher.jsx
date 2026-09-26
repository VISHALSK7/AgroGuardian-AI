import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';

const LANGUAGES = [
  { code:'en', label:'EN',    name:'English' },
  { code:'kn', label:'ಕನ್ನಡ', name:'Kannada' },
  { code:'hi', label:'हि',    name:'Hindi'   },
];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useAppStore();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
        style={{ background:'rgba(38,43,41,0.7)', border:'1px solid rgba(42,56,41,0.4)', color:'#22c55e', minWidth:52 }}
        aria-label="Switch language"
      >
        <span style={{ fontSize:13 }}>🌐</span>
        <span>{current.label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity:0, y:-8, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-8, scale:0.96 }} transition={{ duration:0.14 }}
            className="absolute right-0 top-10 rounded-xl z-50 overflow-hidden"
            style={{ background:'#181d1a', border:'1px solid rgba(42,56,41,0.5)', boxShadow:'0 16px 40px rgba(0,0,0,0.45)', minWidth:135 }}
          >
            {LANGUAGES.map((lang) => (
              <button key={lang.code}
                onClick={() => { setLanguage(lang.code); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors"
                style={{
                  background: language === lang.code ? 'rgba(34,197,94,0.1)' : 'transparent',
                  color:      language === lang.code ? '#22c55e' : '#96a899',
                  fontWeight: language === lang.code ? 600 : 400,
                  fontSize:   13,
                }}
                onMouseEnter={(e) => { if (language !== lang.code) e.currentTarget.style.background='#1c211e'; }}
                onMouseLeave={(e) => { if (language !== lang.code) e.currentTarget.style.background='transparent'; }}
              >
                <span>{lang.label}</span>
                <span className="text-[11px]" style={{ color:'#6a8070' }}>{lang.name}</span>
                {language === lang.code && <span className="ml-auto text-[10px]" style={{ color:'#22c55e' }}>✓</span>}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
