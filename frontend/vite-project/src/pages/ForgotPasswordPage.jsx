import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api.js';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import './Auth.css';

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error(t('auth.forgot.email_required', 'Email is required'));
            return;
        }

        setLoading(true);
        try {
            await authApi.forgotPassword({ email });
            toast.success(t('auth.forgot.success', 'If an account exists, a reset code has been sent.'));
            navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err) {
            if (err.errors) {
                const firstMsg = Object.values(err.errors)[0];
                toast.error(firstMsg || err.message);
            } else {
                toast.error(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-bg-blob" />
                <div className="auth-bg-blob" />
                <div className="auth-bg-blob" />
            </div>

            <div className="auth-card animate-slideUp" style={{ maxWidth: 440 }}>
                <div className="auth-brand">
                    <div className="auth-logo-wrap">
                        <div className="auth-logo">🔒</div>
                        <div className="auth-logo-ring" />
                    </div>
                    <div>
                        <div className="auth-app-name">
                            <span>⚡</span>
                            <span>RescueLink</span>
                        </div>
                        <h1 className="auth-title">{t('auth.forgot.title', 'Reset Password')}</h1>
                        <p className="auth-subtitle">{t('auth.forgot.subtitle', 'Enter your email to receive a reset code')}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="form-group">
                        <label className="form-label">{t('auth.login.email_label', 'Email Address')}</label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading}
                    >
                        {loading ? t('auth.forgot.sending', 'Sending...') : t('auth.forgot.send_btn', 'Send Reset Code')}
                    </button>
                </form>

                <p className="auth-footer-text">
                    <Link to="/login" className="auth-link">{t('auth.forgot.back_to_login', 'Back to Login')}</Link>
                </p>
            </div>
        </div>
    );
}
