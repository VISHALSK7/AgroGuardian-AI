import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun, Moon, Bell, Globe, Shield, Trash2, Download,
  Volume2, VolumeX, Monitor, Smartphone, Check, ChevronRight,
  Lock, Eye, EyeOff, Loader, Save,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAppStore } from '../store/useAppStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.03 } } };
const fadeUp  = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 320, damping: 26 } } };

/* ── Section Card ── */
const Section = ({ title, subtitle, icon: Icon, children, danger }) => (
  <motion.div variants={fadeUp} className="rounded-2xl overflow-hidden"
    style={{ background: '#1c211e', border: `1px solid ${danger ? 'rgba(248,113,113,0.15)' : 'rgba(42,56,41,0.4)'}` }}>
    <div className="flex items-center gap-3 px-6 py-4"
      style={{ borderBottom: `1px solid ${danger ? 'rgba(248,113,113,0.1)' : 'rgba(42,56,41,0.3)'}` }}>
      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: danger ? 'rgba(248,113,113,0.1)' : 'rgba(34,197,94,0.1)' }}>
        <Icon size={15} style={{ color: danger ? '#f87171' : '#22c55e' }} />
      </div>
      <div>
        <p className="text-sm font-bold" style={{ color: danger ? '#f87171' : '#e8eee9' }}>{title}</p>
        {subtitle && <p className="text-[11px]" style={{ color: '#6a8070' }}>{subtitle}</p>}
      </div>
    </div>
    <div className="px-6 py-5">{children}</div>
  </motion.div>
);

