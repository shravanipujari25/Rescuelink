import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { sosApi } from '../services/api';
import { useTranslation } from 'react-i18next';
import './SOSRequestPage.css';

export default function SOSRequestPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState(null);
    const [address, setAddress] = useState(null);
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        emergency_type: '',
        people_count: 1,
        description: '',
        contact_phone: '',
        imageBase64: null
    });

    const [imagePreview, setImagePreview] = useState(null);

    const EMERGENCY_TYPES = [
        { value: 'medical', label: t('sos.types.medical'), icon: '🚑', desc: t('sos.types.medical_desc'), color: '#ef4444' },
        { value: 'fire', label: t('sos.types.fire'), icon: '🔥', desc: t('sos.types.fire_desc'), color: '#f97316' },
        { value: 'flood', label: t('sos.types.flood'), icon: '🌊', desc: t('sos.types.flood_desc'), color: '#3b82f6' },
        { value: 'earthquake', label: t('sos.types.earthquake'), icon: '🏚️', desc: t('sos.types.earthquake_desc'), color: '#78350f' },
        { value: 'trapped', label: t('sos.types.trapped'), icon: '🆘', desc: t('sos.types.trapped_desc'), color: '#57534e' },
        { value: 'violence', label: t('sos.types.violence'), icon: '🛡️', desc: t('sos.types.violence_desc'), color: '#dc2626' },
        { value: 'other', label: t('sos.types.other'), icon: '⚠️', desc: t('sos.types.other_desc'), color: '#6366f1' }
    ];

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    setLocation({ latitude: lat, longitude: lng });

                    // Reverse Geocoding via Nominatim (OSM)
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
                            headers: { 'Accept-Language': 'en' }
                        });
                        const data = await response.json();
                        if (data && data.display_name) {
                            setAddress(data.display_name);
                            console.log("Resolved Address:", data.display_name);
                        }
                    } catch (err) {
                        console.error("Address resolution failed:", err);
                    }
                },
                (err) => {
                    console.error(err);
                    toast.error(t('sos.messages.location_error'));
                },
                { enableHighAccuracy: true }
            );
        }
    }, [t]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 3 * 1024 * 1024) {
            toast.error(t('sos.messages.image_too_large') || "Image must be under 3MB");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, imageBase64: reader.result }));
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!location) {
            toast.error(t('sos.messages.location_wait'));
            return;
        }
        if (!formData.emergency_type) {
            toast.error(t('sos.messages.select_type'));
            return;
        }

        setLoading(true);
        try {
            await sosApi.create({
                ...formData,
                severity: 'high',
                latitude: location.latitude,
                longitude: location.longitude,
                address: address, // Send the human-readable address
            });

            toast.success(t('sos.messages.success'));
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            toast.error(err.message || t('sos.messages.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sos-page">
            <div className="sos-container animate-slideUp">
                <header className="sos-header">
                    <button className="back-btn" onClick={() => navigate('/dashboard')}>
                        {t('sos.request.back_btn')}
                    </button>
                    <h1>{t('sos.request.title')}</h1>
                    <p>{t('sos.request.subtitle')}</p>
                </header>

                <form onSubmit={handleSubmit} className="sos-form">
                    <div className="form-section">
                        <label className="section-label">{t('sos.request.sections.type')}</label>
                        <div className="type-grid-large">
                            {EMERGENCY_TYPES.map(type => (
                                <div
                                    key={type.value}
                                    className={`type-card ${formData.emergency_type === type.value ? 'selected' : ''}`}
                                    onClick={() => setFormData({ ...formData, emergency_type: type.value })}
                                    style={{ '--borderColor': type.color }}
                                >
                                    <div className="type-icon">{type.icon}</div>
                                    <div className="type-info">
                                        <div className="type-label">{type.label}</div>
                                        <div className="type-desc">{type.desc}</div>
                                    </div>
                                    <div className="radio-circle"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('sos.request.sections.people')}</label>
                            <div className="stepper-input">
                                <button type="button" onClick={() => setFormData(d => ({ ...d, people_count: Math.max(1, d.people_count - 1) }))}>−</button>
                                <input
                                    readOnly
                                    value={formData.people_count}
                                    type="text"
                                    aria-label={t('sos.request.aria_label_people')}
                                />
                                <button type="button" onClick={() => setFormData(d => ({ ...d, people_count: d.people_count + 1 }))}>+</button>
                            </div>
                        </div>

                        <div className="form-group" style={{ flex: 2 }}>
                            <label>{t('sos.request.sections.contact')}</label>
                            <input
                                type="tel"
                                placeholder={t('sos.request.placeholders.contact')}
                                value={formData.contact_phone}
                                onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                                className="text-input"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('sos.request.sections.desc')}</label>
                        <textarea
                            rows="3"
                            placeholder={t('sos.request.placeholders.desc')}
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="text-input"
                        ></textarea>
                    </div>

                    <div className="form-group vision-upload">
                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>🖼️ {t('sos.request.sections.photo') || "Add Emergency Photo (Optional)"}</span>
                            {formData.imageBase64 && (
                                <span className="vision-badge">📸 Gemini Vision Assisted</span>
                            )}
                        </label>
                        <div className="photo-input-wrapper">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="photo-input"
                                id="photo-upload"
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="photo-upload" className="photo-btn">
                                {imagePreview ? (
                                    <div className="photo-preview-container">
                                        <img src={imagePreview} alt="Preview" className="photo-preview" />
                                        <button type="button" className="remove-photo" onClick={(e) => {
                                            e.preventDefault();
                                            setFormData(p => ({ ...p, imageBase64: null }));
                                            setImagePreview(null);
                                        }}>✕</button>
                                    </div>
                                ) : (
                                    <div className="photo-placeholder">
                                        <span>📷</span>
                                        <p>Upload Situation Photo</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="submit-btn btn-xl"
                        disabled={loading || !location || !formData.emergency_type}
                    >
                        {loading ? t('sos.request.submitting_btn') : t('sos.request.submit_btn')}
                    </button>

                    <p className="disclaimer">
                        {t('sos.request.disclaimer')}
                    </p>
                </form>
            </div>
        </div>
    );
}
