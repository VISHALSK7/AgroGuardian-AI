import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Edit2, Save, X, MapPin, Phone, Mail, Sprout, Shield,
  LogOut, Loader, Camera, Leaf, Bug, BarChart3, Activity,
  Calendar, Award, CheckCircle, Globe,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { userService } from '../services/api';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 28 } } };

/* ── Editable Field Row ── */
const FieldRow = ({ icon: Icon, label, value, field, editing, onChange, type = 'text', readOnly }) => (
  <div className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: 'rgba(34,197,94,0.1)' }}>
      <Icon size={15} style={{ color: '#22c55e' }} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-medium mb-0.5" style={{ color: '#6a8070', letterSpacing: '0.02em' }}>{label}</p>
      {editing && field && !readOnly ? (
        <input type={type} value={value || ''} onChange={(e) => onChange(field, e.target.value)}
          className="text-sm rounded-lg outline-none w-full"
          style={{ padding: '0.375rem 0.5rem', background: 'rgba(26,31,28,0.8)',
            border: '1px solid rgba(34,197,94,0.3)', color: '#e8eee9' }} />
      ) : (
        <p className="text-sm font-medium truncate" style={{ color: value ? '#c8d5ca' : '#4a6050' }}>
          {value || '—'}
        </p>
      )}
    </div>
  </div>
);

