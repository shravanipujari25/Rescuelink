import { useState, useEffect } from 'react';
import { sosApi } from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AssignedSOSList({ sosList = [], loading = false, refresh }) {
    const { t } = useTranslation();

    // Internal state only for tracking and watch IDs
    const [trackingIds, setTrackingIds] = useState(new Set());
    const [watchIds, setWatchIds] = useState({});

    const handleResolve = async (id) => {
        if (!confirm(t('dashboard.assigned.toast.resolve_confirm'))) return;

        try {
            await sosApi.resolve(id);
            toast.success(t('dashboard.assigned.toast.resolved'));
            stopTracking(id);
            if (refresh) refresh();
        } catch (err) {
            console.error(err);
            toast.error(err.message || t('dashboard.assigned.toast.resolve_fail'));
        }
    };

    const startTracking = (sosId) => {
        if (!navigator.geolocation) {
            toast.error(t('dashboard.assigned.toast.geo_fail'));
            return;
        }

        toast.success(t('dashboard.assigned.toast.sharing_msg'));
        setTrackingIds(prev => new Set(prev).add(sosId));

        const id = navigator.geolocation.watchPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                try {
                    await sosApi.updateResponderLocation(sosId, { latitude, longitude });
                } catch (err) {
                    console.error('Failed to update location', err);
                    toast.error(t('dashboard.assigned.toast.share_err'));
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                toast.error(t('dashboard.assigned.toast.geo_err', { message: err.message }));
                setTrackingIds(prev => {
                    const next = new Set(prev);
                    next.delete(sosId);
                    return next;
                });
            },
            { enableHighAccuracy: false, timeout: 30000, maximumAge: 10000 }
        );

        setWatchIds(prev => ({ ...prev, [sosId]: id }));
    };

    const stopTracking = (sosId) => {
        if (watchIds[sosId]) {
            navigator.geolocation.clearWatch(watchIds[sosId]);
            const newWatchIds = { ...watchIds };
            delete newWatchIds[sosId];
            setWatchIds(newWatchIds);
        }
        setTrackingIds(prev => {
            const next = new Set(prev);
            next.delete(sosId);
            return next;
        });
        toast.success(t('dashboard.assigned.toast.stop_sharing'));
    };

    useEffect(() => {
        return () => {
            Object.values(watchIds).forEach(id => navigator.geolocation.clearWatch(id));
        };
    }, [watchIds]);

    if (loading && !sosList.length) {
        return <div className="loading-spinner">{t('dashboard.assigned.loading')}</div>;
    }

    if (!loading && !sosList.length) {
        return (
            <div className="no-data-card">
                <span className="no-data-icon">📜</span>
                <p>{t('dashboard.assigned.none')}</p>
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
            {sosList.map(sos => {
                const color = priorityColors[sos.priority] || '#3b82f6';
                return (
                    <div key={sos.id} className="sos-horizontal-card">
                        <div className="sos-card-accent" style={{ backgroundColor: color }} />

                        <div className="sos-card-top">
                            <div>
                                <div className="sos-badges-wrap">
                                    <span className="badge badge-active" style={{ background: color, color: 'white', border: 'none' }}>
                                        {sos.status?.toUpperCase()}
                                    </span>
                                    {sos.priority && (
                                        <span className="badge" style={{ background: `${color}15`, color: color, border: `1px solid ${color}33` }}>
                                            {sos.priority?.toUpperCase()}
                                        </span>
                                    )}
                                    <span className="sos-card-time">
                                        {new Date(sos.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <h4 className="sos-title">{t(`sos.types.${sos.emergency_type}`)}</h4>
                            </div>
                            <div className="sos-card-responder">
                                {sos.distance_km !== undefined && (
                                    <div style={{ marginBottom: '4px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        📏 {sos.distance_km.toFixed(2)} km {t('dashboard.sos_card.away')}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="sos-info-row">
                            <div><strong>📍 {t('dashboard.sos_card.unknown_loc')}:</strong> {sos.address || 'Reported Location'}</div>
                            <div><strong>👤 {t('dashboard.sos_card.reporter')}:</strong> {sos.user?.name || 'User'}</div>
                            {sos.contact_phone && (
                                <div><strong>📞 {t('dashboard.sos_card.contact')}:</strong> {sos.contact_phone}</div>
                            )}
                        </div>

                        {sos.description && (
                            <p className="sos-quote">"{sos.description}"</p>
                        )}

                        <div className="sos-card-actions">
                            {trackingIds.has(sos.id) ? (
                                <button className="btn btn-warning btn-sm" onClick={() => stopTracking(sos.id)}>
                                    {t('dashboard.assigned.btn.stop_tracking')}
                                </button>
                            ) : (
                                <button className="btn btn-primary btn-sm" onClick={() => startTracking(sos.id)}>
                                    {t('dashboard.assigned.btn.start_tracking')}
                                </button>
                            )}
                            <button className="btn btn-success btn-sm" onClick={() => handleResolve(sos.id)}>
                                {t('dashboard.assigned.btn.resolve')}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
