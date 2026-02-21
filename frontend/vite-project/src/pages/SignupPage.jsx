import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api.js';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import './Auth.css';

const VOLUNTEER_TYPES = [
    { key: 'medical', label: 'Medical / First Aid' },
    { key: 'rescue', label: 'Search & Rescue' },
    { key: 'logistics', label: 'Logistics & Delivery' },
    { key: 'communication', label: 'Communication' },
    { key: 'shelter', label: 'Shelter & Housing' },
    { key: 'food', label: 'Food Distribution' },
    { key: 'translation', label: 'Translation' },
    { key: 'other', label: 'Other' },
];

function getPasswordStrength(password) {
    if (!password) return { score: 0, level: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const map = {
        1: { level: 'weak' },
        2: { level: 'fair' },
        3: { level: 'good' },
        4: { level: 'strong' },
    };
    return { score, ...(map[score] || { level: '' }) };
}

// ----------------------------------------------------------------
// Sub-components — MUST live outside SignupPage so React keeps the
// same component identity across renders and inputs never lose focus
// ----------------------------------------------------------------

function StepProgress({ step }) {
    const { t } = useTranslation();
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, justifyContent: 'center', marginBottom: 4 }}>
            {[
                { n: 1, label: t('auth.signup.steps.role') },
                { n: 2, label: t('auth.signup.steps.details') },
                { n: 3, label: t('auth.signup.steps.verify') },
            ].map((s, i) => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: step > s.n ? 'var(--brand-primary)' : step === s.n ? 'rgba(230,57,70,0.15)' : 'var(--bg-elevated)',
                            border: `2px solid ${step >= s.n ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 700,
                            color: step > s.n ? '#fff' : step === s.n ? 'var(--brand-primary)' : 'var(--text-muted)',
                            transition: 'all 0.3s',
                        }}>
                            {step > s.n ? '✓' : s.n}
                        </div>
                        <span style={{
                            fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: step === s.n ? 'var(--brand-primary)' : 'var(--text-muted)',
                        }}>{s.label}</span>
                    </div>
                    {i < 2 && (
                        <div style={{
                            width: 48, height: 1, margin: '0 4px', marginBottom: 16,
                            background: step > s.n ? 'var(--brand-primary)' : 'var(--border-subtle)',
                            transition: 'background 0.3s',
                        }} />
                    )}
                </div>
            ))}
        </div>
    );
}

function Field({ id, label, type = 'text', placeholder, value, onChange, error, hint, required = true }) {
    return (
        <div className="form-group">
            <label className="form-label" htmlFor={id}>
                {label}{required && <span style={{ color: 'var(--brand-primary)', marginLeft: 2 }}>*</span>}
            </label>
            <input
                id={id}
                type={type}
                placeholder={placeholder}
                className={`form-input ${error ? 'error' : ''}`}
                value={value}
                onChange={onChange}
                autoComplete="off"
            />
            {hint && <span className="form-hint">{hint}</span>}
            {error && <span className="form-error">⚠ {error}</span>}
        </div>
    );
}

function PasswordField({ id, label, value, onChange, error, showPw, setShowPw, hint }) {
    const { t } = useTranslation();
    return (
        <div className="form-group">
            <label className="form-label" htmlFor={id}>
                {label}<span style={{ color: 'var(--brand-primary)', marginLeft: 2 }}>*</span>
            </label>
            <div className="input-wrapper">
                <input
                    id={id}
                    type={showPw ? 'text' : 'password'}
                    placeholder={t('auth.signup.form.password_placeholder')}
                    className={`form-input ${error ? 'error' : ''}`}
                    value={value}
                    onChange={onChange}
                    autoComplete="new-password"
                />
                <span
                    className="input-icon-right"
                    onClick={() => setShowPw(p => !p)}
                    role="button"
                    aria-label={showPw ? t('auth.login.hide_pw') : t('auth.login.show_pw')}
                >
                    {showPw ? '🙈' : '👁'}
                </span>
            </div>
            {hint && <span className="form-hint">{hint}</span>}
            {error && <span className="form-error">⚠ {error}</span>}
        </div>
    );
}

// ----------------------------------------------------------------
// Main component
// ----------------------------------------------------------------
export default function SignupPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');

    useEffect(() => {
        const queryRole = searchParams.get('role');
        const validRoles = ['citizen', 'volunteer', 'ngo'];
        if (queryRole && validRoles.includes(queryRole)) {
            setRole(queryRole);
            setStep(2);
        }
    }, [searchParams]);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [otpCode, setOtpCode] = useState('');
    const [resending, setResending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        ngo_name: '', contact_person: '', registration_number: '',
        services: '', location: '', skills: '', volunteer_type: '',
    });

    const ROLES = [
        {
            value: 'citizen',
            icon: '🏠',
            label: t('auth.signup.role_cards.citizen'),
            desc: t('auth.signup.role_cards.citizen_desc'),
            color: 'rgba(59,130,246,0.15)',
        },
        {
            value: 'volunteer',
            icon: '🤝',
            label: t('auth.signup.role_cards.volunteer'),
            desc: t('auth.signup.role_cards.volunteer_desc'),
            color: 'rgba(245,158,11,0.15)',
        },
        {
            value: 'ngo',
            icon: '🏢',
            label: t('auth.signup.role_cards.ngo'),
            desc: t('auth.signup.role_cards.ngo_desc'),
            color: 'rgba(168,85,247,0.15)',
        },
    ];

    const pwStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);

    const set = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // Strip spaces, dashes, parentheses so phone matches backend regex \+?[1-9]\d{7,14}
    const sanitizePhone = (raw) => raw.replace(/[\s\-().]/g, '');

    const buildPayload = () => {
        const base = { role, email: form.email, password: form.password };
        if (role === 'citizen') return { ...base, name: form.name, phone: sanitizePhone(form.phone) };
        if (role === 'volunteer') return {
            ...base, name: form.name, phone: sanitizePhone(form.phone), location: form.location,
            skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
            volunteer_type: form.volunteer_type,
        };
        if (role === 'ngo') return {
            ...base, ngo_name: form.ngo_name, contact_person: form.contact_person,
            location: form.location,
            registration_number: form.registration_number || undefined,
            services: form.services.split(',').map(s => s.trim()).filter(Boolean),
        };
    };

    const validate = () => {
        const e = {};
        if (!form.email) e.email = t('auth.signup.errors.email_required');
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('auth.signup.errors.email_invalid');
        if (!form.password) {
            e.password = t('auth.signup.errors.password_required');
        } else if (form.password.length < 8) {
            e.password = t('auth.signup.errors.password_min');
        } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
            e.password = t('auth.signup.errors.password_complexity');
        }
        if (form.password !== form.confirmPassword) e.confirmPassword = t('auth.signup.errors.password_match');

        if (role === 'citizen' || role === 'volunteer') {
            if (!form.name) e.name = t('auth.signup.errors.name_required');
            if (!form.phone) e.phone = t('auth.signup.errors.phone_required');
        }
        if (role === 'volunteer') {
            if (!form.skills) e.skills = t('auth.signup.errors.skills_required');
            if (!form.volunteer_type) e.volunteer_type = t('auth.signup.errors.volunteer_type_required');
            if (!form.location) e.location = t('auth.signup.errors.location_required');
        }
        if (role === 'ngo') {
            if (!form.ngo_name) e.ngo_name = t('auth.signup.errors.ngo_name_required');
            if (!form.contact_person) e.contact_person = t('auth.signup.errors.contact_person_required');
            if (!form.services) e.services = t('auth.signup.errors.services_required');
            if (!form.location) e.location = t('auth.signup.errors.location_required');
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await authApi.signup(buildPayload());
            setEmail(form.email);
            toast.success(t('auth.login.toast.success'));
            setStep(3);
        } catch (err) {
            if (err.errors) setErrors(err.errors);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otpCode.length !== 6) return toast.error(t('auth.login.toast.verify_code'));
        setLoading(true);
        try {
            const res = await authApi.verifyEmail({ email, otp: otpCode });
            toast.success(res.message || t('auth.login.toast.verify_success'));
            if (res.data?.status === 'active') navigate('/login?verified=1');
            else navigate('/pending');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await authApi.resendOtp({ email });
            toast.success(t('auth.login.toast.resend'));
            setOtpCode('');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setResending(false);
        }
    };

    const selectedRole = ROLES.find(r => r.value === role);

    // ================================================================
    // STEP 1 — Choose role
    // ================================================================
    if (step === 1) return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-bg-blob" />
                <div className="auth-bg-blob" />
            </div>

            <div className="auth-card auth-card-wide animate-scaleIn">
                <StepProgress step={step} />

                <div className="auth-brand">
                    <div className="auth-logo-wrap">
                        <div className="auth-logo">🛡</div>
                        <div className="auth-logo-ring" />
                    </div>
                    <div>
                        <div className="auth-app-name"><span>⚡</span><span>RescueLink</span></div>
                        <h1 className="auth-title">{t('auth.signup.title')}</h1>
                        <p className="auth-subtitle">{t('auth.signup.subtitle')}</p>
                    </div>
                </div>

                <div className="role-grid">
                    {ROLES.map(r => (
                        <button
                            key={r.value}
                            id={`role-${r.value}`}
                            className={`role-card ${role === r.value ? 'selected' : ''}`}
                            onClick={() => setRole(r.value)}
                        >
                            <div className="role-check">✓</div>
                            <div className="role-icon-wrap" style={{ background: r.color }}>
                                {r.icon}
                            </div>
                            <span className="role-name">{r.label}</span>
                            <span className="role-desc">{r.desc}</span>
                        </button>
                    ))}
                </div>

                <button
                    id="role-continue"
                    className="btn btn-primary btn-full btn-lg"
                    disabled={!role}
                    onClick={() => setStep(2)}
                >
                    {t('auth.signup.continue_as', { role: selectedRole?.label || '…' })}
                </button>

                <p className="auth-footer-text">
                    {t('auth.signup.already_have_account')}{' '}
                    <Link to="/login" className="auth-link">{t('auth.signup.signin')}</Link>
                </p>
            </div>
        </div>
    );

    // ================================================================
    // STEP 3 — OTP verification
    // ================================================================
    if (step === 3) return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-bg-blob" />
                <div className="auth-bg-blob" />
            </div>

            <div className="auth-card animate-scaleIn" style={{ maxWidth: 440 }}>
                <StepProgress step={step} />

                <div className="auth-brand">
                    <div className="auth-logo-wrap">
                        <div className="auth-logo" style={{ animation: 'none', fontSize: '2rem' }}>📧</div>
                    </div>
                    <div>
                        <h1 className="auth-title" style={{ fontSize: '1.625rem' }}>{t('auth.signup.verify.title')}</h1>
                        <p className="auth-subtitle">
                            {t('auth.signup.verify.subtitle')}<br />
                            <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>
                        </p>
                    </div>
                </div>

                <form onSubmit={handleVerify} className="auth-form" noValidate>
                    <div className="form-group">
                        <label className="form-label">{t('auth.signup.verify.label')}</label>
                        <input
                            id="otp-input"
                            className="form-input otp-input"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="••••••"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                            autoFocus
                            autoComplete="one-time-code"
                        />
                        <span className="form-hint">{t('auth.signup.verify.hint')}</span>
                    </div>

                    <button
                        id="otp-submit"
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading || otpCode.length !== 6}
                    >
                        {loading ? <><span className="btn-spinner" /> {t('auth.signup.verify.submitting_btn')}</> : t('auth.signup.verify.submit_btn')}
                    </button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <p className="auth-footer-text">{t('auth.signup.verify.resend_text')}</p>
                    <button
                        id="otp-resend"
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 8 }}
                        onClick={handleResend}
                        disabled={resending}
                    >
                        {resending ? <><span className="btn-spinner-dark" /> {t('auth.signup.verify.resending_btn')}</> : t('auth.signup.verify.resend_btn')}
                    </button>
                </div>

                <p className="auth-footer-text">
                    <button
                        className="auth-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
                        onClick={() => setStep(2)}
                    >
                        {t('auth.signup.verify.back_btn')}
                    </button>
                </p>
            </div>
        </div>
    );

    // ================================================================
    // STEP 2 — Registration form
    // ================================================================
    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-bg-blob" />
                <div className="auth-bg-blob" />
            </div>

            <div className="auth-card auth-card-wide animate-scaleIn" style={{ maxWidth: 560 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <StepProgress step={step} />
                    <button
                        className="auth-back-btn"
                        onClick={() => setStep(1)}
                        style={{ marginTop: 4, fontSize: '0.8rem' }}
                    >
                        {t('auth.signup.form.change_role_btn')}
                    </button>
                </div>

                <div className="auth-brand" style={{ gap: 'var(--space-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 8,
                            background: selectedRole?.color || 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.25rem',
                        }}>
                            {selectedRole?.icon}
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <div className="auth-app-name" style={{ marginBottom: 0 }}>
                                <span>⚡</span><span>RescueLink</span>
                            </div>
                        </div>
                    </div>
                    <h1 className="auth-title" style={{ fontSize: '1.625rem' }}>
                        {t('auth.signup.form.title', { role: selectedRole?.label })}
                    </h1>
                    <p className="auth-subtitle">{t('auth.signup.form.subtitle')}</p>
                </div>

                <form onSubmit={handleSignup} className="auth-form" noValidate>

                    {/* Citizen + Volunteer — full name */}
                    {(role === 'citizen' || role === 'volunteer') && (
                        <Field
                            id="signup-name" label={t('auth.signup.form.full_name_label')}
                            placeholder="Jane Doe"
                            value={form.name} onChange={set('name')} error={errors.name}
                        />
                    )}

                    {/* NGO specific */}
                    {role === 'ngo' && <>
                        <div className="form-row">
                            <Field
                                id="signup-ngo-name" label={t('auth.signup.form.ngo_name_label')}
                                placeholder="Help Foundation"
                                value={form.ngo_name} onChange={set('ngo_name')} error={errors.ngo_name}
                            />
                            <Field
                                id="signup-contact-person" label={t('auth.signup.form.contact_person_label')}
                                placeholder="John Smith"
                                value={form.contact_person} onChange={set('contact_person')} error={errors.contact_person}
                            />
                        </div>
                        <Field
                            id="signup-reg-num" label={t('auth.signup.form.reg_number_label')}
                            placeholder="NGO-12345 (optional)"
                            value={form.registration_number} onChange={set('registration_number')}
                            required={false}
                        />
                        <Field
                            id="signup-services" label={t('auth.signup.form.services_label')}
                            placeholder="food, shelter, medical, logistics"
                            value={form.services} onChange={set('services')} error={errors.services}
                            hint={t('auth.signup.form.services_hint')}
                        />
                    </>}

                    {/* Volunteer specific */}
                    {role === 'volunteer' && <>
                        <Field
                            id="signup-skills" label={t('auth.signup.form.skills_label')}
                            placeholder="first aid, driving, translation, cooking"
                            value={form.skills} onChange={set('skills')} error={errors.skills}
                            hint={t('auth.signup.form.skills_hint')}
                        />
                        <div className="form-group">
                            <label className="form-label" htmlFor="signup-vol-type">
                                {t('auth.signup.form.volunteer_type_label')}<span style={{ color: 'var(--brand-primary)', marginLeft: 2 }}>*</span>
                            </label>
                            <select
                                id="signup-vol-type"
                                className={`form-select ${errors.volunteer_type ? 'error' : ''}`}
                                value={form.volunteer_type}
                                onChange={set('volunteer_type')}
                            >
                                <option value="">{t('auth.signup.form.select_type')}</option>
                                {VOLUNTEER_TYPES.map(vt => (
                                    <option key={vt.key} value={vt.label}>{t(`auth.signup.volunteer_types.${vt.key}`)}</option>
                                ))}
                            </select>
                            {errors.volunteer_type && <span className="form-error">⚠ {errors.volunteer_type}</span>}
                        </div>
                    </>}

                    {/* Location for NGO + Volunteer */}
                    {(role === 'ngo' || role === 'volunteer') && (
                        <Field
                            id="signup-location" label={t('auth.signup.form.location_label')}
                            placeholder="Mumbai, Maharashtra"
                            value={form.location} onChange={set('location')} error={errors.location}
                        />
                    )}

                    {/* Email */}
                    <Field
                        id="signup-email"
                        label={t('auth.signup.form.email_label')} type="email"
                        placeholder="you@example.com"
                        value={form.email} onChange={set('email')} error={errors.email}
                    />

                    {/* Phone for Citizen + Volunteer */}
                    {(role === 'citizen' || role === 'volunteer') && (
                        <Field
                            id="signup-phone" label={t('auth.signup.form.phone_label')} type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            value={form.phone} onChange={set('phone')} error={errors.phone}
                        />
                    )}

                    {/* Password */}
                    <div>
                        <PasswordField
                            id="signup-password" label={t('auth.signup.form.password_label')}
                            value={form.password} onChange={set('password')} error={errors.password}
                            showPw={showPassword} setShowPw={setShowPassword}
                            hint={t('auth.signup.form.password_hint')}
                        />
                        {form.password && (
                            <div style={{ marginTop: 8 }}>
                                <div className="pw-strength">
                                    {[1, 2, 3, 4].map(i => (
                                        <div
                                            key={i}
                                            className={`pw-strength-bar ${i <= pwStrength.score ? `filled ${pwStrength.level}` : ''}`}
                                        />
                                    ))}
                                </div>
                                {pwStrength.level && (
                                    <span className={`pw-strength-label ${pwStrength.level}`}>
                                        {t(`auth.signup.pw_strength.${pwStrength.level}`)} {t('auth.signup.pw_strength.suffix')}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <PasswordField
                        id="signup-confirm-password" label={t('auth.signup.form.confirm_password_label')}
                        value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword}
                        showPw={showConfirm} setShowPw={setShowConfirm}
                        hint={t('auth.signup.form.confirm_hint')}
                    />

                    <button
                        id="signup-submit"
                        type="submit"
                        className="btn btn-primary btn-full btn-lg"
                        disabled={loading}
                        style={{ marginTop: 4 }}
                    >
                        {loading
                            ? <><span className="btn-spinner" /> {t('auth.signup.form.submitting_btn')}</>
                            : t('auth.signup.form.submit_btn', { role: selectedRole?.label })
                        }
                    </button>
                </form>

                <p className="auth-footer-text">
                    {t('auth.signup.already_have_account')}{' '}
                    <Link to="/login" className="auth-link">{t('auth.signup.signin')}</Link>
                </p>
            </div>
        </div>
    );
}