/* ── Toggle Row ── */
const ToggleRow = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
    <div>
      <p className="text-[13px] font-medium" style={{ color: '#c8d5ca' }}>{label}</p>
      {desc && <p className="text-[11px] mt-0.5" style={{ color: '#6a8070' }}>{desc}</p>}
    </div>
    <button onClick={() => onChange(!value)}
      className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
      style={{ background: value ? '#22c55e' : 'rgba(42,56,41,0.6)', transition: 'background 0.2s' }}>
      <motion.div animate={{ x: value ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full" style={{ background: 'white' }} />
    </button>
  </div>
);

/* ── Theme Option ── */
const ThemeOption = ({ icon: Icon, label, desc, active, onClick }) => (
  <motion.button onClick={onClick} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
    className="flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl text-center transition-all"
    style={{
      background: active ? 'rgba(34,197,94,0.12)' : 'rgba(26,31,28,0.6)',
      border: active ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(42,56,41,0.3)',
    }}>
    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
      style={{ background: active ? 'rgba(34,197,94,0.15)' : 'rgba(42,56,41,0.3)' }}>
      <Icon size={17} style={{ color: active ? '#22c55e' : '#6a8070' }} />
    </div>
    <div>
      <p className="text-[12px] font-semibold" style={{ color: active ? '#22c55e' : '#c8d5ca' }}>{label}</p>
      <p className="text-[10px]" style={{ color: '#6a8070' }}>{desc}</p>
    </div>
    {active && <Check size={12} style={{ color: '#22c55e' }} />}
  </motion.button>
);

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { logout }          = useAppStore();
  const navigate            = useNavigate();

  // Notification prefs
  const [notifs, setNotifs] = useState({
    diseaseAlerts: true, weatherAlerts: true, pestWarnings: true,
    schemeUpdates: false, weeklyReport: true,
  });

  // Privacy
  const [privacy, setPrivacy] = useState({
    shareData: false, analytics: true,
  });

  // Sound
  const [soundOn, setSoundOn] = useState(true);

  // Change password
  const [pwForm, setPwForm]   = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleSaveNotifs = () => toast.success('Notification preferences saved!');
  const handleSavePrivacy = () => toast.success('Privacy settings saved!');

  const handleChangePassword = async () => {
    if (!pwForm.current) { toast.error('Enter your current password'); return; }
    if (pwForm.newPw.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setPwLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // Simulate API call
    toast.success('Password changed successfully!');
    setPwForm({ current: '', newPw: '', confirm: '' });
    setPwLoading(false);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      toast.error('Account deletion requires email confirmation. Feature coming soon.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 max-w-3xl pb-8">
      {/* Header */}
      <motion.div variants={stagger} initial="hidden" animate="visible">
        <motion.div variants={fadeUp}>
          <h2 className="text-xl font-bold" style={{ color: '#e8eee9' }}>Settings</h2>
          <p className="text-sm mt-0.5" style={{ color: '#7a9080' }}>Customize your AgroGuardian experience</p>
        </motion.div>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-5">
        {/* ── Appearance ── */}
        <Section title="Appearance" subtitle="Choose your display theme" icon={Sun}>
          <p className="text-[12px] mb-3" style={{ color: '#6a8070' }}>Select theme</p>
          <div className="flex gap-3">
            <ThemeOption icon={Moon}    label="Dark"   desc="Easy on eyes" active={theme === 'dark'}   onClick={() => setTheme('dark')} />
            <ThemeOption icon={Sun}     label="Light"  desc="Bright & clear" active={theme === 'light'}  onClick={() => setTheme('light')} />
            <ThemeOption icon={Monitor} label="System" desc="Auto detect"  active={theme === 'system'} onClick={() => {
              const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              setTheme(sys);
            }} />
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <ToggleRow label="Sound effects" desc="Play sounds for alerts and chatbot"
              value={soundOn} onChange={setSoundOn} />
          </div>
        </Section>

        {/* ── Notifications ── */}
        <Section title="Notifications" subtitle="Control what alerts you receive" icon={Bell}>
          <ToggleRow label="Disease Detection Alerts" desc="Get notified when AI detects crop disease"
            value={notifs.diseaseAlerts} onChange={(v) => setNotifs((p) => ({ ...p, diseaseAlerts: v }))} />
          <ToggleRow label="Weather Warnings" desc="Alerts for extreme weather affecting crops"
            value={notifs.weatherAlerts} onChange={(v) => setNotifs((p) => ({ ...p, weatherAlerts: v }))} />
          <ToggleRow label="Pest Outbreak Warnings" desc="Early warning for pest risk in your area"
            value={notifs.pestWarnings} onChange={(v) => setNotifs((p) => ({ ...p, pestWarnings: v }))} />
          <ToggleRow label="Government Scheme Updates" desc="New schemes and deadlines"
            value={notifs.schemeUpdates} onChange={(v) => setNotifs((p) => ({ ...p, schemeUpdates: v }))} />
          <ToggleRow label="Weekly Farm Report" desc="Summary of your farm activity every Monday"
            value={notifs.weeklyReport} onChange={(v) => setNotifs((p) => ({ ...p, weeklyReport: v }))} />
          <button onClick={handleSaveNotifs}
            className="mt-4 btn-primary text-xs flex items-center gap-2 px-4 py-2">
            <Save size={12} /> Save Preferences
          </button>
        </Section>

        {/* ── Privacy ── */}
        <Section title="Privacy & Data" subtitle="Control how your data is used" icon={Eye}>
          <ToggleRow label="Share anonymized usage data" desc="Helps improve AI accuracy for all farmers"
            value={privacy.shareData} onChange={(v) => setPrivacy((p) => ({ ...p, shareData: v }))} />
          <ToggleRow label="Analytics & performance tracking"
            desc="We use this to fix bugs and improve the app"
            value={privacy.analytics} onChange={(v) => setPrivacy((p) => ({ ...p, analytics: v }))} />
          <div className="mt-4 pt-4 border-t border-white/5 flex gap-3">
            <button onClick={handleSavePrivacy}
              className="btn-primary text-xs flex items-center gap-2 px-4 py-2">
              <Save size={12} /> Save Privacy Settings
            </button>
            <button
              className="btn-secondary text-xs flex items-center gap-2 px-4 py-2"
              onClick={() => toast('Data export coming soon!', { icon: '📦' })}>
              <Download size={12} /> Export My Data
            </button>
          </div>
        </Section>

        {/* ── Change Password ── */}
        <Section title="Security" subtitle="Update your password" icon={Lock}>
          <div className="space-y-3 max-w-sm">
            {[
              { key: 'current', label: 'Current Password', placeholder: '••••••••' },
              { key: 'newPw',   label: 'New Password',     placeholder: 'Min. 6 characters' },
              { key: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#6a8070' }}>{label}</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={(e) => setPwForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full text-sm rounded-xl outline-none pr-10"
                    style={{ padding: '0.625rem 0.75rem', background: 'rgba(26,31,28,0.8)',
                      border: '1px solid rgba(42,56,41,0.55)', color: '#e8eee9' }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#4a6050' }}>
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={handleChangePassword} disabled={pwLoading}
              className="btn-primary text-xs flex items-center gap-2 px-4 py-2">
              {pwLoading ? <Loader size={12} className="animate-spin" /> : <Lock size={12} />}
              {pwLoading ? 'Updating...' : 'Change Password'}
            </button>
          </div>
        </Section>

        {/* ── About ── */}
        <Section title="About" subtitle="App information" icon={Shield}>
          <div className="space-y-2">
            {[
              { label: 'App Version',      val: 'AgroGuardian AI v3.0' },
              { label: 'Disease Models',   val: '38+ crops, 97% accuracy' },
              { label: 'Chatbot Engine',   val: 'Google Gemini + OpenAI GPT' },
              { label: 'Last Updated',     val: 'April 2026' },
              { label: 'Support Email',    val: 'support@agroguardian.ai' },
            ].map(({ label, val }) => (
              <div key={label} className="flex justify-between py-2 border-b border-white/5 last:border-0 text-[13px]">
                <span style={{ color: '#6a8070' }}>{label}</span>
                <span style={{ color: '#c8d5ca' }}>{val}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Danger Zone ── */}
        <Section title="Danger Zone" subtitle="Irreversible actions" icon={Trash2} danger>
          <p className="text-[13px] mb-4" style={{ color: '#96a899' }}>
            Deleting your account will permanently remove all your data, scan history, and preferences.
            This action cannot be undone.
          </p>
          <button onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}>
            <Trash2 size={13} /> Delete My Account
          </button>
        </Section>
      </motion.div>
    </motion.div>
  );
};

export default SettingsPage;
