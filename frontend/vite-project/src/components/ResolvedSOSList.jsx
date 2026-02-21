import { useState, useEffect } from 'react';
import { sosApi } from '../services/api';
import { useTranslation } from 'react-i18next';

export default function ResolvedSOSList() {
    const { t } = useTranslation();
    const [resolvedList, setResolvedList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchResolved = async () => {
        try {
            const res = await sosApi.getResolved();
            setResolvedList(res.data || []);
        } catch (err) {
            console.error('Failed to fetch resolved SOS', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResolved();
    }, []);

    if (loading) return <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('common.loading') || 'Loading history...'}</div>;

    if (resolvedList.length === 0) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📜</span>
                {t('dashboard.resolved.none') || 'No resolved issues found yet.'}
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: '1rem' }}>
            {resolvedList.map(sos => {
                // Priority colors to match the map
                const priorityColors = {
                    critical: '#dc2626', // Red
                    high: '#ef4444',     // Light Red
                    medium: '#f97316',   // Orange
                    low: '#eab308'       // Yellow
                };
                const priorityColor = priorityColors[sos.priority] || '#3b82f6'; // Blue fallback

                return (
                    <div key={sos.id} style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        opacity: 0.85,
                        position: 'relative',
                        paddingLeft: '2rem', // Space for side bar
                        overflow: 'hidden'
                    }}>
                        {/* Priority Side Bar */}
                        <div style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            backgroundColor: priorityColor,
                            opacity: 0.6
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span className="badge badge-active" style={{ background: 'var(--success)', color: 'white' }}>
                                        {t('dashboard.resolved.status') || 'RESOLVED'}
                                    </span>
                                    {sos.priority && (
                                        <span style={{
                                            fontSize: '0.65rem',
                                            fontWeight: 800,
                                            color: priorityColor,
                                            textTransform: 'uppercase',
                                            background: `${priorityColor}15`,
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            border: `1px solid ${priorityColor}33`
                                        }}>
                                            {sos.priority}
                                        </span>
                                    )}
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {new Date(sos.resolved_at).toLocaleString()}
                                    </span>
                                </div>
                                <h4 style={{ margin: '0.5rem 0 0', fontSize: '1.1rem' }}>{t(`sos.types.${sos.emergency_type}`)}</h4>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                <strong>{t('dashboard.resolved.by') || 'Resolved by'}:</strong><br />
                                {sos.assigned_user?.name || 'Unit'}
                            </div>
                        </div>

                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                            <div><strong>📍 {t('dashboard.assigned.location_label')}:</strong> {sos.address || 'Reported Location'}</div>
                            <div><strong>👤 {t('dashboard.assigned.contact_label')}:</strong> {sos.user?.name}</div>
                        </div>

                        {sos.description && (
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '3px solid var(--border-subtle)', paddingLeft: '10px' }}>
                                "{sos.description}"
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
