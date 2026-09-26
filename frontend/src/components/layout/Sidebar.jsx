import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Leaf, Cloud, FileText,
  History, User, ChevronLeft, ChevronRight, Sprout, LogOut, Settings, Sparkles
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { key:'dashboard',        path:'/dashboard',         Icon:LayoutDashboard },
  { key:'diseaseDetection', path:'/dashboard/disease', Icon:Leaf },
  { key:'weatherDisease',   path:'/dashboard/weather', Icon:Cloud },
  { key:'schemes',          path:'/dashboard/schemes', Icon:FileText },
  { key:'history',          path:'/dashboard/history', Icon:History },
  { key:'chatbotAssistant', path:'/dashboard/chatbot', Icon:Sparkles },
  { key:'profile',          path:'/dashboard/profile', Icon:User },
];

const Sidebar = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, toggleSidebar, user, logout } = useAppStore();

  const isLight = theme === 'light';

  const isActive = (path) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path);

  const sidebarBg    = isLight ? '#ffffff'               : '#0c1210';
  const borderColor  = isLight ? 'rgba(34,197,94,0.15)'  : 'rgba(42,56,41,0.4)';
  const textMuted    = isLight ? '#5a7d5f'                : '#6a8070';
  const textMain     = isLight ? '#152318'                : '#c8d5ca';
  const textDim      = isLight ? '#3d6144'                : '#4a6050';
  const hoverBg      = isLight ? 'rgba(34,197,94,0.07)'  : 'rgba(42,56,41,0.25)';
  const hoverText    = isLight ? '#16a34a'                : '#c8d5ca';
  const userCardBg   = isLight ? 'rgba(34,197,94,0.06)'  : 'rgba(26,31,28,0.6)';
  const collapseBtnBg= isLight ? '#edf6ee'               : '#1c211e';
  const collapseBtnBorder = isLight ? 'rgba(34,197,94,0.2)' : 'rgba(42,56,41,0.5)';

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 60 : 228 }}
      transition={{ duration:0.28, ease:[0.4,0,0.2,1] }}
      className="relative flex flex-col h-full flex-shrink-0 overflow-hidden"
      style={{ background: sidebarBg, borderRight: `1px solid ${borderColor}`, transition: 'background 0.3s ease' }}
    >
      {/* Logo */}
      <div className="flex items-center h-[60px] px-3.5 flex-shrink-0"
        style={{ borderBottom: `1px solid ${borderColor}` }}>
        <motion.div
          whileHover={{ rotate:[0,-10,10,0], scale:1.08 }} transition={{ duration:0.4 }}
          className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
          style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>
          <Sprout size={16} color="white" strokeWidth={2.5} />
        </motion.div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-10 }} transition={{ duration:0.2 }}
              className="ml-2.5 overflow-hidden">
              <span className="font-bold text-[13px] whitespace-nowrap tracking-tight" style={{ color: textMain }}>
                AgroGuardian <span style={{ color:'#22c55e' }}>AI</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2">
        <motion.ul
          initial="hidden" animate="visible"
          variants={{ hidden:{}, visible:{ transition:{ staggerChildren:0.055, delayChildren:0.1 } } }}
          className="space-y-0.5">
          {NAV_ITEMS.map(({ key, path, Icon }) => {
            const active = isActive(path);
            return (
              <motion.li key={key}
                variants={{ hidden:{ opacity:0, x:-12 }, visible:{ opacity:1, x:0, transition:{ type:'spring', stiffness:300, damping:24 } } }}>
                <Link to={path} title={sidebarCollapsed ? t(key) : undefined}
                  className="group flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all duration-150 relative overflow-hidden"
                  style={{
                    background: active
                      ? isLight
                        ? 'linear-gradient(135deg,rgba(34,197,94,0.1),rgba(22,163,74,0.05))'
                        : 'linear-gradient(135deg,rgba(34,197,94,0.12),rgba(22,163,74,0.07))'
                      : 'transparent',
                    border: active ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
                    color: active ? '#22c55e' : textMuted,
                  }}
                  onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background=hoverBg; e.currentTarget.style.color=hoverText; } }}
                  onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=textMuted; } }}
                >
                  {active && (
                    <motion.div layoutId="nav-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ background:'#22c55e' }}
                      transition={{ type:'spring', stiffness:400, damping:32 }} />
                  )}
                  <Icon size={16} strokeWidth={active ? 2.5 : 2} className="flex-shrink-0 transition-all"
                    style={{ color: active ? '#22c55e' : 'inherit' }} />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                        exit={{ opacity:0, x:-8 }} transition={{ duration:0.18 }}
                        className="text-[13px] whitespace-nowrap overflow-hidden leading-tight"
                        style={{ fontWeight: active ? 600 : 500 }}>
                        {t(key)}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.li>
            );
          })}
        </motion.ul>
      </nav>

      {/* User + Logout */}
      <div className="flex-shrink-0 p-2" style={{ borderTop: `1px solid ${borderColor}` }}>
        <AnimatePresence>
          {!sidebarCollapsed && user && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-1"
              style={{ background: userCardBg }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white' }}>
                {user?.name?.[0]?.toUpperCase() || 'F'}
              </div>
              <div className="overflow-hidden">
                <p className="text-[12px] font-semibold truncate" style={{ color: textMain }}>{user?.name || 'Farmer'}</p>
                <p className="text-[10px] truncate" style={{ color: textDim }}>{user?.email}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          title={sidebarCollapsed ? t('nav.logout') : undefined}
          className="flex items-center gap-2.5 w-full px-2.5 py-2.5 rounded-xl transition-all duration-150"
          style={{ color: textDim }}
          onMouseEnter={(e) => { e.currentTarget.style.background='rgba(248,113,113,0.08)'; e.currentTarget.style.color='#f87171'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color=textDim; }}>
          <LogOut size={15} className="flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                className="text-[13px] font-medium whitespace-nowrap">
                {t('nav.logout')}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <motion.button onClick={toggleSidebar} whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10"
        style={{ background: collapseBtnBg, border: `1px solid ${collapseBtnBorder}`, color: textMuted, boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}
        aria-label="Toggle sidebar">
        {sidebarCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
      </motion.button>
    </motion.aside>
  );
};

export default Sidebar;
