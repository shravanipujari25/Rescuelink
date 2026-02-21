import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector.jsx';
import { publicApi } from '../services/api.js';
import './Landing.css';

export default function LandingPage() {
    const { isAuthenticated, user } = useAuth();
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        activeIncidents: 0,
        volunteersOnline: 0,
        totalRescues: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await publicApi.getStats();
                if (res.success) {
                    setStats(res.data);
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            }
        };

        fetchStats();
        // Refresh stats every minute
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);


    const dashDest = user?.role === 'admin' ? '/admin' : '/dashboard';

    const FEATURES = [
        {
            icon: '🚨',
            emoji_bg: 'rgba(239,68,68,0.15)',
            title: t('hero.features.reporting.title'),
            desc: t('hero.features.reporting.desc'),
        },
        {
            icon: '📡',
            emoji_bg: 'rgba(59,130,246,0.15)',
            title: t('hero.features.alerts.title'),
            desc: t('hero.features.alerts.desc'),
        },
        {
            icon: '🤝',
            emoji_bg: 'rgba(245,158,11,0.15)',
            title: t('hero.features.volunteer.title'),
            desc: t('hero.features.volunteer.desc'),
        },
        {
            icon: '🏢',
            emoji_bg: 'rgba(168,85,247,0.15)',
            title: t('hero.features.ngo.title'),
            desc: t('hero.features.ngo.desc'),
        },
        {
            icon: '🗺',
            emoji_bg: 'rgba(16,185,129,0.15)',
            title: t('hero.features.map.title'),
            desc: t('hero.features.map.desc'),
        },
        {
            icon: '🔑',
            emoji_bg: 'rgba(230,57,70,0.15)',
            title: t('hero.features.rbac.title'),
            desc: t('hero.features.rbac.desc'),
        },
    ];

    const ROLES = [
        {
            id: 'citizen',
            icon: '🏠',
            color: 'rgba(59,130,246,0.12)',
            borderColor: 'rgba(59,130,246,0.2)',
            badge: 'badge-citizen',
        },
        {
            id: 'volunteer',
            icon: '🤝',
            color: 'rgba(245,158,11,0.12)',
            borderColor: 'rgba(245,158,11,0.2)',
            badge: 'badge-volunteer',
        },
        {
            id: 'ngo',
            icon: '🏢',
            color: 'rgba(168,85,247,0.12)',
            borderColor: 'rgba(168,85,247,0.2)',
            badge: 'badge-ngo',
        },
        {
            id: 'admin',
            icon: '🔑',
            color: 'rgba(230,57,70,0.12)',
            borderColor: 'rgba(230,57,70,0.25)',
            badge: 'badge-admin',
        },
    ];

    return (
        <div className="landing-page">

            {/* ---- Navigation ---- */}
            <nav className="landing-nav">
                <div className="landing-nav-brand">
                    <div className="landing-nav-logo">🛡</div>
                    <span className="landing-nav-name">GeoGuard</span>
                </div>

                <div className="landing-nav-links hide-mobile">
                    <a href="#features" className="landing-nav-link">{t('nav.features')}</a>
                    <a href="#roles" className="landing-nav-link">{t('nav.who_its_for')}</a>
                </div>

                <div className="landing-nav-actions">
                    <LanguageSelector />
                    {isAuthenticated ? (
                        <Link to={dashDest} className="btn btn-primary btn-sm">
                            {t('nav.dashboard')} →
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-ghost btn-sm hide-mobile">{t('nav.signin')}</Link>
                            <Link to="/signup" className="btn btn-primary btn-sm">{t('nav.register')} →</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* ---- Hero ---- */}
            <section className="landing-hero">
                <div className="hero-bg">
                    <div className="hero-bg-circle" />
                    <div className="hero-bg-circle" />
                </div>

                <div className="hero-eyebrow animate-slideDown">
                    <div className="hero-eyebrow-dot" />
                    {t('hero.eyebrow')}
                </div>

                <h1 className="hero-title animate-slideUp">
                    {t('hero.title_part1')}<br />
                    <span className="hero-title-accent">{t('hero.title_accent')}</span>
                </h1>

                <p className="hero-subtitle animate-slideUp delay-100">
                    {t('hero.subtitle')}
                </p>

                <div className="hero-cta animate-slideUp delay-200" style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                        <Link to="/signup" id="hero-cta-signup" className="btn btn-primary btn-xl">
                            {t('hero.join_network')} →
                        </Link>
                        <Link to="/login" id="hero-cta-login" className="btn btn-secondary btn-xl">
                            {t('nav.signin')}
                        </Link>
                    </div>
                    <Link
                        to="/signup?role=citizen"
                        className="btn btn-danger btn-xl"
                        style={{ marginTop: 'var(--space-4)', width: '100%', maxWidth: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                    >
                        <span>🆘</span>
                        <span>{t('hero.emergency_demo')}</span>
                    </Link>
                </div>
            </section>

            {/* ---- Platform Stats Section ---- */}
            <section className="stats-section animate-fadeIn">
                <div className="container">
                    <div className="stats-header">
                        <div className="stats-live-tag">
                            <span className="live-dot"></span>
                            LIVE PLATFORM ACTIVITY
                        </div>
                        <h2 className="stats-title">Real-Time Impact</h2>
                    </div>
                    <div className="stats-grid">
                        <div className="stats-card">
                            <div className="stats-val" style={{ color: 'var(--brand-primary)' }}>{stats.activeIncidents}</div>
                            <div className="stats-label">Active Incidents</div>
                        </div>
                        <div className="stats-card">
                            <div className="stats-val" style={{ color: 'var(--success)' }}>{stats.volunteersOnline}</div>
                            <div className="stats-label">Volunteers Online</div>
                        </div>
                        <div className="stats-card">
                            <div className="stats-val">{stats.totalRescues}</div>
                            <div className="stats-label">Total Rescues</div>
                        </div>
                    </div>
                </div>
            </section>







            {/* ---- Features ---- */}
            <section className="landing-section" id="features">
                <div className="container">
                    <div className="landing-section-header">
                        <div className="landing-section-tag">
                            <span>⚡</span>
                            <span>{t('hero.features.tag')}</span>
                        </div>
                        <h2 className="landing-section-title">
                            {t('hero.features.title')}
                        </h2>
                        <p className="landing-section-subtitle">
                            {t('hero.features.subtitle')}
                        </p>
                    </div>

                    <div className="features-grid">
                        {FEATURES.map((f, i) => (
                            <div key={f.title} className={`feature-card animate-fadeIn`} style={{ animationDelay: `${i * 80}ms` }}>
                                <div className="feature-icon" style={{ background: f.emoji_bg }}>
                                    {f.icon}
                                </div>
                                <div className="feature-title">{f.title}</div>
                                <div className="feature-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- Roles ---- */}
            <section className="landing-section" id="roles" style={{ paddingTop: 0 }}>
                <div className="container">
                    <div className="landing-section-header">
                        <div className="landing-section-tag">
                            <span>👥</span>
                            <span>{t('hero.roles.tag')}</span>
                        </div>
                        <h2 className="landing-section-title">{t('hero.roles.title')}</h2>
                        <p className="landing-section-subtitle">
                            {t('hero.roles.subtitle')}
                        </p>
                    </div>

                    <div className="roles-grid">
                        {ROLES.map((role) => (
                            <div
                                key={role.id}
                                className="role-feature-card"
                                style={{ background: role.color, borderColor: role.borderColor, border: `1px solid ${role.borderColor}` }}
                            >
                                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-3)' }}>{role.icon}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
                                    <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>
                                        {t(`hero.roles.${role.id}.title`)}
                                    </span>
                                    <span className={`badge ${role.badge}`}>{t(`hero.roles.${role.id}.badge`)}</span>
                                </div>
                                <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {t(`hero.roles.${role.id}.perks`, { returnObjects: true })?.map?.(p => (
                                        <li key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ color: 'var(--success)', fontSize: '0.75rem' }}>✓</span>
                                            {p}
                                        </li>
                                    )) || null}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---- CTA ---- */}
            <section className="landing-cta" id="cta">
                <div className="landing-cta-inner">
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        background: 'rgba(230,57,70,0.1)', border: '1px solid rgba(230,57,70,0.2)',
                        borderRadius: 'var(--radius-full)', padding: '6px 16px',
                        fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-primary)',
                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-6)',
                    }}>
                        {t('hero.cta.tag')}
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900,
                        letterSpacing: '-0.02em', marginBottom: 'var(--space-4)',
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                    }}>
                        {t('hero.cta.title')}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', fontSize: '1rem', lineHeight: 1.7 }}>
                        {t('hero.cta.desc')}
                    </p>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/signup" id="cta-signup" className="btn btn-primary btn-xl">
                            {t('hero.cta.btn')}
                        </Link>
                        <Link to="/login" className="btn btn-ghost btn-xl">
                            {t('nav.signin')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ---- Footer ---- */}
            <footer className="landing-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <span>🛡</span>
                    <strong style={{ color: 'var(--text-secondary)' }}>GeoGuard</strong>
                    <span>— {t('hero.footer.subtitle')}</span>
                </div>

                <div style={{ display: 'flex', gap: 'var(--space-5)' }}>
                    <Link to="/login" className="landing-nav-link" style={{ fontSize: '0.8rem' }}>{t('nav.signin')}</Link>
                    <Link to="/signup" className="landing-nav-link" style={{ fontSize: '0.8rem' }}>{t('nav.register')}</Link>
                </div>

                <div>{t('hero.footer.credit')}</div>
            </footer>
        </div>
    );
}
