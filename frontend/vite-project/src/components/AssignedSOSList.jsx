import { useState, useEffect } from 'react';
import { sosApi } from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function AssignedSOSList() {
    const { t } = useTranslation();
    const [sosList, setSosList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [trackingIds, setTrackingIds] = useState(new Set()); // IDs of SOS being tracked
    const [watchIds, setWatchIds] = useState({}); // Map of sosId -> watchPosition ID

    const fetchAssignedSOS = async () => {
        try {
            let params = {};
            if (navigator.geolocation) {
                // We try a fast-timeout check for location to filter nearby
                const pos = await new Promise((resolve) => {
                    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
                        enableHighAccuracy: false,
                        timeout: 5000
                    });
                });
                if (pos) {
                    params = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                }
            }
            const res = await sosApi.getAssigned(params);
            setSosList(res.data || []);
        } catch (err) {
            console.error(err);
            toast.error(t('dashboard.assigned.toast.load_fail'));
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        if (!confirm(t('dashboard.assigned.toast.resolve_confirm'))) return;

        try {
            await sosApi.resolve(id);
            toast.success(t('dashboard.assigned.toast.resolved'));
            stopTracking(id); // Stop tracking if resolved
            fetchAssignedSOS(); // Refresh list
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
                    console.log(`Updated location for SOS ${sosId}: ${latitude}, ${longitude}`);
                } catch (err) {
                    console.error('Failed to update location', err);
                    toast.error(t('dashboard.assigned.toast.share_err'));
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                toast.error(t('dashboard.assigned.toast.geo_err', { message: err.message }));
                // Remove from tracking set if we failed immediately
                setTrackingIds(prev => {
                    const next = new Set(prev);
                    next.delete(sosId);
                    return next;
                });
            },
            {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 10000
            }
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
        fetchAssignedSOS();
        const interval = setInterval(fetchAssignedSOS, 15000);
        return () => {
            clearInterval(interval);
            // Cleanup watches
            Object.values(watchIds).forEach(id => navigator.geolocation.clearWatch(id));
        };
    }, []);

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>{t('dashboard.assigned.loading')}</div>;

    if (sosList.length === 0) {
        return (
            <div className="dash-notice info">
                <span className="dash-notice-icon">✅</span>
                <div>
                    <strong>{t('dashboard.assigned.none')}</strong>
                    <p>{t('dashboard.assigned.none_desc')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="sos-list" style={{ display: 'grid', gap: '1rem' }}>
            {sosList.map(sos => {
                const isTracking = trackingIds.has(sos.id);
                return (
                    <div key={sos.id} className="sos-card" style={{
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.5rem',
                        marginBottom: '1rem',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {isTracking && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                                background: 'linear-gradient(90deg, transparent, #22c55e, transparent)',
                                animation: 'loading 1.5s infinite'
                            }} />
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <span className={`badge ${sos.severity === 'critical' || sos.severity === 'high' ? 'badge-suspended' : 'badge-active'}`}
                                    style={{ textTransform: 'uppercase', marginBottom: '0.5rem', display: 'inline-block' }}>
                                    {t('dashboard.assigned.severity', { severity: sos.severity })}
                                </span>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{t(`sos.types.${sos.emergency_type}`)}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                                    {t('dashboard.sos_card.reported', { time: new Date(sos.created_at).toLocaleString() })}
                                </p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                {isTracking ? (
                                    <button
                                        className="btn btn-sm"
                                        style={{ background: '#22c55e', color: 'white', border: 'none' }}
                                        onClick={() => stopTracking(sos.id)}
                                    >
                                        {t('dashboard.assigned.sharing')}
                                    </button>
                                ) : (
                                    <button
                                        className="btn btn-primary btn-sm"
                                        style={{ background: 'var(--brand-primary)' }}
                                        onClick={() => startTracking(sos.id)}
                                    >
                                        {t('dashboard.assigned.start')}
                                    </button>
                                )}

                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => handleResolve(sos.id)}
                                    style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
                                >
                                    {t('dashboard.assigned.resolve')}
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
                            <div>
                                <strong style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('dashboard.assigned.location_label')}</strong>
                                {sos.address || `${sos.latitude}, ${sos.longitude}`}
                                <br />
                                <a
                                    href={`https://www.google.com/maps?q=${sos.latitude},${sos.longitude}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'var(--brand-primary)', textDecoration: 'underline', fontSize: '0.8rem' }}
                                >
                                    {t('dashboard.assigned.view_map')}
                                </a>
                            </div>
                            <div>
                                <strong style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('dashboard.assigned.contact_label')}</strong>
                                {sos.user?.name || 'Unknown User'}
                                <br />
                                {sos.user?.phone || sos.contact_phone || 'No phone provided'}
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <strong style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>{t('dashboard.assigned.people_label')}</strong>
                                {sos.people_count || 1}
                            </div>
                        </div>

                        {sos.description && (
                            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                                <strong style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>{t('dashboard.assigned.desc_label')}</strong>
                                {sos.description}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
