import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Volume2, VolumeX, ThumbsUp, ThumbsDown, Share2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import { useAppStore } from '../../../store/useAppStore';
import { translateEnglishWordsAndNumbers } from '../../../utils/translations';
import { useTheme } from '../../../context/ThemeContext';


// Helper to strip markdown and emojis before speaking
const cleanTextForSpeech = (text) => {
  if (!text) return '';
  return text
    .replace(/🌱/g, '') // Strip 🌱 seedling emoji
    .replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '') // Strip all other emojis
    .replace(/\*+/g, '')
    .replace(/\#+/g, '')
    .replace(/\_+/g, '')
    .replace(/\`+/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '')
    .replace(/[-+*]\s+/g, ' ')
    .replace(/\d+\.\s+/g, ' ')
    .replace(/[\(\)\[\]\{\}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const AIMessage = ({ message, isStreaming }) => {
  const [feedback, setFeedback] = useState(message.feedback || null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [shared, setShared] = useState(false);
  const [collapsed, setCollapsed] = useState(feedback === 'dislike');
  const audioRef = useRef(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const activeSpeakingId = useAppStore(s => s.activeSpeakingId);
  const setActiveSpeakingId = useAppStore(s => s.setActiveSpeakingId);

  useEffect(() => {
    setCollapsed(feedback === 'dislike');
  }, [feedback]);

  // Stop synthesis on active ID change, and cleanup on unmount
  useEffect(() => {
    if (activeSpeakingId !== message.id && isSpeaking) {
      stopSpeaking();
    }
  }, [activeSpeakingId]);

  useEffect(() => {
    return () => {
      // Direct synchronous cleanup when component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stopSpeaking = () => {
    // Instantly cancel any browser synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // Instantly pause and discard any fallback audio
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
    setIsSpeaking(false);
    setActiveSpeakingId(null);
  };

  const speakWithBrowser = (cleanedText) => {
    if (!window.speechSynthesis || !cleanedText) return false;

    const lang = message.language || 'en';

    // Hindi and Kannada are regional languages. To guarantee high-quality pronunciation
    // with localized accents (which local machines lack by default), we always bypass
    // browser speech synthesis for 'hi', 'kn', 'hindi', and 'kannada' and route them to our backend gTTS fallback.
    const isRegional = lang === 'hi' || lang === 'kn' || lang === 'hindi' || lang === 'kannada';
    if (isRegional) {
      console.log(`[Speech] Regional language detected (${lang}). Routing to high-quality server-side TTS.`);
      return false;
    }

    // Instantly cancel any ongoing speech to prepare the engine
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'en-US';

    if (window.speechSynthesis.getVoices) {
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find(v => v.lang.startsWith('en'));
      if (matchingVoice) utterance.voice = matchingVoice;
    }

    // Set speaking state immediately to avoid double clicks or queuing issues
    setIsSpeaking(true);
    setActiveSpeakingId(message.id);

    utterance.onstart = () => {
      setIsSpeaking(true);
      setActiveSpeakingId(message.id);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeakingId(null);
    };

    utterance.onerror = (e) => {
      console.error('[SpeechSynthesis] Error:', e);
      setIsSpeaking(false);
      setActiveSpeakingId(null);
    };

    window.activeUtterance = utterance;

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);

    return true;
  };

  const speak = async () => {
    if (!message.text) return;

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    stopSpeaking();
    let cleanedText = cleanTextForSpeech(message.text);
    const lang = message.language || 'en';
    if (lang === 'kn' || lang === 'hi') {
      cleanedText = translateEnglishWordsAndNumbers(cleanedText, lang);
    }

    // Try browser-side Speech Synthesis first
    if (speakWithBrowser(cleanedText)) {
      return;
    }
    
    // High-performance Just-In-Time (JIT) Sequential TTS Queue
    try {
      setIsSpeaking(true);
      setActiveSpeakingId(message.id);
      
      // Split text into individual sentences (handles standard endings and Indian dandas U+0964)
      const rawSentences = cleanedText.match(/[^.!?।|:]+[.!?।|:]?\s*/g) || [cleanedText];
      const sentences = rawSentences.map(s => s.trim()).filter(s => s.length > 0);

      if (sentences.length === 0) {
        setIsSpeaking(false);
        setActiveSpeakingId(null);
        return;
      }

      let currentPlayingIndex = 0;
      const audioObjects = new Array(sentences.length).fill(null);
      const isFetching = new Array(sentences.length).fill(false);
      let isCancelled = false;

      // Wrap controls inside audioRef.current so stopSpeaking() shuts down everything
      audioRef.current = {
        pause: () => {
          isCancelled = true;
          audioObjects.forEach(audio => {
            if (audio && typeof audio.pause === 'function') {
              audio.pause();
              audio.currentTime = 0;
            }
          });
        }
      };

      // Function to fetch a specific sentence chunk by index
      const fetchChunk = async (index) => {
        if (index >= sentences.length || isCancelled || audioObjects[index] || isFetching[index]) return;
        
        isFetching[index] = true;
        try {
          const res = await fetch('http://localhost:5000/api/chatbot/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: sentences[index],
              language: message.language || 'en',
            }),
          });
          if (!res.ok) throw new Error('TTS chunk failed');
          const blob = await res.blob();
          if (isCancelled) return;
          
          audioObjects[index] = new Audio(URL.createObjectURL(blob));
          isFetching[index] = false;
          
          // Trigger the queue in case the player was waiting for this chunk
          triggerPlayQueue();
        } catch (err) {
          console.error(`Error loading TTS chunk ${index}:`, err);
          isFetching[index] = false;
          // Fallback dummy to avoid getting stuck
          audioObjects[index] = {
            play: () => Promise.resolve(),
            pause: () => {},
            paused: true,
            ended: true,
            addEventListener: (event, cb) => {
              if (event === 'ended') setTimeout(cb, 100);
            }
          };
          triggerPlayQueue();
        }
      };

      const triggerPlayQueue = () => {
        if (isCancelled) return;

        // Check if anything is currently playing
        const anyPlaying = audioObjects.some(a => a && !a.paused && !a.ended);
        if (anyPlaying) return;

        const nextAudio = audioObjects[currentPlayingIndex];
        
        if (nextAudio) {
          // Play the chunk
          const playPromise = nextAudio.play ? nextAudio.play() : Promise.resolve();
          playPromise.then(() => {
            // SUCCESS! While this sentence is playing, immediately pre-fetch the NEXT chunk JIT!
            if (currentPlayingIndex + 1 < sentences.length) {
              fetchChunk(currentPlayingIndex + 1);
            }
            
            // Set up onended event to advance to the next index
            const handleEnded = () => {
              currentPlayingIndex++;
              if (currentPlayingIndex < sentences.length) {
                // If the next chunk is not fetched yet, trigger its fetch now
                if (!audioObjects[currentPlayingIndex]) {
                  fetchChunk(currentPlayingIndex);
                } else {
                  triggerPlayQueue();
                }
              } else {
                setIsSpeaking(false);
                setActiveSpeakingId(null);
              }
            };
            
            if (nextAudio.onended !== undefined) {
              nextAudio.onended = handleEnded;
            } else if (nextAudio.addEventListener) {
              nextAudio.addEventListener('ended', handleEnded);
            }
          }).catch(err => {
            console.error("Playback error:", err);
            // Move to next chunk on error
            currentPlayingIndex++;
            if (currentPlayingIndex < sentences.length) {
              triggerPlayQueue();
            } else {
              setIsSpeaking(false);
              setActiveSpeakingId(null);
            }
          });
        } else {
          // If the current chunk is not yet fetched and not fetching, start fetching it
          if (!isFetching[currentPlayingIndex]) {
            fetchChunk(currentPlayingIndex);
          }
        }
      };

      // Start by fetching the first chunk immediately
      fetchChunk(0);

    } catch (e) {
      console.error("JIT TTS queue exception:", e);
      setIsSpeaking(false);
      setActiveSpeakingId(null);
    }
  };

  const markFeedback = (value) => {
    const next = feedback === value ? null : value;
    setFeedback(next);

    const addLikedResponse = useAppStore.getState().addLikedResponse;
    const removeLikedResponse = useAppStore.getState().removeLikedResponse;

    if (next === 'like') {
      addLikedResponse({
        id: message.id,
        text: message.text,
        time: message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: message.timestamp || Date.now(),
        predictions: message.predictions
      });
    } else {
      removeLikedResponse(message.id);
    }

    try {
      const key = 'ag_chat_feedback';
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (next) saved[message.id] = next;
      else delete saved[message.id];
      localStorage.setItem(key, JSON.stringify(saved));
    } catch {
      // Feedback is best-effort local state.
    }
  };

  const shareMessage = async () => {
    const text = message.text || '';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'AgroGuardian AI', text });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setShared(true);
      setTimeout(() => setShared(false), 1400);
    } catch {
      setShared(false);
    }
  };

  if (collapsed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-start mb-8 group w-full"
      >
        <div className="flex gap-4 max-w-[90%] md:max-w-[80%] w-full">
          <div className="flex-shrink-0 mt-1">
            <div className="w-9 h-9 rounded-xl bg-[var(--ag-surface-container)] flex items-center justify-center text-[var(--ag-text-dim)] border border-[var(--ag-border-soft)]">
              <Bot size={20} className="opacity-40" />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full text-left">
            <div className="bg-[var(--ag-surface-container)] border border-[var(--ag-border-soft)] rounded-2xl px-5 py-3 shadow-md flex flex-wrap items-center gap-3">
              <ThumbsDown size={14} className="text-red-500/60 dark:text-red-400/60" />
              <span className="text-[11px] text-[var(--ag-text-muted)] font-medium">Response hidden because you disliked it.</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCollapsed(false)}
                  className="text-[10px] text-green-600 dark:text-green-400 font-bold hover:underline cursor-pointer"
                >
                  Show response
                </button>
                <span className="text-[var(--ag-text-dim)] opacity-40">•</span>
                <button
                  onClick={() => {
                    markFeedback('dislike');
                    setCollapsed(false);
                  }}
                  className="text-[10px] text-[var(--ag-text-dim)] hover:text-[var(--ag-text-secondary)] font-semibold animate-pulse cursor-pointer"
                >
                  Reset feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="flex justify-start mb-8 group"
    >
      <div className="flex gap-4 max-w-[90%] md:max-w-[80%]">
        {/* AI Avatar Container */}
        <div className="flex-shrink-0 mt-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/20 ring-2 ring-green-500/10">
            <Bot size={20} />
          </div>
        </div>

        {/* Message Content Container */}
        <div className="flex flex-col gap-2">
          <div className="bg-[var(--ag-surface)] border border-[var(--ag-border)] rounded-[2rem] rounded-tl-none px-6 py-5 shadow-2xl relative">
            
            {/* Diagnosis Predictions (Specific to AgroGuardian) */}
            {message.predictions && (
              <div className="mb-5 space-y-2.5">
                <p className="text-[10px] text-green-600 dark:text-green-400 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
                  <Sparkles size={12} /> Neural Diagnosis
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {message.predictions.map((p, idx) => {
                    const pct = (p.confidence * 100).toFixed(1);
                    return (
                      <div key={idx} className="flex flex-col gap-2 bg-[var(--ag-surface-container)] border border-[var(--ag-border-soft)] rounded-2xl p-3.5 hover:bg-[var(--ag-hover-bg)] hover:border-green-500/30 transition-all shadow-[0_0_15px_rgba(34,197,94,0.02)]">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[var(--ag-text)] text-xs sm:text-sm truncate mr-2">{p.disease}</span>
                          <span className="text-[10px] font-mono font-extrabold text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.15)]">
                            {pct}%
                          </span>
                        </div>
                        {/* Glowing progress bar */}
                        <div className="w-full h-1.5 bg-[var(--ag-surface-high)] rounded-full overflow-hidden relative">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_8px_#22c55e]"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1.0, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Content */}
            <MarkdownRenderer content={message.text} />

            {/* Streaming Indicator */}
            {isStreaming && (
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-2 h-4 ml-1 bg-green-500 align-middle"
              />
            )}

            {/* Decorative Corner */}
            <div className="absolute -left-2 top-0 w-4 h-4 bg-transparent border-t-[16px] border-t-[var(--ag-surface)] border-l-[16px] border-l-transparent" />
          </div>

          {/* Message Metadata & Actions */}
          <div className="flex items-center gap-4 px-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="text-[10px] text-[var(--ag-text-dim)] font-medium">
              {message.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center gap-2">
              <button onClick={speak} title={isSpeaking ? 'Stop speaking' : 'Speak'} className={`p-1.5 rounded-md transition-all cursor-pointer ${isSpeaking ? 'text-red-600 dark:text-red-300 bg-red-500/10' : 'text-[var(--ag-text-dim)] hover:text-green-600 dark:hover:text-green-400 hover:bg-green-500/10'}`}>
                {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
              <button onClick={() => markFeedback('like')} title="Like" className={`p-1.5 rounded-md transition-all cursor-pointer ${feedback === 'like' ? 'text-green-700 dark:text-green-300 bg-green-500/10' : 'text-[var(--ag-text-dim)] hover:text-green-600 dark:hover:text-green-400 hover:bg-green-500/10'}`}>
                <ThumbsUp size={14} />
              </button>
              <button onClick={() => markFeedback('dislike')} title="Dislike" className={`p-1.5 rounded-md transition-all cursor-pointer ${feedback === 'dislike' ? 'text-red-600 dark:text-red-300 bg-red-500/10' : 'text-[var(--ag-text-dim)] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10'}`}>
                <ThumbsDown size={14} />
              </button>
              <button onClick={shareMessage} title={shared ? 'Copied' : 'Share'} className={`p-1.5 rounded-md transition-all cursor-pointer ${shared ? 'text-blue-600 dark:text-blue-300 bg-blue-500/10' : 'text-[var(--ag-text-dim)] hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-500/10'}`}>
                <Share2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIMessage;
