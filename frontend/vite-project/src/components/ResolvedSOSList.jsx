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

    if (loading) return <div className="admin-loading">{t('dashboard.assigned.loading')}</div>;

    if (resolvedList.length === 0) {
        return (
            <div className="no-data-card" style={{ padding: '3rem', textAlign: 'center', opacity: 0.7 }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📜</span>
                <p>{t('dashboard.resolved.none')}</p>
            </div>
        );
    }

    const priorityColors = {
        critical: '#dc2626',
        high: '#ef4444',
        medium: '#f97316',
        low: '#eab308'
    };

    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            {resolvedList.map(sos => {
                const color = priorityColors[sos.priority] || '#3b82f6';
                return (
                    <div key={sos.id} className="sos-horizontal-card" style={{ opacity: 0.9 }}>
                        <div className="sos-card-accent" style={{ backgroundColor: color }} />

                        <div className="sos-card-top">
                            <div>
                                <div className="sos-badges-wrap">
                                    <span className="badge badge-active" style={{ background: '#10b981', color: 'white', border: 'none' }}>
                                        {t('dashboard.resolved.status') || 'RESOLVED'}
                                    </span>
                                    {sos.priority && (
                                        <span className="badge" style={{ background: `${color}15`, color: color, border: `1px solid ${color}33` }}>
                                            {sos.priority?.toUpperCase()}
                                        </span>
                                    )}
                                    <span className="sos-card-time">
                                        {new Date(sos.resolved_at || sos.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <h4 className="sos-title">{t(`sos.types.${sos.emergency_type}`)}</h4>
                            </div>
                            <div className="sos-card-responder">
                                <strong>{t('dashboard.resolved.by') || 'Resolved by'}:</strong><br />
                                {sos.assigned_user?.name || 'Volunteer Unit'}
                            </div>
                        </div>

                        <div className="sos-info-row">
                            <div><strong>📍 {t('dashboard.sos_card.location_label') || 'Location'}:</strong> {sos.address || t('dashboard.sos_card.unknown_loc')}</div>
                            <div><strong>👤 {t('dashboard.sos_card.reporter') || 'Contact'}:</strong> {sos.user?.name || 'Citizen'}</div>
                        </div>

                        {sos.description && (
                            <p className="sos-quote">"{sos.description}"</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
