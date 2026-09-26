import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { useAppStore } from './store/useAppStore';

import AppShell from './components/layout/AppShell';
import LandingPage from './pages/LandingPage';
import { LoginPage, SignupPage } from './pages/AuthPages';
import DashboardPage from './pages/DashboardPage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import WeatherPage from './pages/WeatherPage';
import SchemesPage from './pages/SchemesPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import ChatbotPage from './pages/ChatbotPage';

const HydrationGate = ({ children }) => {
  const hasHydrated = useAppStore((s) => s._hasHydrated);
  if (!hasHydrated) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f0d',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%',
          border: '3px solid rgba(34,197,94,0.15)', borderTop: '3px solid #22c55e',
          animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color: '#4a6050', fontSize: 12, fontFamily: 'Inter,sans-serif' }}>Loading AgroGuardian AI…</p>
      </div>
    );
  }
  return children;
};

const PrivateRoute = ({ children }) => {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const token = localStorage.getItem('ag_token');
  if (!isAuthenticated && !token) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const token = localStorage.getItem('ag_token');
  if (isAuthenticated || token) return <Navigate to="/dashboard" replace />;
  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/"       element={<LandingPage />} />
        <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        <Route path="/dashboard" element={<PrivateRoute><AppShell /></PrivateRoute>}>
          <Route index           element={<DashboardPage />} />
          <Route path="disease"  element={<DiseaseDetectionPage />} />
          <Route path="weather"  element={<WeatherPage />} />
          <Route path="schemes"  element={<SchemesPage />} />
          <Route path="history"  element={<HistoryPage />} />
          <Route path="profile"  element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="chatbot" element={<ChatbotPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <BrowserRouter>
    <HydrationGate>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1c211e', color: '#e8eee9',
          border: '1px solid rgba(42,56,41,0.5)', fontFamily: 'Inter, sans-serif',
          fontSize: '13px', borderRadius: '10px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
        success: { iconTheme: { primary: '#22c55e', secondary: '#0c1210' } },
        error:   { iconTheme: { primary: '#f87171', secondary: '#1c211e' } },
        loading: { iconTheme: { primary: '#22c55e', secondary: '#1c211e' } },
        duration: 3500,
      }} />
      <AnimatedRoutes />
    </HydrationGate>
  </BrowserRouter>
);

export default App;
