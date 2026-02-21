import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import SOSButton from '../components/SOSButton.jsx';
import AssignedSOSList from '../components/AssignedSOSList.jsx';
import ResolvedSOSList from '../components/ResolvedSOSList.jsx';
import DonationTab from '../components/DonationTab.jsx';
import IncidentMap from '../components/IncidentMap.jsx';
import { sosApi } from '../services/api';
import './Dashboard.css';
import { useTranslation } from 'react-i18next';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview');
    const [activeSOS, setActiveSOS] = useState([]);

    const ROLE_META = {
        citizen: {
            icon: '🏠',
            color: 'blue',
            gradient: 'rgba(59,130,246,0.15)',
            heading: t('dashboard.roles.citizen.heading'),
            tagline: t('dashboard.roles.citizen.tagline'),
        },
        volunteer: {
            icon: '🤝',
            color: 'amber',
            gradient: 'rgba(245,158,11,0.15)',
            heading: t('dashboard.roles.volunteer.heading'),
            tagline: t('dashboard.roles.volunteer.tagline'),
        },
        ngo: {
            icon: '🏢',
            color: 'purple',
            gradient: 'rgba(168,85,247,0.15)',
            heading: t('dashboard.roles.ngo.heading'),
            tagline: t('dashboard.roles.ngo.tagline'),
        },
    };

    const STATUS_COLORS = {
        active: 'badge-active',
        pending: 'badge-pending',
        inactive: 'badge-inactive',
        unverified: 'badge-unverified',
        suspended: 'badge-suspended',
    };

    const ACTIONS_BY_ROLE = {
        citizen: [
            { icon: '🚨', label: t('dashboard.actions.report.label'), desc: t('dashboard.actions.report.desc'), color: 'rgba(239,68,68,0.15)', soon: true },
            { icon: '🆘', label: t('dashboard.actions.request.label'), desc: t('dashboard.actions.request.desc'), color: 'rgba(245,158,11,0.15)', soon: true },
            { icon: '🔍', label: t('dashboard.actions.ngo_search.label'), desc: t('dashboard.actions.ngo_search.desc'), color: 'rgba(168,85,247,0.15)', path: '/ngos' },
            { icon: '📍', label: t('dashboard.actions.resources.label'), desc: t('dashboard.actions.resources.desc'), color: 'rgba(59,130,246,0.15)', soon: true },
            { icon: '📡', label: t('dashboard.actions.updates.label'), desc: t('dashboard.actions.updates.desc'), color: 'rgba(16,185,129,0.15)', soon: true },
        ],
        volunteer: [
            { icon: '📋', label: t('dashboard.actions.tasks.label'), desc: t('dashboard.actions.tasks.desc'), color: 'rgba(59,130,246,0.15)', soon: true },
            { icon: '📍', label: t('dashboard.actions.checkin.label'), desc: t('dashboard.actions.checkin.desc'), color: 'rgba(16,185,129,0.15)', soon: true },
            { icon: '📡', label: t('dashboard.actions.reports.label'), desc: t('dashboard.actions.reports.desc'), color: 'rgba(245,158,11,0.15)', soon: true },
            { icon: '🤝', label: t('dashboard.actions.connect.label'), desc: t('dashboard.actions.connect.desc'), color: 'rgba(168,85,247,0.15)', soon: true },
        ],
        ngo: [
            { icon: '📦', label: t('dashboard.actions.inventory.label'), desc: t('dashboard.actions.inventory.desc'), color: 'rgba(168,85,247,0.15)', soon: true },
            { icon: '👥', label: t('dashboard.actions.roster.label'), desc: t('dashboard.actions.roster.desc'), color: 'rgba(59,130,246,0.15)', soon: true },
            { icon: '🗺', label: t('dashboard.actions.map.label'), desc: t('dashboard.actions.map.desc'), color: 'rgba(16,185,129,0.15)', soon: true },
            { icon: '📊', label: t('dashboard.actions.impact.label'), desc: t('dashboard.actions.impact.desc'), color: 'rgba(245,158,11,0.15)', soon: true },
        ]
    };

    const ACTIVITY = [
        { icon: '🟢', text: t('dashboard.activity.verified'), time: t('dashboard.activity.just_now'), color: 'var(--success)' },
        { icon: '🔵', text: t('dashboard.activity.profile'), time: t('dashboard.activity.today'), color: 'var(--info)' },
        { icon: '🛡', text: t('dashboard.activity.joined'), time: t('dashboard.activity.today'), color: 'var(--brand-primary)' },
    ];

    const roleInfo = ROLE_META[user?.role] || ROLE_META.citizen;
    const actions = ACTIONS_BY_ROLE[user?.role] || ACTIONS_BY_ROLE.citizen;
    const isPending = user?.status === 'pending' || user?.status === 'inactive';

    const handleComingSoon = () => toast(t('dashboard.coming_soon_toast'), { icon: '🚧' });

    const initials = user?.userId?.slice(0, 2).toUpperCase() || 'U?';

    const tabs = [
        { id: 'overview', label: t('dashboard.tabs.overview') },
        { id: 'profile', label: t('dashboard.tabs.profile') },
    ];

    if (user?.role !== 'citizen') {
        tabs.splice(1, 0, { id: 'assigned', label: t('dashboard.tabs.assigned') });
    }
    tabs.splice(tabs.length - 1, 0, { id: 'history', label: t('dashboard.tabs.history') || '📝 History' });
    tabs.splice(tabs.length - 1, 0, { id: 'donations', label: t('dashboard.donations.title') });

    useEffect(() => {
        // Safety check: reset activeTab if the role doesn't support the current tab
        if (activeTab === 'assigned' && user?.role === 'citizen') {
            setActiveTab('overview');
        }

        const fetchSOS = async () => {
            try {
                let res;
                if (user?.role === 'citizen') {
                    res = await sosApi.getMyActiveSOS();
                } else {
                    // Volunteers, NGOs, and Admins see assigned/nearby SOS
                    res = await sosApi.getAssigned();
                }

                // The backend returns { status: 'success', data: [...] }
                if (res.status === 'success' || res.success) {
                    const data = res.data || [];
                    setActiveSOS(data);
                    if (data.length > 0) {
                        console.log('📡 [Dashboard] Fetched SOS Data:');
                        console.table(data.map(item => ({
                            id: item.id.slice(0, 8),
                            type: item.emergency_type,
                            priority: item.priority || 'MISSING ❌',
                            description: item.description?.slice(0, 20)
                        })));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch SOS for map', err);
            }
        };

        fetchSOS();
        const interval = setInterval(fetchSOS, 10000);
        return () => clearInterval(interval);
    }, [user, activeTab]);

    return (
        <div className="dash-page">
            <header className="app-topbar">
                <div className="app-brand">
                    <div className="app-brand-logo">🛡</div>
                    <span className="app-brand-name">RescueLink</span>
                    <div className="app-brand-dot" />
                </div>

                <nav style={{ display: 'flex', gap: 4 }}>
                    {tabs.map(t_tab => (
                        <button
                            key={t_tab.id}
                            id={`tab-${t_tab.id}`}
                            onClick={() => setActiveTab(t_tab.id)}
                            style={{
                                padding: '6px 14px',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                background: activeTab === t_tab.id ? 'rgba(230,57,70,0.12)' : 'transparent',
                                color: activeTab === t_tab.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {t_tab.label}
                        </button>
                    ))}
                </nav>

                <div className="app-topbar-right">
                    <div className="app-user-pill">
                        <div className="app-user-avatar">{initials}</div>
                        <span className="hide-mobile">{t(`auth.signup.role_cards.${user?.role}`)}</span>
                    </div>
                    <button
                        id="logout-btn"
                        className="btn btn-ghost btn-sm"
                        onClick={logout}
                    >
                        {t('dashboard.profile.signout')}
                    </button>
                </div>
            </header>

            <main className="dash-main animate-fadeIn" style={{ margin: '0 auto', width: '100%' }}>

                {isPending && (
                    <div className="dash-notice warning animate-slideDown" style={{ marginBottom: 'var(--space-6)' }}>
                        <span className="dash-notice-icon">⏳</span>
                        <div>
                            <strong>{t('dashboard.notices.pending')}</strong>
                            <p>
                                {t('dashboard.notices.pending_desc', { role: t(`auth.signup.role_cards.${user?.role}`) })}
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <>
                        <div className="dash-hero animate-slideUp">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                                    background: roleInfo.gradient,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem',
                                }}>
                                    <span style={{ transform: 'scale(1.2)' }}>{roleInfo.icon}</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                                        {roleInfo.heading}
                                    </div>
                                    <h1 style={{ fontSize: '1.75rem', margin: '4px 0 0 0', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                        {t('dashboard.hero.welcome')}
                                    </h1>
                                </div>
                            </div>
                            <p className="dash-hero-sub">
                                {roleInfo.tagline}
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginTop: 4 }}>
                                {t('dashboard.hero.status')} <span className={`badge ${STATUS_COLORS[user?.status]}`} style={{ textTransform: 'uppercase' }}>{user?.status}</span>
                            </p>
                            {!isPending && (
                                <div className="dash-hero-actions">
                                    {user?.role === 'citizen' ? (
                                        <button
                                            id="hero-sos-btn"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => document.querySelector('.sos-button')?.click()}
                                        >
                                            {t('dashboard.hero.send_sos')}
                                        </button>
                                    ) : (
                                        <button id="quick-action-btn" className="btn btn-primary btn-sm" onClick={handleComingSoon}>
                                            {user?.role === 'volunteer'
                                                ? t('dashboard.hero.view_tasks')
                                                : t('dashboard.hero.manage_resources')}
                                        </button>
                                    )}
                                    <button className="btn btn-ghost btn-sm" onClick={handleComingSoon}>
                                        {t('dashboard.hero.live_updates')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 📍 LEAFLET MAP INTEGRATION */}
                        <div className="section animate-slideUp delay-100" style={{ marginBottom: 'var(--space-8)' }}>
                            <div className="section-header">
                                <h3 className="section-title">📍 {t('dashboard.actions.map.label')}</h3>
                                <span className="badge badge-active">{t('dashboard.hero.live_updates')}</span>
                            </div>
                            <IncidentMap incidents={activeSOS} />
                        </div>

                        {user?.role === 'citizen' && activeSOS.length > 0 && (
                            <div className="section animate-slideDown" style={{ marginBottom: '2rem' }}>
                                <div className="section-header">
                                    <h3 className="section-title" style={{ color: '#ef4444' }}>{t('dashboard.sections.active_sos')}</h3>
                                </div>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {activeSOS.map(sos => (
                                        <div key={sos.id} style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '1px solid #ef4444',
                                            borderRadius: '12px',
                                            padding: '1.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h4 style={{ margin: 0, textTransform: 'capitalize' }}>
                                                        {t('dashboard.sos_card.emergency', { type: t(`sos.types.${sos.emergency_type}`) })}
                                                    </h4>
                                                    <span style={{ fontSize: '0.875rem', color: '#fca5a5' }}>
                                                        {t('dashboard.sos_card.reported', { time: new Date(sos.created_at).toLocaleTimeString() })}
                                                    </span>
                                                </div>
                                                <span className="badge badge-active" style={{ background: '#ef4444', color: 'white' }}>
                                                    {sos.status === 'assigned'
                                                        ? t('dashboard.sos_card.status_assigned')
                                                        : t('dashboard.sos_card.status_requested')}
                                                </span>
                                            </div>

                                            {sos.assigned_to ? (
                                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                                    <strong>{t('dashboard.sos_card.responder')}</strong> {sos.assigned_user?.name || 'RescueLink Unit'} <br />
                                                    <strong>{t('dashboard.sos_card.contact')}</strong> {sos.assigned_user?.phone || 'N/A'}
                                                </div>
                                            ) : (
                                                <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                                                    {t('dashboard.sos_card.searching')}
                                                </div>
                                            )}

                                            {sos.responder_location ? (
                                                <div style={{ marginTop: '0.5rem' }}>
                                                    <p style={{ color: '#4ade80', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                                        {t('dashboard.sos_card.live')}
                                                    </p>
                                                    <a
                                                        href={`https://www.google.com/maps/dir/?api=1&destination=${sos.responder_location.latitude},${sos.responder_location.longitude}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn btn-primary btn-sm"
                                                        style={{ background: '#22c55e', border: 'none', width: '100%', justifyContent: 'center' }}
                                                    >
                                                        {t('dashboard.sos_card.track')}
                                                    </a>
                                                </div>
                                            ) : sos.assigned_to ? (
                                                <div style={{ color: '#fbbf24', fontSize: '0.9rem' }}>
                                                    {t('dashboard.sos_card.waiting_location')}
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="stats-grid animate-fadeIn delay-100">
                            <div className="stat-card">
                                <div className="stat-icon brand">📋</div>
                                <div>
                                    <div className="stat-label">{t('dashboard.stats.role')}</div>
                                    <div className="stat-value" style={{ fontSize: '1.125rem', textTransform: 'capitalize' }}>
                                        {t(`auth.signup.role_cards.${user?.role}`)}
                                    </div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon blue">🔒</div>
                                <div>
                                    <div className="stat-label">{t('dashboard.stats.status')}</div>
                                    <div className="stat-value" style={{ fontSize: '1.125rem', textTransform: 'capitalize' }}>
                                        {user?.status}
                                    </div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon emerald">🛡</div>
                                <div>
                                    <div className="stat-label">{t('dashboard.stats.network')}</div>
                                    <div className="stat-value" style={{ fontSize: '1.125rem' }}>RescueLink</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon amber">🆔</div>
                                <div>
                                    <div className="stat-label">{t('dashboard.stats.user_id')}</div>
                                    <div className="stat-value font-mono" style={{ fontSize: '0.875rem' }}>
                                        {user?.userId?.slice(0, 10)}…
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="section animate-fadeIn delay-200">
                            <div className="section-header">
                                <h3 className="section-title">{t('dashboard.sections.quick_actions')}</h3>
                                <span className="badge badge-new">{t('dashboard.sections.coming_soon')}</span>
                            </div>
                            <div className="action-cards">
                                {actions.map((action) => (
                                    <div
                                        key={action.label}
                                        id={`action-${action.label.replace(/\s+/g, '-').toLowerCase()}`}
                                        className="action-card"
                                        onClick={() => action.path ? navigate(action.path) : handleComingSoon()}
                                        style={{ opacity: isPending ? 0.5 : 1, pointerEvents: isPending ? 'none' : 'auto' }}
                                    >
                                        <div className="action-card-icon" style={{ background: action.color }}>
                                            {action.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="action-card-label">{action.label}</div>
                                            <div className="action-card-desc">{action.desc}</div>
                                        </div>
                                        <span className="action-card-arrow">→</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="section animate-fadeIn delay-300">
                            <div className="section-header">
                                <h3 className="section-title">{t('dashboard.sections.recent_activity')}</h3>
                            </div>
                            <div className="table-wrap" style={{ padding: 'var(--space-4)' }}>
                                <div className="activity-list">
                                    {ACTIVITY.map((item, i) => (
                                        <div key={i} className="activity-item">
                                            <div className="activity-dot" style={{ background: item.color }} />
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{item.text}</span>
                                            <span className="activity-time">{item.time}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'profile' && (
                    <div className="animate-fadeIn">
                        <div className="page-header">
                            <h1>{t('dashboard.profile.title')}</h1>
                            <p>{t('dashboard.profile.desc')}</p>
                        </div>

                        <div className="profile-card animate-slideUp" style={{ marginBottom: 'var(--space-6)' }}>
                            <div className="profile-avatar">{roleInfo.icon}</div>
                            <div className="profile-info">
                                <div className="profile-name">
                                    {user?.role === 'admin' ? t('admin.topbar.admin_user') : `${t(`auth.signup.role_cards.${user?.role}`)} ${t('dashboard.profile.field_role')}`}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{t('dashboard.profile.joined')}</div>
                                <div className="profile-meta">
                                    <span className={`badge ${STATUS_COLORS[user?.status]}`}>{t(`dashboard.profile.statuses.${user?.status}`) || user?.status}</span>
                                    {user?.role && <span className={`badge badge-${user?.role}`}>{t(`auth.signup.role_cards.${user?.role}`)}</span>}
                                </div>
                            </div>
                        </div>

                        <div className="table-wrap animate-slideUp delay-100">
                            <div className="table-header">
                                <span className="table-title">{t('dashboard.profile.details')}</span>
                            </div>
                            {[
                                { label: t('dashboard.profile.field_uid'), value: user?.userId, mono: true },
                                { label: t('dashboard.profile.field_role'), value: t(`auth.signup.role_cards.${user?.role}`) },
                                { label: t('dashboard.profile.field_status'), value: t(`dashboard.profile.statuses.${user?.status}`) || user?.status },
                                { label: t('dashboard.profile.field_platform'), value: 'RescueLink Disaster Management' },
                            ].map((row) => (
                                <div
                                    key={row.label}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--space-3) var(--space-5)',
                                        borderBottom: '1px solid var(--border-subtle)',
                                    }}
                                >
                                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {row.label}
                                    </span>
                                    <span style={{
                                        fontSize: '0.875rem',
                                        color: 'var(--text-primary)',
                                        fontFamily: row.mono ? 'monospace' : 'inherit',
                                        fontWeight: 500,
                                    }}>
                                        {row.value || '—'}
                                    </span>
                                </div>
                            ))}
                            <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', gap: 'var(--space-3)' }}>
                                <button className="btn btn-danger btn-sm" onClick={logout} id="profile-logout-btn">
                                    {t('dashboard.profile.signout')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'assigned' && user?.role !== 'citizen' && (
                    <div className="animate-fadeIn">
                        <div className="page-header">
                            <h1>{t('dashboard.assigned.title')}</h1>
                            <p>{t('dashboard.assigned.desc')}</p>
                        </div>
                        <AssignedSOSList />
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="animate-fadeIn">
                        <div className="page-header">
                            <h1>{t('dashboard.history.title') || 'Resolved Issues'}</h1>
                            <p>{t('dashboard.history.desc') || 'History of addressed emergency requests.'}</p>
                        </div>
                        <ResolvedSOSList />
                    </div>
                )}

                {activeTab === 'donations' && <DonationTab user={user} />}
            </main>
            {user?.role === 'citizen' && <SOSButton />}
        </div>
    );
}

