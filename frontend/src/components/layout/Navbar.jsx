import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Search, Sun, Moon, ChevronDown, User, Settings, LogOut, X, Globe } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SEARCH_ROUTES = [
  { label: 'Dashboard',                path: '/dashboard',           keywords: ['home','dashboard','overview','stats'] },
  { label: 'Disease Detection',        path: '/dashboard/disease',   keywords: ['disease','leaf','crop','scan','photo','detection','image'] },
  { label: 'Weather & Disease Spread', path: '/dashboard/weather',   keywords: ['weather','rain','temperature','humidity','climate','disease','spread','risk','prediction'] },
  { label: 'Gov. Schemes',             path: '/dashboard/schemes',   keywords: ['scheme','government','pm kisan','subsidy','insurance','kcc','fasal bima'] },
  { label: 'History',                  path: '/dashboard/history',   keywords: ['history','past','previous','scan'] },
  { label: 'Profile',                  path: '/dashboard/profile',   keywords: ['profile','account','settings','name','email'] },
];

const Navbar = ({ title }) => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAppStore();
  const globalLanguage = useAppStore((s) => s.language);
  const navigate = useNavigate();

  const isLight = theme === 'light';

  // Derive colours from theme
  const navBg        = isLight ? 'rgba(255,255,255,0.96)'  : 'rgba(12,18,16,0.95)';
  const navBorder    = isLight ? 'rgba(34,197,94,0.15)'    : 'rgba(42,56,41,0.35)';
  const iconBg       = isLight ? 'rgba(34,197,94,0.07)'    : 'rgba(38,43,41,0.7)';
  const iconBorderC  = isLight ? 'rgba(34,197,94,0.2)'     : 'rgba(42,56,41,0.4)';
  const iconColor    = isLight ? '#3d6144'                  : '#7a9080';
  const inputBg      = isLight ? '#ffffff'                  : 'rgba(26,31,28,0.8)';
  const inputBorder  = isLight ? 'rgba(34,197,94,0.2)'     : 'rgba(42,56,41,0.5)';
  const inputColor   = isLight ? '#152318'                  : '#c8d5ca';
  const dropBg       = isLight ? '#ffffff'                  : '#181d1a';
  const dropBorder   = isLight ? 'rgba(34,197,94,0.15)'    : 'rgba(42,56,41,0.5)';
  const dropText     = isLight ? '#152318'                  : '#c8d5ca';
  const dropMuted    = isLight ? '#5a7d5f'                  : '#6a8070';
  const dropHover    = isLight ? '#f0f7f2'                  : '#1c211e';
  const profileBtnBg = isLight ? 'rgba(34,197,94,0.07)'    : 'rgba(26,31,28,0.7)';

  const [profileOpen, setProfileOpen]   = useState(false);
  const [notifOpen,   setNotifOpen]     = useState(false);
  const [langOpen,    setLangOpen]      = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef(null);
  const notifRef   = useRef(null);
  const langRef    = useRef(null);
  const searchRef  = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current   && !notifRef.current.contains(e.target))   setNotifOpen(false);
      if (langRef.current    && !langRef.current.contains(e.target))    setLangOpen(false);
      if (searchRef.current  && !searchRef.current.contains(e.target))  setSearchFocused(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    api.get('/auth/notifications')
      .then((r) => setNotifications(r.data.data || []))
      .catch(() => setNotifications([]));
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) { setSearchResults([]); return; }
    setSearchResults(SEARCH_ROUTES.filter(
      (r) => r.label.toLowerCase().includes(q) || r.keywords.some((k) => k.includes(q))
    ));
  }, [searchQuery]);

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchQuery('');
    setSearchResults([]);
    setSearchFocused(false);
  };

  const iconBtn = `w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150`;
  const iconBtnStyle = { background: iconBg, border: `1px solid ${iconBorderC}`, color: iconColor };

  return (
    <header className="flex items-center h-[60px] px-5 gap-3 flex-shrink-0 z-30"
      style={{ background: navBg, backdropFilter:'blur(24px)', borderBottom:`1px solid ${navBorder}`, transition:'background 0.3s ease' }}>
      <h1 className="font-semibold text-sm leading-none flex-1 min-w-0 truncate"
        style={{ color: isLight ? '#152318' : '#e8eee9', letterSpacing:'-0.01em', transition:'color 0.3s ease' }}>{title}</h1>

      {/* ── Search ── */}
      <div className="relative hidden lg:flex items-center" ref={searchRef} style={{ flexShrink:0 }}>
        <Search size={13} className="absolute left-3 z-10 pointer-events-none" style={{ color:'#6a8070' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setSearchFocused(true); }}
          onFocus={() => setSearchFocused(true)}
          onKeyDown={(e) => {
            if (e.key==='Enter' && searchResults.length>0) handleSearchSelect(searchResults[0].path);
            if (e.key==='Escape') { setSearchQuery(''); setSearchFocused(false); }
          }}
          placeholder="Search pages..."
          className="text-xs rounded-lg outline-none"
          style={{
            paddingLeft:'2rem', paddingRight: searchQuery ? '2rem' : '0.75rem',
            paddingTop:'0.4375rem', paddingBottom:'0.4375rem',
            background: inputBg,
            border:`1px solid ${searchFocused ? 'rgba(34,197,94,0.35)' : inputBorder}`,
            color: inputColor, width: searchFocused ? 240 : 200,
            boxShadow: searchFocused ? '0 0 0 3px rgba(34,197,94,0.08)' : 'none',
            transition:'all 0.2s ease',
          }}
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(''); setSearchResults([]); }}
            className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'#6a8070' }}>
            <X size={12} />
          </button>
        )}
        <AnimatePresence>
          {searchFocused && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity:0, y:-6, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }}
              exit={{ opacity:0, y:-6, scale:0.97 }} transition={{ duration:0.13 }}
              className="absolute top-11 left-0 w-64 rounded-xl z-50 overflow-hidden"
              style={{ background: dropBg, border: `1px solid ${dropBorder}`, boxShadow:'0 16px 48px rgba(0,0,0,0.3)' }}>
              {searchResults.map((r) => (
                <button key={r.path} onClick={() => handleSearchSelect(r.path)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-xs transition-colors"
                  style={{ color: dropText }}
                  onMouseEnter={(e) => { e.currentTarget.style.background=dropHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; }}>
                  <Search size={11} style={{ color: dropMuted, flexShrink:0 }} />
                  {r.label}
                </button>
              ))}
            </motion.div>
          )}
          {searchFocused && searchQuery && searchResults.length === 0 && (
            <motion.div
              initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="absolute top-11 left-0 w-64 rounded-xl z-50 px-4 py-3 text-xs"
              style={{ background: dropBg, border: `1px solid ${dropBorder}`, color: dropMuted }}>
              No pages found for "{searchQuery}"
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Theme toggle */}
        <button onClick={toggleTheme} className={iconBtn} style={iconBtnStyle} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>

        {/* Entire Website Language Dropdown */}
        <div className="relative" ref={langRef}>
          <button onClick={() => { setLangOpen(!langOpen); setProfileOpen(false); setNotifOpen(false); }}
            className={iconBtn} style={iconBtnStyle} aria-label="Select website language" title="Translate Website">
            <Globe size={14} />
          </button>
          <AnimatePresence>
            {langOpen && (
              <motion.div
                initial={{ opacity:0, y:-8, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, y:-8, scale:0.96 }} transition={{ duration:0.15 }}
                className="absolute right-0 top-11 w-36 rounded-xl z-50 overflow-hidden"
                style={{ background: dropBg, border: `1px solid ${dropBorder}`, boxShadow:'0 16px 48px rgba(0,0,0,0.3)' }}>
                <div className="py-1">
                  {[
                    { code: 'en', label: 'English' },
                    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
                    { code: 'hi', label: 'हिंदी (Hindi)' }
                  ].map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        const setLanguage = useAppStore.getState().setLanguage;
                        if (setLanguage) setLanguage(lang.code);
                        setLangOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors text-left"
                      style={{ 
                        color: globalLanguage === lang.code ? '#22c55e' : dropMuted, 
                        fontWeight: globalLanguage === lang.code ? 'bold' : 'normal' 
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background=dropHover; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className={`${iconBtn} relative`} style={iconBtnStyle} aria-label="Notifications">
            <Bell size={14} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background:'#22c55e' }} />
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity:0, y:-8, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, y:-8, scale:0.96 }} transition={{ duration:0.15 }}
                className="absolute right-0 top-11 w-72 rounded-xl z-50 overflow-hidden"
                style={{ background: dropBg, border: `1px solid ${dropBorder}`, boxShadow:'0 16px 48px rgba(0,0,0,0.3)' }}>
                <div className="px-4 py-3" style={{ borderBottom:`1px solid ${dropBorder}` }}>
                  <p className="text-xs font-semibold" style={{ color: dropText }}>Notifications</p>
                </div>
                {notifications.length === 0
                  ? <p className="px-4 py-8 text-xs text-center" style={{ color: dropMuted }}>No notifications yet</p>
                  : <div className="py-1 max-h-64 overflow-y-auto">
                      {notifications.map((n, i) => (
                        <div key={n.id||n._id||i} className="flex gap-3 px-4 py-2.5 cursor-pointer"
                          onMouseEnter={(e) => { e.currentTarget.style.background='#1c211e'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; }}>
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: n.type==='danger'?'#f87171':n.type==='warning'?'#fbbf24':'#22c55e' }} />
                          <div>
                            <p className="text-xs leading-snug" style={{ color:'#c8d5ca' }}>{n.text||n.message}</p>
                            <p className="text-[11px] mt-0.5" style={{ color:'#6a8070' }}>{n.time||n.created_at}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                }
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg cursor-pointer transition-all"
            style={{ background: profileOpen ? (isLight ? 'rgba(34,197,94,0.1)' : 'rgba(38,43,41,0.9)') : profileBtnBg, border: `1px solid ${dropBorder}` }}>
            {user?.avatar_url
              ? <img src={user.avatar_url} alt="avatar" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
              : <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white' }}>
                  {user?.name?.[0]?.toUpperCase() || 'F'}
                </div>
            }
            <span className="text-xs font-medium hidden md:block" style={{ color: isLight ? '#152318' : '#c8d5ca', maxWidth:96 }}>
              {(user?.name || 'Farmer').split(' ')[0]}
            </span>
            <ChevronDown size={12} style={{ color:'#6a8070', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s' }} />
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity:0, y:-8, scale:0.96 }} animate={{ opacity:1, y:0, scale:1 }}
                exit={{ opacity:0, y:-8, scale:0.96 }} transition={{ duration:0.15 }}
                className="absolute right-0 top-11 w-52 rounded-xl z-50 overflow-hidden"
                style={{ background: dropBg, border: `1px solid ${dropBorder}`, boxShadow:'0 16px 48px rgba(0,0,0,0.3)' }}>
                <div className="px-3.5 py-3" style={{ borderBottom:`1px solid ${dropBorder}` }}>
                  <p className="text-xs font-semibold" style={{ color: dropText }}>{user?.name || 'Farmer'}</p>
                  <p className="text-[11px] mt-0.5 truncate" style={{ color: dropMuted }}>{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { navigate('/dashboard/profile'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors text-left"
                    style={{ color: dropMuted }}
                    onMouseEnter={(e) => { e.currentTarget.style.background=dropHover; e.currentTarget.style.color=dropText; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=dropMuted; }}>
                    <User size={13} /> Profile
                  </button>
                  <button
                    onClick={() => { navigate('/dashboard/settings'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors text-left"
                    style={{ color: dropMuted }}
                    onMouseEnter={(e) => { e.currentTarget.style.background=dropHover; e.currentTarget.style.color=dropText; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=dropMuted; }}>
                    <Settings size={13} /> Settings
                  </button>
                </div>
                <div style={{ borderTop:`1px solid ${dropBorder}` }}>
                  <button
                    onClick={() => { logout(); navigate('/login'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs transition-colors text-left"
                    style={{ color:'#f87171' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background='rgba(248,113,113,0.06)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; }}>
                    <LogOut size={13} /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
