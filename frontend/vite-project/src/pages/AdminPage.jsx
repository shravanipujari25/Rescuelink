import { useState, useEffect, useCallback, Component } from 'react';
import { adminApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import './Dashboard.css';
import { useTranslation } from 'react-i18next';

export default function AdminPage() {
    const { logout } = useAuth();
    const { t } = useTranslation();
    const [view, setView] = useState('dashboard');
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const NAV = [
        { id: 'dashboard', icon: '📊', label: t('admin.sidebar.overview') },
        { id: 'pending', icon: '⏳', label: t('admin.sidebar.pending') },
        { id: 'users', icon: '👥', label: t('admin.sidebar.users') },
    ];

    const loadStats = useCallback(async () => {
        try {
            const res = await adminApi.dashboard();
            setStats(res.data);
        } catch (err) { toast.error(err.message); }
    }, []);

    const loadUsers = useCallback(async (pending = false) => {
        setLoading(true);
        try {
            const res = pending ? await adminApi.pending() : await adminApi.listUsers();
            setUsers(res.data);
        } catch (err) { toast.error(err.message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    useEffect(() => {
        if (view === 'pending') loadUsers(true);
        if (view === 'users') loadUsers(false);
        setSearchQuery('');
    }, [view, loadUsers]);

    const action = async (fn, successMsg, userId) => {
        try {
            await fn(userId);
            toast.success(successMsg);
            if (view === 'pending') loadUsers(true);
            if (view === 'users') loadUsers(false);
            loadStats();
        } catch (err) { toast.error(err.message); }
    };

    const filteredUsers = users.filter(u => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            u.email?.toLowerCase().includes(q) ||
            u.name?.toLowerCase().includes(q) ||
            u.ngo_name?.toLowerCase().includes(q) ||
            u.contact_person?.toLowerCase().includes(q) ||
            u.role?.includes(q)
        );
    });

    const initials = 'AD';

    const STAT_CARDS = stats ? [
        { icon: '👥', label: t('admin.overview.total_users'), value: stats.total, color: 'blue' },
        { icon: '🏠', label: t('admin.overview.citizens'), value: stats.byRole?.citizen || 0, color: 'blue' },
        { icon: '🏢', label: t('admin.overview.ngos'), value: stats.byRole?.ngo || 0, color: 'purple' },
        { icon: '🤝', label: t('admin.overview.volunteers'), value: stats.byRole?.volunteer || 0, color: 'amber' },
        { icon: '✅', label: t('admin.overview.active'), value: stats.byStatus?.active || 0, color: 'emerald' },
        {
            icon: '⏳', label: t('admin.overview.pending'), value: stats.pendingApproval,
            color: stats.pendingApproval > 0 ? 'brand' : 'emerald',
            highlight: stats.pendingApproval > 0,
        },
    ] : [];

    return (
        <ErrorBoundary>
            <div className="dash-page">
                {/* Topbar */}
                <header className="app-topbar">
                    <div className="app-brand">
                        <div className="app-brand-logo">🛡</div>
                        <span className="app-brand-name">RescueLink</span>
                        <span className="badge badge-admin" style={{ marginLeft: 4 }}>{t('admin.topbar.admin_badge')}</span>
                    </div>

                    <div className="app-topbar-right">
                        <div className="app-user-pill">
                            <div className="app-user-avatar">{initials}</div>
                            <span className="hide-mobile">{t('admin.topbar.admin_user')}</span>
                        </div>
                        <button id="admin-logout-btn" className="btn btn-ghost btn-sm" onClick={logout}>
                            {t('admin.topbar.signout')}
                        </button>
                    </div>
                </header>

                <div className="admin-grid">
                    {/* Sidebar */}
                    <nav className="admin-sidebar">
                        <div style={{ padding: 'var(--space-3) var(--space-4) var(--space-1)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                            {t('admin.sidebar.administration')}
                        </div>
                        {NAV.map(n => (
                            <button
                                key={n.id}
                                id={`admin-nav-${n.id}`}
                                className={`admin-nav-item ${view === n.id ? 'active' : ''}`}
                                onClick={() => setView(n.id)}
                            >
                                <span className="admin-nav-icon">{n.icon}</span>
                                {n.label}
                                {n.id === 'pending' && stats?.pendingApproval > 0 && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        background: 'var(--brand-primary)',
                                        color: '#fff',
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        padding: '1px 6px',
                                        borderRadius: 'var(--radius-full)',
                                    }}>
                                        {stats.pendingApproval}
                                    </span>
                                )}
                            </button>
                        ))}

                        {/* Sidebar footer */}
                        <div style={{ marginTop: 'auto', padding: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                                {t('admin.sidebar.footer_title')}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', opacity: 0.6 }}>
                                {t('admin.sidebar.footer_ver')}
                            </div>
                        </div>
                    </nav>

                    {/* Content */}
                    <main className="admin-content">

                        {/* ---- Overview / Stats ---- */}
                        {view === 'dashboard' && (
                            <div className="animate-fadeIn">
                                <div className="admin-content-header">
                                    <h2>{t('admin.overview.title')}</h2>
                                    <p>{t('admin.overview.desc')}</p>
                                </div>

                                {stats ? (
                                    <>
                                        <div className="admin-stats">
                                            {STAT_CARDS.map((s) => (
                                                <div
                                                    key={s.label}
                                                    className={`admin-stat ${s.highlight ? 'highlight' : ''}`}
                                                    onClick={s.highlight ? () => setView('pending') : undefined}
                                                    style={{ cursor: s.highlight ? 'pointer' : 'default' }}
                                                >
                                                    <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{s.icon}</div>
                                                    <div className="admin-stat-num">{s.value}</div>
                                                    <div className="admin-stat-label">{s.label}</div>
                                                    {s.highlight && (
                                                        <div style={{ fontSize: '0.6875rem', color: 'var(--warning)', marginTop: 4, fontWeight: 600 }}>
                                                            {t('admin.overview.click_review')}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {stats.pendingApproval > 0 && (
                                            <div className="dash-notice warning animate-slideDown" style={{ marginBottom: 'var(--space-6)' }}>
                                                <span className="dash-notice-icon">⚠️</span>
                                                <div>
                                                    <strong>{t(stats.pendingApproval > 1 ? 'admin.overview.awaiting_plural' : 'admin.overview.awaiting', { count: stats.pendingApproval })}</strong>
                                                    <p>
                                                        {t('admin.overview.review_notice')}{' '}
                                                        <button
                                                            id="review-pending-btn"
                                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warning)', fontWeight: 600, fontSize: '0.8125rem' }}
                                                            onClick={() => setView('pending')}
                                                        >
                                                            {t('admin.overview.review_now')}
                                                        </button>
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Platform health */}
                                        <div className="table-wrap" style={{ marginTop: 'var(--space-6)' }}>
                                            <div className="table-header">
                                                <span className="table-title">{t('admin.overview.breakdown')}</span>
                                            </div>
                                            <div style={{ padding: 'var(--space-4)' }}>
                                                {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                                                    <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                                                        <span className={`badge badge-${status}`} style={{ width: 80, justifyContent: 'center' }}>
                                                            {status}
                                                        </span>
                                                        <div style={{ flex: 1, height: 6, background: 'var(--border-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                                            <div style={{
                                                                height: '100%',
                                                                width: `${stats.total ? Math.round((count / stats.total) * 100) : 0}%`,
                                                                background: 'var(--brand-primary)',
                                                                borderRadius: 'var(--radius-full)',
                                                                transition: 'width 0.6s ease',
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: 28 }}>{count}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                            {stats.total ? Math.round((count / stats.total) * 100) : 0}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="admin-loading">
                                        <div className="spinner" style={{ margin: '0 auto 12px' }} />
                                        {t('admin.overview.loading')}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ---- Pending Approvals ---- */}
                        {view === 'pending' && (
                            <div className="animate-fadeIn">
                                <div className="admin-content-header">
                                    <h2>{t('admin.pending.title')}</h2>
                                    <p>{t('admin.pending.desc')}</p>
                                </div>
                                <UsersTable
                                    users={filteredUsers}
                                    loading={loading}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    emptyMsg={t('admin.pending.empty')}
                                    showSearch={false}
                                    renderActions={(u) => (
                                        <div className="admin-actions">
                                            <button
                                                className="btn btn-success btn-sm"
                                                id={`approve-${u.id}`}
                                                onClick={() => action((id) => adminApi.approve(id), t('admin.toast.approve_success'), u.id)}
                                            >
                                                {t('admin.table.btn_approve')}
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                id={`reject-${u.id}`}
                                                onClick={() => action((id) => adminApi.reject(id), t('admin.toast.reject_success'), u.id)}
                                            >
                                                {t('admin.table.btn_reject')}
                                            </button>
                                        </div>
                                    )}
                                />
                            </div>
                        )}

                        {/* ---- All Users ---- */}
                        {view === 'users' && (
                            <div className="animate-fadeIn">
                                <div className="admin-content-header">
                                    <h2>{t('admin.all_users.title')}</h2>
                                    <p>{t('admin.all_users.desc')}</p>
                                </div>
                                <UsersTable
                                    users={filteredUsers}
                                    loading={loading}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    emptyMsg={t('admin.all_users.empty')}
                                    showSearch={true}
                                    renderActions={(u) => {
                                        if (u.role === 'admin') return (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('admin.topbar.admin_badge')}</span>
                                        );
                                        return (
                                            <div className="admin-actions">
                                                {(u.status === 'pending' || u.status === 'inactive') && u.role !== 'citizen' && (
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        id={`approve-all-${u.id}`}
                                                        onClick={() => action((id) => adminApi.approve(id), t('admin.toast.approve_success'), u.id)}
                                                    >
                                                        ✅
                                                    </button>
                                                )}
                                                {u.status !== 'suspended' ? (
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        id={`suspend-${u.id}`}
                                                        onClick={() => action((id) => adminApi.suspend(id), t('admin.toast.suspend_success'), u.id)}
                                                    >
                                                        {t('admin.table.btn_suspend')}
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        id={`unsuspend-${u.id}`}
                                                        onClick={() => action((id) => adminApi.unsuspend(id), t('admin.toast.unsuspend_success'), u.id)}
                                                    >
                                                        {t('admin.table.btn_restore')}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    }}
                                />
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </ErrorBoundary>
    );
}

// ---- Simple Error Boundary ----
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() { return { hasError: true }; }
    componentDidCatch(error, errorInfo) { console.error('Admin Dashboard Error:', error, errorInfo); }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>⚠️</div>
                    <h3>Something went wrong</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-6)' }}>The admin interface encountered an error.</p>
                    <button className="btn btn-brand" onClick={() => window.location.reload()}>Reload Page</button>
                </div>
            );
        }
        return this.props.children;
    }
}

// ---- Reusable Users Table ----
function UsersTable({ users, loading, emptyMsg, renderActions, searchQuery, setSearchQuery, showSearch }) {
    const { t } = useTranslation();
    const statusCls = {
        active: 'badge-active', pending: 'badge-pending', inactive: 'badge-inactive',
        unverified: 'badge-unverified', suspended: 'badge-suspended',
    };
    const roleCls = {
        citizen: 'badge-citizen', ngo: 'badge-ngo',
        volunteer: 'badge-volunteer', admin: 'badge-admin',
    };

    if (loading) return (
        <div className="admin-loading">
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            {t('admin.table.loading')}
        </div>
    );

    return (
        <div>
            {showSearch && (
                <div className="filter-bar">
                    <input
                        id="user-search"
                        className="search-input"
                        type="text"
                        placeholder={t('admin.all_users.search_placeholder')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            )}

            {!users.length ? (
                <div className="admin-empty">
                    <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💤</div>
                    {emptyMsg}
                </div>
            ) : (
                <div className="admin-table-wrap">
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '0.8125rem', color: 'var(--text-muted)',
                    }}>
                        <span>{t(users.length !== 1 ? 'admin.table.showing_plural' : 'admin.table.showing', { count: users.length })}</span>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>{t('admin.table.col_name')}</th>
                                <th>{t('admin.table.col_email')}</th>
                                <th>{t('admin.table.col_role')}</th>
                                <th>{t('admin.table.col_status')}</th>
                                <th>{t('admin.table.col_joined')}</th>
                                <th>{t('admin.table.col_actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: '50%',
                                                background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.625rem', fontWeight: 800, color: '#fff', flexShrink: 0,
                                            }}>
                                                {(u.name || u.ngo_name || u.contact_person || '?').slice(0, 2).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                                {u.name || u.ngo_name || u.contact_person || '—'}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{u.email}</td>
                                    <td><span className={`badge ${roleCls[u.role]}`}>{t(`auth.signup.role_cards.${u.role}`)}</span></td>
                                    <td><span className={`badge ${statusCls[u.status]}`}>{u.status}</span></td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                        {(() => {
                                            try {
                                                const locale = t('common.date_locale');
                                                // If translation is missing, i18next returns the key string.
                                                // We must ensure it looks like a valid locale tag or fallback.
                                                const validLocale = (locale && locale.includes('-')) ? locale : 'en-IN';
                                                return new Date(u.created_at).toLocaleDateString(validLocale, {
                                                    day: 'numeric', month: 'short', year: '2-digit'
                                                });
                                            } catch (e) {
                                                return new Date(u.created_at).toLocaleDateString('en-IN');
                                            }
                                        })()}
                                    </td>
                                    <td>{renderActions(u)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
