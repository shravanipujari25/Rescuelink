import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

import AdminPage from './pages/AdminPage.jsx';
import PendingPage from './pages/PendingPage.jsx';
import SOSRequestPage from './pages/SOSRequestPage.jsx';
import NGOSearchPage from './pages/NGOSearchPage.jsx';
import SmartAssistant from './components/SmartAssistant.jsx';
import ReloadPrompt from './components/ReloadPrompt.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ReloadPrompt />
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e2433',
              color: '#eef0f8',
              border: '1px solid rgba(255,255,255,0.09)',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.875rem',
              borderRadius: '10px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#22c55e', secondary: '#fff' },
              style: { borderColor: 'rgba(34,197,94,0.2)' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
              style: { borderColor: 'rgba(239,68,68,0.2)' },
            },
            duration: 4000,
          }}
        />

        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth pages — redirect if already logged in */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
          <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />


          {/* Holding page after NGO/volunteer email verify (no auth needed) */}
          <Route path="/pending" element={<PendingPage />} />

          {/* Protected — any authenticated user */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />

          {/* Protected — admin only */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>
          } />

          {/* Protected — citizen only */}
          <Route path="/sos/request" element={
            <ProtectedRoute roles={['citizen']}><SOSRequestPage /></ProtectedRoute>
          } />

          <Route path="/ngos" element={
            <ProtectedRoute roles={['citizen']}><NGOSearchPage /></ProtectedRoute>
          } />

          {/* 403 Unauthorized */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <SmartAssistant />
      </BrowserRouter>
    </AuthProvider>
  );
}

import { useTranslation } from 'react-i18next';

function UnauthorizedPage() {
  const { t } = useTranslation();
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.25rem',
      textAlign: 'center',
      padding: '2rem',
      background: 'var(--bg-base)',
    }}>
      <div style={{
        width: 80, height: 80,
        borderRadius: '20px',
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem',
        animation: 'float 3s ease-in-out infinite',
      }}>
        🚫
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{t('hero.unauthorized.title')}</h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.7 }}>
        {t('hero.unauthorized.description')}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/dashboard" className="btn btn-primary btn-sm">{t('hero.unauthorized.dashboard_btn')}</Link>
        <Link to="/" className="btn btn-ghost btn-sm">{t('hero.unauthorized.home_btn')}</Link>
      </div>
    </div>
  );
}
