import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Mail, Lock, User, Sprout,
  ArrowRight, Loader, AlertCircle, Phone, Shield, RefreshCw,
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAppStore } from '../store/useAppStore';
import { authService } from '../services/api';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const spring = { type: 'spring', stiffness: 260, damping: 22 };

/* ── Icons ── */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* ── Shared Input Field ── */
const FormField = ({ label, icon: Icon, type = 'text', value, onChange, placeholder, error, readOnly }) => {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const inputType = type === 'password' ? (showPw ? 'text' : 'password') : type;
  return (
    <div className="relative">
      <label className="block text-[11px] font-semibold mb-1.5"
        style={{ color: error ? '#f87171' : '#6a8070', letterSpacing: '0.03em' }}>{label}</label>
      <div className="relative">
        <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: error ? '#f87171' : focused ? '#22c55e' : '#4a6050' }} />
        <input type={inputType} value={value} onChange={onChange} placeholder={placeholder}
          readOnly={readOnly}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full rounded-lg text-sm outline-none"
          style={{
            paddingLeft: '2.25rem', paddingRight: type === 'password' ? '2.5rem' : '0.75rem',
            paddingTop: '0.625rem', paddingBottom: '0.625rem',
            background: readOnly ? 'rgba(26,31,28,0.4)' : 'rgba(26,31,28,0.8)',
            border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : focused ? 'rgba(34,197,94,0.5)' : 'rgba(42,56,41,0.55)'}`,
            boxShadow: error ? '0 0 0 3px rgba(248,113,113,0.10)' : focused ? '0 0 0 3px rgba(34,197,94,0.10)' : 'none',
            color: '#e8eee9', transition: 'all 0.18s ease',
          }} />
        {type === 'password' && (
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#4a6050' }} tabIndex={-1}>
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-[11px] mt-1 flex items-center gap-1" style={{ color: '#f87171' }}>
          <AlertCircle size={10} /> {error}
        </motion.p>
      )}
    </div>
  );
};

const OrDivider = () => (
  <div className="flex items-center gap-3 my-5">
    <div className="flex-1 h-px" style={{ background: 'rgba(42,56,41,0.5)' }} />
    <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: '#4a6050' }}>or</span>
    <div className="flex-1 h-px" style={{ background: 'rgba(42,56,41,0.5)' }} />
  </div>
);

const GoogleButton = ({ onClick, loading, label }) => (
  <motion.button type="button" onClick={onClick} disabled={loading}
    whileHover={!loading ? { scale: 1.015, y: -1 } : {}}
    whileTap={!loading ? { scale: 0.97 } : {}} transition={spring}
    className="w-full flex items-center justify-center gap-3 rounded-lg text-[13px] font-medium"
    style={{
      padding: '0.625rem 1rem', background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.12)', color: '#d1d5db',
      opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer',
    }}>
    {loading ? <Loader size={16} className="animate-spin" /> : <GoogleIcon />}
    {label}
  </motion.button>
);

/* ── Tab Button ── */
const TabBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} className="flex-1 py-2 text-[12px] font-semibold rounded-lg transition-all"
    style={{
      background: active ? 'rgba(34,197,94,0.15)' : 'transparent',
      color: active ? '#22c55e' : '#4a6050',
      border: active ? '1px solid rgba(34,197,94,0.25)' : '1px solid transparent',
    }}>
    {children}
  </button>
);

/* ── Auth Shell ── */
const AuthShell = ({ children, title, subtitle, switchText, switchLink, switchLabel }) => (
  <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
    style={{ background: '#0a0f0d' }}>
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute rounded-full blur-3xl"
        style={{ width: 600, height: 600, top: -200, left: '50%', transform: 'translateX(-300px)',
          background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px' }} />
    </div>
    <motion.div initial={{ opacity: 0, y: 32, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...spring, duration: 0.5 }} className="w-full max-w-[420px] relative z-10">
      {/* Logo */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.1 }} className="flex items-center justify-center gap-2.5 mb-8">
        <motion.div whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.4 }}
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 20px rgba(34,197,94,0.35)' }}>
          <Sprout size={20} color="white" strokeWidth={2.5} />
        </motion.div>
        <div>
          <span className="font-bold text-[16px] tracking-tight" style={{ color: '#e8eee9' }}>
            AgroGuardian <span style={{ color: '#22c55e' }}>AI</span>
          </span>
          <p className="text-[10px]" style={{ color: '#4a6050', letterSpacing: '0.08em' }}>SMART FARMING PLATFORM</p>
        </div>
      </motion.div>
      {/* Card */}
      <div className="rounded-2xl p-7"
        style={{ background: '#141918', border: '1px solid rgba(42,56,41,0.5)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="mb-6">
          <h1 className="text-[21px] font-bold mb-1" style={{ color: '#e8eee9', letterSpacing: '-0.03em' }}>{title}</h1>
          <p className="text-[13px]" style={{ color: '#6a8070' }}>{subtitle}</p>
        </motion.div>
        {children}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-center text-[12px] mt-5" style={{ color: '#6a8070' }}>
          {switchText}{' '}
          <Link to={switchLink} className="font-semibold hover:opacity-80" style={{ color: '#22c55e' }}>
            {switchLabel}
          </Link>
        </motion.p>
      </div>
    </motion.div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   Phone OTP Login Panel
═══════════════════════════════════════════════════════════════ */
const PhoneOTPPanel = ({ onSuccess }) => {
  const [phone, setPhone]         = useState('');
  const [otp, setOtp]             = useState('');
  const [step, setStep]           = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading]     = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [devOtp, setDevOtp]       = useState('');
  const [error, setError]         = useState('');

  // Countdown timer
  React.useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSendOtp = async () => {
    setError('');
    if (!/^\d{10}$/.test(phone)) { setError('Enter a valid 10-digit mobile number'); return; }
    setLoading(true);
    try {
      const res = await authService.sendOtp(phone);
      const d   = res.data?.data;
      toast.success('OTP sent to your mobile!');
      if (d?.dev_otp) {
        setDevOtp(d.dev_otp);
        toast('Dev mode: OTP is ' + d.dev_otp, { icon: '🔑', duration: 10000 });
      }
      setStep('otp');
      setCountdown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit OTP'); return; }
    setLoading(true);
    try {
      const res = await authService.verifyOtp(phone, otp);
      onSuccess(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === 'phone' ? (
        <>
          <div>
            <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#6a8070', letterSpacing: '0.03em' }}>
              MOBILE NUMBER
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 rounded-lg text-sm"
                style={{ background: 'rgba(26,31,28,0.8)', border: '1px solid rgba(42,56,41,0.55)', color: '#6a8070', flexShrink: 0 }}>
                +91
              </div>
              <input type="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number" className="flex-1 rounded-lg text-sm outline-none"
                style={{ padding: '0.625rem 0.75rem', background: 'rgba(26,31,28,0.8)',
                  border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : 'rgba(42,56,41,0.55)'}`, color: '#e8eee9' }}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()} />
            </div>
          </div>
          {error && (
            <p className="text-[11px] flex items-center gap-1" style={{ color: '#f87171' }}>
              <AlertCircle size={10} /> {error}
            </p>
          )}
          <motion.button onClick={handleSendOtp} disabled={loading || phone.length !== 10}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full btn-primary justify-center py-3 text-[14px] flex items-center gap-2"
            style={{ opacity: phone.length !== 10 ? 0.6 : 1 }}>
            {loading ? <><Loader size={15} className="animate-spin" /> Sending OTP...</>
              : <>Send OTP <ArrowRight size={15} /></>}
          </motion.button>
        </>
      ) : (
        <>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <p className="text-[12px]" style={{ color: '#6a8070' }}>OTP sent to <span style={{ color: '#22c55e' }}>+91-{phone}</span></p>
            <button onClick={() => setStep('phone')} className="text-[11px] mt-0.5 hover:opacity-80" style={{ color: '#6a8070' }}>
              Change number
            </button>
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-1.5" style={{ color: '#6a8070', letterSpacing: '0.03em' }}>
              ENTER 6-DIGIT OTP
            </label>
            <input type="tel" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="• • • • • •" className="w-full rounded-lg text-sm outline-none text-center text-xl tracking-[0.5em] font-bold"
              style={{ padding: '0.75rem', background: 'rgba(26,31,28,0.8)',
                border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : 'rgba(42,56,41,0.55)'}`, color: '#22c55e' }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()} />
          </div>
          {devOtp && (
            <div className="p-2 rounded-lg text-center text-[11px]" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24' }}>
              🔑 Dev OTP: <strong>{devOtp}</strong> (remove in production)
            </div>
          )}
          {error && (
            <p className="text-[11px] flex items-center gap-1" style={{ color: '#f87171' }}>
              <AlertCircle size={10} /> {error}
            </p>
          )}
          <motion.button onClick={handleVerifyOtp} disabled={loading || otp.length !== 6}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className="w-full btn-primary justify-center py-3 text-[14px] flex items-center gap-2"
            style={{ opacity: otp.length !== 6 ? 0.6 : 1 }}>
            {loading ? <><Loader size={15} className="animate-spin" /> Verifying...</>
              : <><Shield size={15} /> Verify & Sign In</>}
          </motion.button>
          <div className="text-center">
            {countdown > 0
              ? <p className="text-[12px]" style={{ color: '#4a6050' }}>Resend OTP in {countdown}s</p>
              : <button onClick={handleSendOtp} disabled={loading}
                  className="text-[12px] flex items-center gap-1 mx-auto hover:opacity-80" style={{ color: '#22c55e' }}>
                  <RefreshCw size={11} /> Resend OTP
                </button>
            }
          </div>
        </>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Login Page
═══════════════════════════════════════════════════════════════ */
export const LoginPage = () => {
  const login    = useAppStore((s) => s.login);
  const navigate = useNavigate();
  const [tab, setTab]           = useState('email'); // 'email' | 'phone'
  
  React.useEffect(() => {
    useAppStore.getState().setLanguage('en');
  }, []);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const e = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password || password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (ev) => {
    ev.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      const { token, user } = res.data.data;
      login(user, token);
      toast.success(`Welcome back, ${user.name}! 🌱`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setApiError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGLoading(true);
    setApiError('');
    try {
      if (!credentialResponse?.credential) {
        throw new Error("No credential received from Google.");
      }
      const res = await authService.googleAuth(credentialResponse.credential);
      const { token, user } = res.data.data;
      login(user, token);
      toast.success(`Welcome, ${user.name}! 🌱`);
      navigate('/dashboard');
    } catch (err) {
      console.error("[Google Sign-In Error]:", err);
      const msg = err.response?.data?.message || err.userFriendlyMessage || err.message || 'Google sign-in failed.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setGLoading(false);
    }
  };

  const handlePhoneSuccess = ({ token, user }) => {
    login(user, token);
    toast.success(`Welcome, ${user.name}! 🌱`);
    navigate('/dashboard');
  };

  const field     = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: spring } };
  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your AgroGuardian account"
      switchText="Don't have an account?" switchLink="/signup" switchLabel="Sign up free">
      {/* Google */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google sign-in failed')}
          useOneTap
        />
      </motion.div>

      <OrDivider />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: 'rgba(26,31,28,0.6)' }}>
        <TabBtn active={tab === 'email'} onClick={() => { setTab('email'); setApiError(''); }}>
          <Mail size={12} className="inline mr-1.5" />Email
        </TabBtn>
        <TabBtn active={tab === 'phone'} onClick={() => { setTab('phone'); setApiError(''); }}>
          <Phone size={12} className="inline mr-1.5" />Phone OTP
        </TabBtn>
      </div>

      {apiError && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg p-3 mb-4 text-[12px]"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
          <AlertCircle size={13} className="flex-shrink-0" /> {apiError}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {tab === 'email' ? (
          <motion.form key="email" onSubmit={handleLogin}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <motion.div className="space-y-4 mb-5" variants={container} initial="hidden" animate="visible">
              <motion.div variants={field}>
                <FormField label="Email Address" icon={Mail} type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
                  placeholder="you@farm.com" error={errors.email} />
              </motion.div>
              <motion.div variants={field}>
                <FormField label="Password" icon={Lock} type="password" value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                  placeholder="Your password" error={errors.password} />
              </motion.div>
            </motion.div>
            <motion.button type="submit" disabled={loading || gLoading}
              whileHover={!loading ? { scale: 1.02, y: -1 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
              transition={spring} className="btn-primary w-full justify-center py-3 text-[14px] flex items-center gap-2"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ opacity: loading ? 0.75 : 1 }}>
              {loading ? <><Loader size={15} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={15} /></>}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div key="phone"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <PhoneOTPPanel onSuccess={handlePhoneSuccess} />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
};

/* ═══════════════════════════════════════════════════════════════
   Signup Page
═══════════════════════════════════════════════════════════════ */
export const SignupPage = () => {
  const login    = useAppStore((s) => s.login);
  const navigate = useNavigate();
  const [tab, setTab]   = useState('email');

  React.useEffect(() => {
    useAppStore.getState().setLanguage('en');
  }, []);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading]   = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');

  const setField = (key) => (e) => { setForm((p) => ({ ...p, [key]: e.target.value })); setErrors({}); setApiError(''); };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async (ev) => {
    ev.preventDefault(); setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authService.signup({ name: form.name, email: form.email, password: form.password });
      const { token, user } = res.data.data;
      login(user, token);
      toast.success(`Account created! Welcome, ${user.name} 🌱`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Signup failed.';
      setApiError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGLoading(true);
    setApiError('');
    try {
      if (!credentialResponse?.credential) {
        throw new Error("No credential received from Google.");
      }
      const res = await authService.googleAuth(credentialResponse.credential);
      const { token, user } = res.data.data;
      login(user, token);
      toast.success(`Welcome, ${user.name} 🌱`);
      navigate('/dashboard');
    } catch (err) {
      console.error("[Google Sign-Up Error]:", err);
      const msg = err.response?.data?.message || err.userFriendlyMessage || err.message || 'Google sign-up failed.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setGLoading(false);
    }
  };

  const handlePhoneSuccess = ({ token, user }) => {
    login(user, token);
    toast.success(`Account created! Welcome, ${user.name} 🌱`);
    navigate('/dashboard');
  };

  const field     = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: spring } };
  const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } };

  return (
    <AuthShell title="Create account" subtitle="Start protecting your crops with AI"
      switchText="Already have an account?" switchLink="/login" switchLabel="Sign in">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => toast.error('Google sign-up failed')}
          useOneTap
        />
      </motion.div>

      <OrDivider />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: 'rgba(26,31,28,0.6)' }}>
        <TabBtn active={tab === 'email'} onClick={() => { setTab('email'); setApiError(''); }}>
          <Mail size={12} className="inline mr-1.5" />Email
        </TabBtn>
        <TabBtn active={tab === 'phone'} onClick={() => { setTab('phone'); setApiError(''); }}>
          <Phone size={12} className="inline mr-1.5" />Phone OTP
        </TabBtn>
      </div>

      {apiError && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-lg p-3 mb-4 text-[12px]"
          style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
          <AlertCircle size={13} className="flex-shrink-0" /> {apiError}
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {tab === 'email' ? (
          <motion.form key="email" onSubmit={handleSignup}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <motion.div className="space-y-4 mb-5" variants={container} initial="hidden" animate="visible">
              {[
                { key: 'name', label: 'Full Name', icon: User, placeholder: 'Ramesh Kumar' },
                { key: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'you@farm.com' },
                { key: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Create a strong password' },
                { key: 'confirmPassword', label: 'Confirm Password', icon: Lock, type: 'password', placeholder: 'Repeat your password' },
              ].map(({ key, label, icon, type, placeholder }) => (
                <motion.div key={key} variants={field}>
                  <FormField label={label} icon={icon} type={type} value={form[key]}
                    onChange={setField(key)} placeholder={placeholder} error={errors[key]} />
                </motion.div>
              ))}
            </motion.div>
            <motion.button type="submit" disabled={loading || gLoading}
              whileHover={!loading ? { scale: 1.02, y: -1 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
              transition={spring} className="btn-primary w-full justify-center py-3 text-[14px] flex items-center gap-2"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ opacity: loading ? 0.75 : 1 }}>
              {loading ? <><Loader size={15} className="animate-spin" /> Creating...</> : <>Create Account <ArrowRight size={15} /></>}
            </motion.button>
          </motion.form>
        ) : (
          <motion.div key="phone"
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <PhoneOTPPanel onSuccess={handlePhoneSuccess} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-center text-[11px] mt-4" style={{ color: '#4a6050' }}>
        By signing up, you agree to our{' '}
        <span style={{ color: '#22c55e', cursor: 'pointer' }}>Terms</span> &amp;{' '}
        <span style={{ color: '#22c55e', cursor: 'pointer' }}>Privacy Policy</span>
      </motion.p>
    </AuthShell>
  );
};
