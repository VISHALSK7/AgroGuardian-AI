import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Square } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { translateEnglishWordsAndNumbers } from '../../utils/translations';


const VoicePlayer = ({ textToSpeak, label = 'Listen Result' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const appLanguage = useAppStore((s) => s.language) || 'en';
  const audioRef = useRef(null);

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        if ('currentTime' in audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      } catch (err) {
        console.error("Error stopping audio:", err);
      }
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopSpeaking();
      return;
    }

    let cleanText = textToSpeak
      .replace(/\*\*/g, '')
      .replace(/•/g, '')
      .replace(/🌱/g, '')
      .trim();

    if (!cleanText) return;

    if (appLanguage === 'kn' || appLanguage === 'hi') {
      cleanText = translateEnglishWordsAndNumbers(cleanText, appLanguage);
    }


    const isRegional = appLanguage === 'kn' || appLanguage === 'hi';

    if (!isRegional) {
      // Browser TTS fallback for English
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      const utt = new SpeechSynthesisUtterance(cleanText);
      utt.lang = 'en-US';
      utt.rate = 0.95;
      utt.onend = () => setIsPlaying(false);
      utt.onerror = () => setIsPlaying(false);
      
      setIsPlaying(true);
      window.speechSynthesis.speak(utt);
    } else {
      // High-quality Backend TTS for Kannada and Hindi
      try {
        setIsPlaying(true);
        const res = await fetch('http://localhost:5000/api/chatbot/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            language: appLanguage,
          }),
        });

        if (!res.ok) throw new Error('TTS failed');
        const blob = await res.blob();
        
        const audio = new Audio(URL.createObjectURL(blob));
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };
        audio.onerror = () => {
          setIsPlaying(false);
          audioRef.current = null;
        };

        audio.play();
      } catch (err) {
        console.error("Regional TTS Error:", err);
        setIsPlaying(false);
        // Fallback to browser synthesis if backend fails
        if ('speechSynthesis' in window) {
          const utt = new SpeechSynthesisUtterance(cleanText);
          utt.lang = appLanguage === 'kn' ? 'kn-IN' : 'hi-IN';
          utt.onend = () => setIsPlaying(false);
          utt.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utt);
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return (
    <motion.button
      onClick={handleTogglePlay}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
        isPlaying 
          ? 'bg-green-500/10 border-green-500/30 text-green-400' 
          : 'bg-[#181d1a] border-[#2a3829] text-[#96a899] hover:border-green-500/20 hover:text-green-400'
      }`}
      style={{
        background: isPlaying ? 'rgba(34,197,94,0.1)' : 'rgba(24,29,26,0.8)',
        borderColor: isPlaying ? 'rgba(34,197,94,0.3)' : 'rgba(42,56,41,0.5)',
        color: isPlaying ? '#4be277' : '#96a899',
        boxShadow: isPlaying ? '0 0 12px rgba(34,197,94,0.15)' : 'none'
      }}
    >
      {isPlaying ? <Square size={13} className="text-red-400" style={{ color: '#f87171' }} /> : <Volume2 size={13} />}
      
      <span className="text-[11px] font-semibold tracking-wide">
        {isPlaying ? 'PLAYING...' : label}
      </span>

      {/* Waveform Animation */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="flex items-center gap-[2px] ml-1 h-3 overflow-hidden"
          >
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{ background: '#22c55e', minHeight: '3px' }}
                animate={{ height: ['3px', '10px', '3px'] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default VoicePlayer;
