import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Auth.css';

export default function PendingPage() {
    const { t } = useTranslation();

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-bg-blob" />
                <div className="auth-bg-blob" />
            </div>

            <div className="auth-card animate-scaleIn" style={{ maxWidth: 520, textAlign: 'center', alignItems: 'center' }}>

                {/* Animated clock icon */}
                <div style={{
                    width: 80, height: 80,
                    borderRadius: 'var(--radius-xl)',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245,158,11,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.5rem',
                    animation: 'float 3s ease-in-out infinite',
                }}>
                    ⏳
                </div>

                <div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                        borderRadius: 'var(--radius-full)', padding: '4px 12px',
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.08em', color: 'var(--warning)',
                        marginBottom: 'var(--space-3)',
                    }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: 'var(--warning)',
                            animation: 'pulse-glow 2s ease-in-out infinite',
                        }} />
                        {t('auth.pending.status')}
                    </div>

                    <h1 style={{ fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 'var(--space-3)' }}>
                        {t('auth.pending.title')}
                    </h1>

                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 380, margin: '0 auto', whiteSpace: 'pre-line' }}>
                        {t('auth.pending.description')}
                    </p>
                </div>

                {/* Timeline */}
                <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-xl)',
                    padding: 'var(--space-5) var(--space-6)',
                    width: '100%',
                    textAlign: 'left',
                }}>
                    {[
                        { icon: '✅', label: t('auth.pending.timeline.verified'), status: 'done', desc: t('auth.pending.timeline.verified_desc') },
                        { icon: '🔍', label: t('auth.pending.timeline.review'), status: 'active', desc: t('auth.pending.timeline.review_desc') },
                        { icon: '🚀', label: t('auth.pending.timeline.activated'), status: 'pending', desc: t('auth.pending.timeline.activated_desc') },
                    ].map((step, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: i < 2 ? 'var(--space-4)' : 0 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: step.status === 'done' ? 'rgba(34,197,94,0.15)'
                                    : step.status === 'active' ? 'rgba(245,158,11,0.15)'
                                        : 'rgba(255,255,255,0.04)',
                                border: `1px solid ${step.status === 'done' ? 'rgba(34,197,94,0.3)'
                                    : step.status === 'active' ? 'rgba(245,158,11,0.3)'
                                        : 'var(--border-subtle)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem',
                            }}>
                                {step.icon}
                            </div>
                            <div>
                                <div style={{
                                    fontWeight: 700, fontSize: '0.875rem',
                                    color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)',
                                }}>
                                    {step.label}
                                    {step.status === 'active' && (
                                        <span style={{ marginLeft: 8, fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--warning)' }}>
                                            {t('auth.pending.timeline.in_progress')}
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 2 }}>{step.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    background: 'rgba(59,130,246,0.06)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-4)',
                    fontSize: '0.8125rem',
                    color: 'var(--info)',
                    width: '100%',
                    textAlign: 'center',
                }} dangerouslySetInnerHTML={{ __html: t('auth.pending.info') }} />

                <Link to="/login" className="btn btn-ghost" id="pending-back-btn">
                    {t('auth.pending.back_btn')}
                </Link>
            </div>
        </div>
    );
}
