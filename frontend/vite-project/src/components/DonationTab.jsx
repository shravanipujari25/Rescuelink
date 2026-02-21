import { useState, useEffect } from 'react';
import { donationApi } from '../services/api';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function DonationTab({ user }) {
    const { t } = useTranslation();
    const [activeSubTab, setActiveSubTab] = useState('active');
    const [campaigns, setCampaigns] = useState([]);
    const [myHistory, setMyHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDonateModal, setShowDonateModal] = useState(null);
    const [donateAmount, setDonateAmount] = useState('');
    const [showSpendsModal, setShowSpendsModal] = useState(null);

    // NGO form states
    const [newCampaign, setNewCampaign] = useState({ title: '', description: '', target_amount: '', category: '' });
    const [spendData, setSpendData] = useState({ campaign_id: '', amount: '', description: '', proof_url: '' });

    useEffect(() => {
        fetchData();
    }, [activeSubTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeSubTab === 'active' || activeSubTab === 'all') {
                const res = await donationApi.getCampaigns();
                setCampaigns(res.data || []);
            }
            if (activeSubTab === 'my') {
                const res = await donationApi.getMyDonations();
                setMyHistory(res.data || []);
            }
            if (activeSubTab === 'all' && user.role === 'admin') {
                const res = await donationApi.getAllData();
                setCampaigns(res.data || []);
            }
        } catch (err) {
            toast.error(err.message || 'Failed to fetch donation data');
        } finally {
            setLoading(false);
        }
    };

    const handleDonate = async (e) => {
        e.preventDefault();
        try {
            await donationApi.pay({
                campaign_id: showDonateModal.id,
                amount: Number(donateAmount)
            });
            toast.success(t('dashboard.donations.form.success'));
            setShowDonateModal(null);
            setDonateAmount('');
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Donation failed');
        }
    };

    const handleCreateCampaign = async (e) => {
        e.preventDefault();
        try {
            await donationApi.createCampaign({
                ...newCampaign,
                target_amount: Number(newCampaign.target_amount)
            });
            toast.success('Campaign launched successfully!');
            setNewCampaign({ title: '', description: '', target_amount: '', category: '' });
            fetchData();
            setActiveSubTab('active');
        } catch (err) {
            toast.error(err.message || 'Failed to launch campaign');
        }
    };

    const handleRecordSpend = async (e) => {
        e.preventDefault();
        try {
            await donationApi.recordSpend({
                ...spendData,
                amount: Number(spendData.amount)
            });
            toast.success('Spend record saved');
            setSpendData({ campaign_id: '', amount: '', description: '', proof_url: '' });
            fetchData();
        } catch (err) {
            toast.error(err.message || 'Failed to record spend');
        }
    };

    const subTabs = [
        { id: 'active', label: t('dashboard.donations.tabs.active') },
    ];

    if (user.role === 'citizen') {
        subTabs.push({ id: 'my', label: t('dashboard.donations.tabs.my') });
    }
    if (user.role === 'ngo') {
        subTabs.push({ id: 'create', label: t('dashboard.donations.tabs.create') });
    }
    if (user.role === 'admin') {
        subTabs.push({ id: 'all', label: t('dashboard.donations.tabs.all') });
    }

    return (
        <div className="animate-fadeIn">
            <div className="page-header">
                <h1>{t('dashboard.donations.title')}</h1>
                <p>{t('dashboard.donations.desc')}</p>
            </div>

            <div className="sub-tab-nav">
                {subTabs.map(st => (
                    <button
                        key={st.id}
                        className={`sub-tab-btn ${activeSubTab === st.id ? 'active' : ''}`}
                        onClick={() => setActiveSubTab(st.id)}
                    >
                        {st.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="admin-loading">Loading...</div>
            ) : (
                <div className="donation-content">
                    {/* ACTIVE CAMPAIGNS */}
                    {(activeSubTab === 'active' || activeSubTab === 'all') && (
                        <div className="campaigns-grid">
                            {campaigns.length === 0 ? (
                                <div className="admin-empty">No active campaigns at the moment.</div>
                            ) : campaigns.map(c => (
                                <div key={c.id} className="campaign-card">
                                    <div className="campaign-badge">{c.category || 'General'}</div>
                                    <h3>{c.title}</h3>
                                    <p className="campaign-ngo">{t('dashboard.donations.campaign.by')} <strong>{c.ngo?.ngo_name || 'RescueLink Partner'}</strong></p>
                                    <p className="campaign-desc">{c.description}</p>

                                    <div className="campaign-stats">
                                        <div className="progress-bar-wrap">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${Math.min(100, (c.current_amount / c.target_amount) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="campaign-amounts">
                                            <span><strong>₹{c.current_amount.toLocaleString()}</strong> {t('dashboard.donations.campaign.raised')}</span>
                                            <span>{t('dashboard.donations.campaign.target')}: ₹{c.target_amount.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="campaign-actions">
                                        {user.role === 'citizen' && (
                                            <button className="btn btn-primary btn-sm" onClick={() => setShowDonateModal(c)}>
                                                {t('dashboard.donations.campaign.donate_btn')}
                                            </button>
                                        )}
                                        <button className="btn btn-ghost btn-sm" onClick={() => setShowSpendsModal(c)}>
                                            {t('dashboard.donations.campaign.view_spends')}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* MY CONTRIBUTIONS (Citizen) */}
                    {activeSubTab === 'my' && (
                        <div className="history-wrap">
                            <div className="stats-grid">
                                <div className="admin-stat">
                                    <div className="admin-stat-num">₹{myHistory.reduce((sum, d) => sum + Number(d.amount), 0).toLocaleString()}</div>
                                    <div className="admin-stat-label">{t('dashboard.donations.history.total')}</div>
                                </div>
                            </div>

                            <div className="admin-table-wrap">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>{t('dashboard.donations.history.date')}</th>
                                            <th>Campaign</th>
                                            <th>{t('dashboard.donations.history.amount')}</th>
                                            <th>{t('dashboard.donations.history.status')}</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {myHistory.length === 0 ? (
                                            <tr><td colSpan="5" className="admin-empty">{t('dashboard.donations.history.none')}</td></tr>
                                        ) : myHistory.map(d => (
                                            <tr key={d.id}>
                                                <td style={{ whiteSpace: 'nowrap' }}>{new Date(d.created_at).toLocaleDateString()}</td>
                                                <td>{d.campaign?.title}</td>
                                                <td style={{ fontWeight: 700 }}>₹{d.amount}</td>
                                                <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                                                <td>
                                                    <button className="btn btn-ghost btn-xs" onClick={() => setShowSpendsModal({ ...d.campaign, campaign_spends: d.campaign_spends })}>
                                                        {t('dashboard.donations.campaign.view_spends')}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* CREATE CAMPAIGN (NGO) */}
                    {activeSubTab === 'create' && (
                        <div className="max-w-md">
                            <form className="auth-form" style={{ maxWidth: 600, margin: '0 0' }} onSubmit={handleCreateCampaign}>
                                <div className="form-group">
                                    <label>{t('dashboard.donations.form.campaign_title')}</label>
                                    <input
                                        className="form-input"
                                        required
                                        value={newCampaign.title}
                                        onChange={e => setNewCampaign(p => ({ ...p, title: e.target.value }))}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{t('dashboard.donations.form.campaign_desc')}</label>
                                    <textarea
                                        className="form-input"
                                        style={{ minHeight: 100 }}
                                        required
                                        value={newCampaign.description}
                                        onChange={e => setNewCampaign(p => ({ ...p, description: e.target.value }))}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>{t('dashboard.donations.form.campaign_target')} (₹)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            required
                                            value={newCampaign.target_amount}
                                            onChange={e => setNewCampaign(p => ({ ...p, target_amount: e.target.value }))}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>{t('dashboard.donations.form.campaign_category')}</label>
                                        <select
                                            className="form-input"
                                            value={newCampaign.category}
                                            onChange={e => setNewCampaign(p => ({ ...p, category: e.target.value }))}
                                        >
                                            <option value="">General</option>
                                            <option value="Medical">Medical</option>
                                            <option value="Food">Food & Water</option>
                                            <option value="Rescue">Rescue Ops</option>
                                            <option value="Shelter">Shelter</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary">{t('dashboard.donations.form.submit_campaign')}</button>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {/* DONATE MODAL */}
            {showDonateModal && (
                <div className="modal-overlay" onClick={() => setShowDonateModal(null)}>
                    <div className="modal-content animate-slideUp" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{t('dashboard.donations.form.title', { title: showDonateModal.title })}</h2>
                            <button className="modal-close" onClick={() => setShowDonateModal(null)}>×</button>
                        </div>
                        <form onSubmit={handleDonate}>
                            <div className="form-group">
                                <label>{t('dashboard.donations.form.amount_label')}</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontWeight: 700 }}>₹</span>
                                    <input
                                        type="number"
                                        autoFocus
                                        className="form-input"
                                        style={{ paddingLeft: 30 }}
                                        placeholder="500"
                                        required
                                        value={donateAmount}
                                        onChange={e => setDonateAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowDonateModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{t('dashboard.donations.form.confirm_btn')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* SPENDS MODAL */}
            {showSpendsModal && (
                <div className="modal-overlay" onClick={() => setShowSpendsModal(null)}>
                    <div className="modal-content modal-lg animate-slideUp" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Transparency: {showSpendsModal.title}</h2>
                            <button className="modal-close" onClick={() => setShowSpendsModal(null)}>×</button>
                        </div>

                        <div className="spends-modal-body">
                            <div className="spend-stats">
                                <div className="spend-stat">
                                    <label>Total Raised</label>
                                    <div className="val">₹{showSpendsModal.current_amount?.toLocaleString()}</div>
                                </div>
                                <div className="spend-stat">
                                    <label>Organized By</label>
                                    <div className="val">{showSpendsModal.ngo?.ngo_name || 'Verified NGO'}</div>
                                </div>
                            </div>

                            <div className="section-title" style={{ marginTop: 'var(--space-6)' }}>Spend Records</div>

                            <div className="spends-list">
                                {!showSpendsModal.campaign_spends || showSpendsModal.campaign_spends.length === 0 ? (
                                    <div className="admin-empty" style={{ padding: 'var(--space-8)' }}>
                                        {t('dashboard.donations.campaign.no_spends')}
                                    </div>
                                ) : showSpendsModal.campaign_spends.map(s => (
                                    <div key={s.id} className="spend-item">
                                        <div className="spend-item-header">
                                            <span className="spend-amount">₹{s.amount.toLocaleString()}</span>
                                            <span className="spend-date">{new Date(s.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="spend-desc">{s.description}</p>
                                        {s.proof_url && (
                                            <a href={s.proof_url} target="_blank" rel="noreferrer" className="spend-proof-link">
                                                📄 {t('dashboard.donations.campaign.proof')}
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {user.role === 'ngo' && user.id === showSpendsModal.ngo_id && (
                                <div className="record-spend-section">
                                    <h3>{t('dashboard.donations.form.spend_title')}</h3>
                                    <form onSubmit={handleRecordSpend}>
                                        <div className="form-row">
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <input
                                                    type="number"
                                                    placeholder={t('dashboard.donations.form.spend_amount')}
                                                    className="form-input"
                                                    required
                                                    value={spendData.amount}
                                                    onChange={e => setSpendData(p => ({ ...p, amount: e.target.value, campaign_id: showSpendsModal.id }))}
                                                />
                                            </div>
                                            <div className="form-group" style={{ flex: 2 }}>
                                                <input
                                                    type="text"
                                                    placeholder={t('dashboard.donations.form.spend_proof')}
                                                    className="form-input"
                                                    value={spendData.proof_url}
                                                    onChange={e => setSpendData(p => ({ ...p, proof_url: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                        <input
                                            className="form-input"
                                            placeholder={t('dashboard.donations.form.campaign_desc')}
                                            style={{ marginTop: 'var(--space-2)' }}
                                            required
                                            value={spendData.description}
                                            onChange={e => setSpendData(p => ({ ...p, description: e.target.value }))}
                                        />
                                        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-3)' }}>
                                            {t('dashboard.donations.form.submit_spend')}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
