import { useState, useEffect } from 'react';
import { publicApi } from '../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import './Dashboard.css';

export default function NGOSearchPage() {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [searchMode, setSearchMode] = useState('all'); // 'all' or 'location'
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeLocation, setActiveLocation] = useState('');

    useEffect(() => {
        handleSearch();
    }, [searchMode]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const q = searchMode === 'all' ? '' : query;
            const res = await publicApi.searchNGOs(q);
            setNgos(res.data || []);
            setActiveLocation(q);
        } catch (err) {
            toast.error(err.message || 'Error looking for NGOs');
        } finally {
            setLoading(false);
        }
    };

    const clearLocation = () => {
        setQuery('');
        setSearchMode('all');
    };

    return (
        <div className="dash-page">
            <style>{`
                .ngo-search-container {
                    display: flex;
                    gap: 2.5rem;
                    margin-top: 1.5rem;
                    align-items: flex-start;
                }

                .ngo-sidebar {
                    width: 280px;
                    flex-shrink: 0;
                    position: sticky;
                    top: 80px;
                    background: var(--glass-bg, rgba(255, 255, 255, 0.03));
                    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
                    border-radius: 20px;
                    padding: 1.5rem;
                    backdrop-filter: blur(16px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                }

                .ngo-results-area {
                    flex: 1;
                }

                .ngo-results-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .ngo-count {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .ngo-chips {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 2rem;
                    flex-wrap: wrap;
                }

                .ngo-chip {
                    padding: 8px 16px;
                    background: rgba(230, 57, 70, 0.1);
                    border: 1px solid rgba(230, 57, 70, 0.2);
                    border-radius: 100px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #ff4d4d;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    animation: fadeIn 0.3s ease;
                }

                .ngo-chip-close {
                    cursor: pointer;
                    font-size: 1.2rem;
                    line-height: 1;
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }

                .ngo-chip-close:hover {
                    opacity: 1;
                }

                .ngo-filter-group {
                    margin-bottom: 2rem;
                }

                .ngo-filter-title {
                    font-size: 0.7rem;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: var(--text-muted, #888);
                    margin-bottom: 1rem;
                }

                .ngo-filter-item {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    margin: 0 -0.5rem;
                    color: var(--text-secondary, #ccc);
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: 12px;
                    transition: all 0.2s ease;
                }

                .ngo-filter-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--text-primary, #fff);
                }

                .ngo-filter-item.active {
                    background: rgba(230, 57, 70, 0.1);
                    color: #ff4d4d;
                    font-weight: 700;
                }

                .ngo-card-premium {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }

                .ngo-card-premium:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                    border-color: rgba(230, 57, 70, 0.3);
                    background: rgba(255, 255, 255, 0.04);
                }

                .ngo-card-image-box {
                    height: 180px;
                    background: linear-gradient(135deg, rgba(230, 57, 70, 0.1) 0%, rgba(193, 18, 31, 0.05) 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 4rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .ngo-card-content {
                    padding: 1.5rem;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .ngo-card-name {
                    font-size: 1.25rem;
                    font-weight: 800;
                    color: var(--text-primary, #fff);
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.01em;
                }

                .ngo-card-location {
                    font-size: 0.85rem;
                    color: var(--text-muted, #888);
                    margin-bottom: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .ngo-card-services {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 1.5rem;
                }

                .ngo-service-tag {
                    padding: 4px 10px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: var(--text-secondary, #ccc);
                }

                .ngo-card-footer {
                    margin-top: auto;
                    padding-top: 1rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .ngo-contact-btn {
                    width: 100%;
                    height: 42px;
                    border-radius: 12px;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: var(--text-primary, #fff);
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .ngo-contact-btn:hover {
                    background: #ff4d4d;
                    color: white;
                    border-color: #ff4d4d;
                    box-shadow: 0 4px 12px rgba(230, 57, 70, 0.3);
                }

                @media (max-width: 1024px) {
                    .ngo-search-container {
                        flex-direction: column;
                    }
                    .ngo-sidebar {
                        width: 100%;
                        position: static;
                        margin-bottom: 2rem;
                    }
                }
            `}</style>

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
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{t('ngo_search.title')}</h1>
                    <p style={{ fontSize: '1.1rem' }}>{t('ngo_search.subtitle')}</p>
                </div>

                <div className="ngo-search-container">
                    {/* Sidebar Filters */}
                    <div className="ngo-sidebar animate-slideInLeft">
                        <div className="ngo-filter-group">
                            <div className="ngo-filter-title">Discovery</div>
                            <div
                                className={`ngo-filter-item ${searchMode === 'all' ? 'active' : ''}`}
                                onClick={() => setSearchMode('all')}
                            >
                                <span style={{ fontSize: '1.2rem' }}>🏢</span> {t('ngo_search.filters.all')}
                            </div>
                            <div
                                className={`ngo-filter-item ${searchMode === 'location' ? 'active' : ''}`}
                                onClick={() => setSearchMode('location')}
                            >
                                <span style={{ fontSize: '1.2rem' }}>📍</span> {t('ngo_search.filters.location')}
                            </div>
                        </div>

                        {searchMode === 'location' && (
                            <div className="ngo-filter-group animate-slideDown">
                                <form onSubmit={handleSearch}>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            type="text"
                                            className="search-input"
                                            placeholder={t('ngo_search.placeholder')}
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            style={{ width: '100%', marginBottom: '1rem', paddingRight: '40px', background: 'rgba(255,255,255,0.03)' }}
                                            autoFocus
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ height: '42px', borderRadius: '12px' }}>
                                        {loading ? t('ngo_search.looking') : t('ngo_search.find_btn')}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Results Area */}
                    <div className="ngo-results-area">
                        <div className="ngo-results-header">
                            <div className="ngo-count">
                                {loading ? '...' : ngos.length} {t('ngo_search.found_count', 'NGOs found')}
                            </div>
                        </div>

                        {activeLocation && (
                            <div className="ngo-chips">
                                <div className="ngo-chip animate-fadeIn">
                                    📍 Area: {activeLocation}
                                    <span className="ngo-chip-close" onClick={clearLocation}>×</span>
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="admin-loading" style={{ paddingTop: '8rem' }}>
                                <div className="spinner" style={{ margin: '0 auto 24px', width: '40px', height: '40px' }} />
                                <div style={{ fontSize: '1.1rem' }}>{t('ngo_search.looking')}</div>
                            </div>
                        ) : (
                            <>
                                {ngos.length === 0 ? (
                                    <div className="admin-empty animate-fadeIn" style={{ paddingTop: '8rem' }}>
                                        <div style={{ fontSize: '5rem', marginBottom: '2rem' }}>🏢</div>
                                        <h3 style={{ fontSize: '1.75rem' }}>{t('ngo_search.empty_title')}</h3>
                                        <p style={{ fontSize: '1.1rem' }}>{t('ngo_search.empty_desc')}</p>
                                    </div>
                                ) : (
                                    <div className="action-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2.5rem' }}>
                                        {ngos.map(ngo => (
                                            <div key={ngo.id} className="ngo-card-premium animate-fadeInUp">
                                                <div className="ngo-card-image-box">
                                                    🏢
                                                </div>
                                                <div className="ngo-card-content">
                                                    <div className="ngo-card-name">{ngo.ngo_name}</div>
                                                    <div className="ngo-card-location">
                                                        <span>📍</span> {ngo.location}
                                                    </div>
                                                    <div className="ngo-card-services">
                                                        {(ngo.services || []).map((s, i) => (
                                                            <span key={i} className="ngo-service-tag">{s}</span>
                                                        ))}
                                                        {(!ngo.services || ngo.services.length === 0) && (
                                                            <span className="ngo-service-tag">{t('ngo_search.card.general')}</span>
                                                        )}
                                                    </div>
                                                    <div className="ngo-card-footer">
                                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
                                                            <strong style={{ color: 'rgba(255,255,255,0.8)' }}>👤 {t('ngo_search.card.contact')}:</strong> {ngo.contact_person}
                                                        </div>
                                                        <button className="ngo-contact-btn">
                                                            Contact Organization
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
