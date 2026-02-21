import { useState, useEffect } from 'react';
import { publicApi } from '../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import './Dashboard.css'; // Reusing dashboard/admin styles for consistency

export default function NGOSearchPage() {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [serviceFilter, setServiceFilter] = useState('');
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(false);

    const SERVICES = [
        { id: '', label: t('ngo_search.filters.all_services') },
        { id: 'food', label: t('ngo_search.filters.food') },
        { id: 'medical', label: t('ngo_search.filters.medical') },
        { id: 'shelter', label: t('ngo_search.filters.shelter') },
        { id: 'rescue', label: t('ngo_search.filters.rescue') },
        { id: 'logistics', label: t('ngo_search.filters.logistics') }
    ];

    useEffect(() => {
        handleSearch();
    }, [serviceFilter]); // Auto-search when category changes

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const res = await publicApi.searchNGOs(query, serviceFilter);
            setNgos(res.data || []);
        } catch (err) {
            toast.error(err.message || 'Failed to search NGOs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dash-page">
            <header className="app-topbar">
                <div className="app-brand">
                    <div className="app-brand-logo">🛡</div>
                    <span className="app-brand-name">RescueLink</span>
                    <div className="app-brand-dot" />
                </div>
                <div className="app-topbar-right">
                    <button onClick={() => window.history.back()} className="btn btn-ghost btn-sm">
                        ← Back
                    </button>
                </div>
            </header>

            <main className="dash-main animate-fadeIn">
                <div className="page-header">
                    <h1>{t('ngo_search.title')}</h1>
                    <p>{t('ngo_search.subtitle')}</p>
                </div>

                <div className="filter-bar animate-slideDown" style={{ marginBottom: '2rem' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '800px', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            className="search-input"
                            placeholder={t('ngo_search.placeholder')}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ flex: 2, minWidth: '250px' }}
                        />
                        <select
                            className="search-input"
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value)}
                            style={{ flex: 1, minWidth: '150px', cursor: 'pointer' }}
                        >
                            {SERVICES.map(s => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                        </select>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? t('ngo_search.searching') : t('ngo_search.search_btn')}
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="admin-loading">
                        <div className="spinner" style={{ margin: '0 auto 12px' }} />
                        {t('ngo_search.searching')}
                    </div>
                ) : (
                    <div className="section">
                        {ngos.length === 0 ? (
                            <div className="admin-empty">
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
                                <h3>{t('ngo_search.empty_title')}</h3>
                                <p>{t('ngo_search.empty_desc')}</p>
                            </div>
                        ) : (
                            <div className="action-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                                {ngos.map(ngo => (
                                    <div key={ngo.id} className="action-card" style={{ cursor: 'default' }}>
                                        <div className="action-card-icon" style={{ background: 'rgba(168,85,247,0.15)' }}>
                                            🏢
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div className="action-card-label" style={{ fontSize: '1.1rem' }}>{ngo.ngo_name}</div>
                                            <div className="action-card-desc" style={{ marginTop: '0.5rem' }}>
                                                <strong>📍 {t('ngo_search.card.location')}:</strong> {ngo.location}
                                            </div>
                                            <div className="action-card-desc" style={{ marginTop: '0.25rem' }}>
                                                <strong>🛠 {t('ngo_search.card.services')}:</strong> {ngo.services?.join(', ') || t('ngo_search.card.general_support')}
                                            </div>
                                            <div className="action-card-desc" style={{ marginTop: '0.25rem' }}>
                                                <strong>👤 {t('ngo_search.card.contact')}:</strong> {ngo.contact_person}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
