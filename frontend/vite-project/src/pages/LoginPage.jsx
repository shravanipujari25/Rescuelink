import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import './Auth.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { t } = useTranslation();
    const from = location.state?.from?.pathname || '/dashboard';

    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const verified = new URLSearchParams(location.search).get('verified');

    const set = (field) => (e) => {
        setForm((p) => ({ ...p, [field]: e.target.value }));
        setErrors((p) => ({ ...p, [field]: '' }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = {};
        if (!form.email) errs.email = t('auth.login.errors.email_required');
        if (!form.password) errs.password = t('auth.login.errors.password_required');
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        try {
            const res = await authApi.login(form);
            const { token, userId, role, status, name, ngo_name, contact_person } = res.data;
            login({ userId, role, status, name, ngo_name, contact_person }, token);
            toast.success(t('auth.login.success', { role }));
            if (role === 'admin') navigate('/admin', { replace: true });
            else navigate(from, { replace: true });
        } catch (err) {
            toast.error(err.message);
            if (err.message?.includes('verify your email')) {
                setErrors({ email: t('auth.login.errors.email_verify') });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Animated background */}
            <div className="auth-bg">
                <div className="auth-bg-blob" />
                <div className="auth-bg-blob" />
                <div className="auth-bg-blob" />
            </div>

            <div className="auth-card animate-slideUp" style={{ maxWidth: 440 }}>

                {/* Success banner after email verification */}
                {verified && (
                    <div className="auth-banner success animate-fadeIn">
                        <span>✅</span>
                        <span>{t('auth.login.toast.verified_login')}</span>
                    </div>
                )}

                {/* Brand */}
                <div className="auth-brand">
                    <div className="auth-logo-wrap">
                        <div className="auth-logo">🛡</div>
                        <div className="auth-logo-ring" />
                    </div>
                    <div>
                        <div className="auth-app-name">
                            <span>⚡</span>
                            <span>RescueLink</span>
                        </div>
                        <h1 className="auth-title">{t('auth.login.title')}</h1>
                        <p className="auth-subtitle">{t('auth.login.subtitle')}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="auth-form" noValidate>

                    <div className="form-group">
                        <label className="form-label" htmlFor="login-email">{t('auth.login.email_label')}</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            value={form.email}
                            onChange={set('email')}
                            autoFocus
                            autoComplete="email"
                        />
                        {errors.email && <span className="form-error">⚠ {errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="login-password">{t('auth.login.password_label')}</label>
                        <div className="input-wrapper">
                            <input
                                id="login-password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('auth.login.password_placeholder')}
                                className={`form-input ${errors.password ? 'error' : ''}`}
                                value={form.password}
                                onChange={set('password')}
                                autoComplete="current-password"
                            />
                            <span
                                className="input-icon-right"
                                onClick={() => setShowPassword(p => !p)}
                                role="button"
                                aria-label={showPassword ? t('auth.login.hide_pw') : t('auth.login.show_pw')}
                            >
                                {showPassword ? '🙈' : '👁'}
                            </span>
                        </div>
                        {errors.password && <span className="form-error">⚠ {errors.password}</span>}
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '-var(--space-2)', marginBottom: 'var(--space-4)' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                            {t('auth.login.forgot_password', 'Forgot password?')}
                        </Link>
                    </div>

                    <button
                        id="login-submit"
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading}
                        style={{ marginTop: 4 }}
                    >
                        {loading ? <><span className="btn-spinner" /> {t('auth.login.submitting_btn')}</> : t('auth.login.submit_btn')}
                    </button>
                </form>

                {/* Role quick-info */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {[
                        { icon: '🏠', label: t('auth.login.roles.citizen') },
                        { icon: '🤝', label: t('auth.login.roles.volunteer') },
                        { icon: '🏢', label: t('auth.login.roles.ngo') },
                    ].map(r => (
                        <span
                            key={r.label}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                fontSize: '0.7rem', fontWeight: 600,
                                color: 'var(--text-muted)',
                                background: 'rgba(255,255,255,0.04)',
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-full)',
                                border: '1px solid var(--border-subtle)',
                            }}
                        >
                            {r.icon} {r.label}
                        </span>
                    ))}
                </div>

                <p className="auth-footer-text">
                    {t('auth.login.no_account')}{' '}
                    <Link to="/signup" className="auth-link">{t('auth.login.create_one')}</Link>
                </p>

                <p className="auth-footer-text" style={{ fontSize: '0.75rem' }}>
                    <Link to="/" className="auth-link" style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                        {t('auth.login.back_home')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