/* ── Stat Card ── */
const StatBadge = ({ icon: Icon, label, value, color = '#22c55e' }) => (
  <motion.div variants={fadeUp} className="rounded-xl p-4 flex items-center gap-3"
    style={{ background: 'rgba(26,31,28,0.6)', border: '1px solid rgba(42,56,41,0.3)' }}>
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}18` }}>
      <Icon size={17} style={{ color }} />
    </div>
    <div>
      <p className="text-lg font-bold leading-none" style={{ color: '#e8eee9' }}>{value}</p>
      <p className="text-[11px] mt-0.5" style={{ color: '#6a8070' }}>{label}</p>
    </div>
  </motion.div>
);

const ProfilePage = () => {
  const { t, language } = useTranslation();
  const navigate  = useNavigate();
  const { theme } = useTheme();
  const { user, setUser, logout, setLanguage } = useAppStore();

  const [editing, setEditing]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const [fetching, setFetching]   = useState(true);
  const [profile, setProfile]     = useState(null);
  const [form, setForm]           = useState({ name: '', phone: '', location: '', bio: '', farm_size: '', crops: '', default_language: 'en' });
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  const isLight = theme === 'light';
  const cardBg  = isLight ? '#ffffff' : '#1c211e';
  const cardBorder = isLight ? 'rgba(34,197,94,0.12)' : 'rgba(42,56,41,0.4)';
  const textMain   = isLight ? '#152318' : '#e8eee9';
  const textMuted  = isLight ? '#4a6b4e' : '#7a9080';
  const textDim    = isLight ? '#6a8070' : '#6a8070';
  const fieldBg    = isLight ? 'rgba(240,247,242,0.8)' : 'rgba(26,31,28,0.6)';

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getProfile();
        const p   = res.data?.data?.user || {};
        setProfile(p);
        setForm({
          name: p.name || '', phone: p.phone || '',
          location: p.location || '', bio: p.bio || '',
          farm_size: p.farm_size || '', crops: p.crops || '',
          default_language: p.default_language || 'en',
        });
      } catch {
        setProfile(user || {});
        setForm({ name: user?.name || '', phone: user?.phone || '', location: user?.location || '', bio: '', farm_size: '', crops: '', default_language: user?.default_language || 'en' });
      } finally { setFetching(false); }
    })();
  }, []); // eslint-disable-line

  const handleFieldChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      toast.error('Phone must be 10 digits'); return;
    }
    setLoading(true);
    try {
      const res  = await userService.updateProfile(form);
      const updated = res.data?.data?.user || {};
      setProfile(updated);
      setUser(updated);
      if (updated.default_language) {
        setLanguage(updated.default_language);
      }
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch { toast.error('Update failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    const fd = new FormData();
    fd.append('avatar', file);
    setAvatarLoading(true);
    try {
      const res = await api.put('/auth/profile/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const avatar_url = res.data?.data?.avatar_url;
      setProfile((p) => ({ ...p, avatar_url }));
      setUser({ ...user, avatar_url });
      toast.success('Profile photo updated!');
    } catch { toast.error('Failed to upload photo'); }
    finally { setAvatarLoading(false); }
  };

  const handleLogout = () => { logout(); navigate('/login'); toast.success('Signed out'); };

  const src = profile || user || {};

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={24} className="animate-spin" style={{ color: '#22c55e' }} />
      </div>
    );
  }

  const memberSince = src?.created_at
    ? new Date(src.created_at).toLocaleDateString(language === 'kn' ? 'kn-IN' : language === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : t('profile.recentlyJoined') || 'Recently joined';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-8">
      {/* ── Page Header ── */}
      <motion.div variants={stagger} initial="hidden" animate="visible"
        className="flex items-start justify-between flex-wrap gap-4">
        <motion.div variants={fadeUp}>
          <h2 className="text-xl font-bold" style={{ color: textMain }}>{t('profile.title') || 'My Profile'}</h2>
          <p className="text-sm mt-0.5" style={{ color: textMuted }}>{t('profile.subtitle') || 'Manage your account information and preferences'}</p>
        </motion.div>
        <motion.div variants={fadeUp} className="flex gap-2">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)}
                className="btn-secondary text-xs flex items-center gap-1.5 px-4 py-2">
                <X size={12} /> {t('profile.cancel') || 'Cancel'}
              </button>
              <button onClick={handleSave} disabled={loading}
                className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2">
                {loading ? <Loader size={12} className="animate-spin" /> : <Save size={12} />} {t('profile.saveChanges') || 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)}
              className="btn-primary text-xs flex items-center gap-1.5 px-4 py-2">
              <Edit2 size={12} /> {t('profile.editProfile') || 'Edit Profile'}
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* ── Left: Avatar + Identity ── */}
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          {/* Avatar Card */}
          <motion.div variants={fadeUp} className="rounded-2xl p-6 text-center"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            {/* Avatar */}
            <div className="relative inline-block mb-4">
              {src.avatar_url ? (
                <img src={src.avatar_url} alt="Profile"
                  className="w-24 h-24 rounded-2xl object-cover mx-auto"
                  style={{ border: '3px solid rgba(34,197,94,0.3)' }} />
              ) : (
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold mx-auto"
                  style={{ background: 'linear-gradient(135deg,#22c55e20,#16a34a20)',
                    border: '3px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
                  {src?.name?.[0]?.toUpperCase() || 'F'}
                </div>
              )}
              <button onClick={() => fileInputRef.current?.click()} disabled={avatarLoading}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: '#22c55e', border: '2px solid ' + (isLight ? '#f0f7f2' : '#0a0f0d'), color: 'white' }}
                title="Change photo">
                {avatarLoading ? <Loader size={12} className="animate-spin" /> : <Camera size={12} />}
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                className="hidden" onChange={handleAvatarChange} />
            </div>

            <h3 className="text-base font-bold mb-1" style={{ color: textMain }}>{src?.name || 'Farmer'}</h3>
            <p className="text-xs mb-3" style={{ color: textMuted }}>{src?.email || src?.phone || '—'}</p>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              <span className="chip chip-success flex items-center gap-1">
                <CheckCircle size={9} /> {t('profile.verifiedFarmer') || 'Verified Farmer'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize"
                style={{ background: 'rgba(99,179,237,0.12)', color: '#63b3ed', border: '1px solid rgba(99,179,237,0.2)' }}>
                {src?.role === 'farmer' || !src?.role ? (t('Farmer') || 'Farmer') : src?.role}
              </span>
            </div>

            {/* Quick stats */}
            <div className="rounded-xl p-3 space-y-2.5" style={{ background: isLight ? '#f0f7f2' : 'rgba(26,31,28,0.5)' }}>
              {[
                { label: t('profile.memberSince') || 'Member Since', val: memberSince },
                { label: t('profile.accountId') || 'Account ID',   val: String(src?._id || src?.id || 'N/A').slice(0, 12) + '...' },
                { label: t('profile.farmLocation') || 'Farm Location',val: form.location || '—' },
                { label: t('profile.farmSize') || 'Farm Size',    val: form.farm_size ? `${form.farm_size} ${t('profile.acres') || 'acres'}` : '—' },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between items-center text-xs">
                  <span style={{ color: textDim }}>{label}</span>
                  <span className="font-medium text-right max-w-[120px] truncate" style={{ color: textMuted }}>{val}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Activity stats */}
          <motion.div variants={fadeUp} className="rounded-2xl p-5"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <p className="text-xs font-bold mb-3 uppercase tracking-wider" style={{ color: '#22c55e' }}>{t('profile.farmActivity') || 'Farm Activity'}</p>
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-3">
              <StatBadge icon={Leaf} label={t('profile.diseaseScans') || 'Disease Scans'} value={src?.total_analyses ?? 0} color="#22c55e" />
              <StatBadge icon={Shield} label={t('profile.healthVerifications') || 'AI Verifications'} value={src?.total_analyses ? Math.max(1, Math.floor(src.total_analyses * 0.98)) : 0} color="#3b82f6" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* ── Right: Info Forms ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Information */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.1)' }}>
                <User size={13} style={{ color: '#22c55e' }} />
              </div>
              <p className="text-sm font-bold" style={{ color: textMain }}>{t('profile.personalInfo') || 'Personal Information'}</p>
            </div>
            <FieldRow icon={User}   label={t('fullName') || 'Full Name'}     value={form.name}     field="name"     editing={editing} onChange={handleFieldChange} />
            <FieldRow icon={Mail}   label={t('email') || 'Email Address'} value={src?.email}    readOnly />
            <FieldRow icon={Phone}  label={t('phone') || 'Phone Number'}  value={form.phone}    field="phone"    editing={editing} onChange={handleFieldChange} type="tel" />
            <FieldRow icon={MapPin} label={t('profile.farmLocation') || 'Location / Village'} value={form.location} field="location" editing={editing} onChange={handleFieldChange} />
            <div className="flex items-center gap-4 py-3.5 border-b border-white/5 last:border-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,197,94,0.1)' }}>
                <Globe size={15} style={{ color: '#22c55e' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium mb-0.5" style={{ color: '#6a8070', letterSpacing: '0.02em' }}>{t('profile.defaultLanguage') || 'Default Language'}</p>
                {editing ? (
                  <select value={form.default_language || 'en'} onChange={(e) => handleFieldChange('default_language', e.target.value)}
                    className="text-sm rounded-lg outline-none w-full p-1.5"
                    style={{ background: 'rgba(26,31,28,0.8)', border: '1px solid rgba(34,197,94,0.3)', color: '#e8eee9' }}>
                    <option value="en">English</option>
                    <option value="kn">ಕನ್ನಡ (Kannada)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                ) : (
                  <p className="text-sm font-medium truncate" style={{ color: '#c8d5ca' }}>
                    {form.default_language === 'kn' ? 'ಕನ್ನಡ (Kannada)' : form.default_language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
                  </p>
                )}
              </div>
            </div>
            {editing && (
              <p className="text-[11px] mt-2 flex items-center gap-1" style={{ color: '#6a8070' }}>
                <Shield size={10} style={{ color: '#22c55e' }} />
                {t('profile.phoneHint') || 'Phone: 10 digits only (e.g. 9876543210)'}
              </p>
            )}
          </motion.div>

          {/* Farm Details */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.1)' }}>
                <Sprout size={13} style={{ color: '#22c55e' }} />
              </div>
              <p className="text-sm font-bold" style={{ color: textMain }}>{t('profile.farmDetails') || 'Farm Details'}</p>
            </div>
            <FieldRow icon={Activity} label={t('profile.farmSizeAcres') || 'Farm Size (acres)'}  value={form.farm_size} field="farm_size" editing={editing} onChange={handleFieldChange} type="number" />
            <FieldRow icon={Leaf}     label={t('profile.primaryCrops') || 'Primary Crops'}      value={form.crops}     field="crops"     editing={editing} onChange={handleFieldChange} />
            {/* Bio */}
            <div className="pt-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.1)' }}>
                  <Award size={15} style={{ color: '#22c55e' }} />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-medium mb-1" style={{ color: '#6a8070' }}>{t('profile.bio') || 'Bio / About'}</p>
                  {editing ? (
                    <textarea value={form.bio} rows={3}
                      onChange={(e) => handleFieldChange('bio', e.target.value)}
                      placeholder={t('profile.bioPlaceholder') || "Tell us about your farm, crops, experience..."}
                      className="w-full text-sm rounded-lg outline-none resize-none"
                      style={{ padding: '0.5rem', background: 'rgba(26,31,28,0.8)',
                        border: '1px solid rgba(34,197,94,0.3)', color: '#e8eee9' }} />
                  ) : (
                    <p className="text-sm" style={{ color: form.bio ? '#c8d5ca' : '#4a6050' }}>
                      {form.bio || t('profile.noBio') || 'No bio yet. Click Edit to add one.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Info */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-2xl p-6"
            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(34,197,94,0.1)' }}>
                <Shield size={13} style={{ color: '#22c55e' }} />
              </div>
              <p className="text-sm font-bold" style={{ color: textMain }}>{t('profile.accountSecurity') || 'Account Security'}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: t('profile.accountId') || 'Account ID',   val: String(src?._id || src?.id || 'N/A').slice(0, 20) + '...', icon: Shield },
                { label: t('profile.loginMethod') || 'Login Method', val: src?.google_id ? 'Google OAuth' : src?.phone ? 'Phone OTP' : 'Email & Password', icon: CheckCircle },
                { label: t('profile.memberSince') || 'Member Since', val: memberSince, icon: Calendar },
                { label: t('profile.accountRole') || 'Account Role', val: src?.role === 'farmer' || !src?.role ? (t('Farmer') || 'Farmer') : src?.role, icon: Award },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="rounded-xl p-3"
                  style={{ background: isLight ? '#f0f7f2' : 'rgba(26,31,28,0.5)', border: '1px solid rgba(42,56,41,0.2)' }}>
                  <p className="text-[10px] font-medium mb-1" style={{ color: textDim }}>{label}</p>
                  <p className="text-xs font-semibold truncate" style={{ color: textMuted }}>{val}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="rounded-2xl p-6"
            style={{ background: cardBg, border: '1px solid rgba(248,113,113,0.15)' }}>
            <p className="text-sm font-bold mb-3" style={{ color: '#f87171' }}>{t('profile.accountActions') || 'Account Actions'}</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(248,113,113,0.08)'; }}>
                <LogOut size={13} /> {t('profile.logoutAll') || 'Sign Out'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
