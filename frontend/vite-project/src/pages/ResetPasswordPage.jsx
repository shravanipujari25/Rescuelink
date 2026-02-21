import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '../services/api.js';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import './Auth.css';

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const queryEmail = new URLSearchParams(location.search).get('email') || '';

    const [form, setForm] = useState({
        email: queryEmail,
        otp: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!form.otp || !form.newPassword) {
            toast.error(t('auth.reset.missing_fields', 'Please fill in all fields'));
            return;
        }
        if (form.newPassword !== form.confirmPassword) {
            toast.error(t('auth.reset.password_mismatch', 'Passwords do not match'));
            setErrors({ confirmPassword: t('auth.reset.password_mismatch', 'Passwords do not match') });
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword({
                email: form.email,
                otp: form.otp,
                newPassword: form.newPassword
            });
            toast.success(t('auth.reset.success', 'Password reset successful! Please log in.'));
            navigate('/login');
        } catch (err) {
            if (err.errors) {
                setErrors(err.errors);
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
                        <div className="auth-logo">🔄</div>
                        <div className="auth-logo-ring" />
                    </div>
                    <div>
                        <div className="auth-app-name">
                            <span>⚡</span>
                            <span>RescueLink</span>
                        </div>
                        <h1 className="auth-title">{t('auth.reset.title', 'Set New Password')}</h1>
                        <p className="auth-subtitle">{t('auth.reset.subtitle', 'Enter the 6-digit code sent to your email')}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form" noValidate>
                    <div className="form-group">
                        <label className="form-label">{t('auth.login.email_label', 'Email Address')}</label>
                        <input
                            type="email"
                            className="form-input"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            readOnly={!!queryEmail}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.verify.otp_label', '6-Digit Code')}</label>
                        <input
                            type="text"
                            placeholder="000000"
                            className={`form-input ${errors.otp ? 'error' : ''}`}
                            style={{ letterSpacing: '8px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}
                            value={form.otp}
                            onChange={(e) => {
                                setForm({ ...form, otp: e.target.value.replace(/\D/g, '').slice(0, 6) });
                                setErrors({ ...errors, otp: '' });
                            }}
                        />
                        {errors.otp && <span className="form-error">⚠ {errors.otp}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.reset.new_password_label', 'New Password')}</label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className={`form-input ${errors.newPassword ? 'error' : ''}`}
                                value={form.newPassword}
                                onChange={(e) => {
                                    setForm({ ...form, newPassword: e.target.value });
                                    setErrors({ ...errors, newPassword: '' });
                                }}
                            />
                            <span className="input-icon-right" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? '🙈' : '👁'}
                            </span>
                        </div>
                        {errors.newPassword && <span className="form-error">⚠ {errors.newPassword}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('auth.reset.confirm_password_label', 'Confirm New Password')}</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                            value={form.confirmPassword}
                            onChange={(e) => {
                                setForm({ ...form, confirmPassword: e.target.value });
                                setErrors({ ...errors, confirmPassword: '' });
                            }}
                        />
                        {errors.confirmPassword && <span className="form-error">⚠ {errors.confirmPassword}</span>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading}
                    >
                        {loading ? t('auth.reset.submitting', 'Updating...') : t('auth.reset.submit_btn', 'Update Password')}
                    </button>
                </form>

                <p className="auth-footer-text">
                    <Link to="/login" className="auth-link">{t('auth.forgot.back_to_login', 'Back to Login')}</Link>
                </p>
            </div>
        </div>
    );
}

