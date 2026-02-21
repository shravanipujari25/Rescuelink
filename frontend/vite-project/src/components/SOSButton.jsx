import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function SOSButton() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();

    // In a real app, we might check if an SOS is already active context
    // For now, the button is just a trigger to the form page

    const handleClick = () => {
        navigate('/sos/request');
    };

    return (
        <button
            onClick={handleClick}
            className="sos-button"
            aria-label={t('sos.button.label')}
        >
            <div className="sos-waves">
                <div className="wave"></div>
                <div className="wave"></div>
            </div>
            <div className="sos-content">
                <span className="sos-icon">🆘</span>
                <span className="sos-text">{t('sos.button.text')}</span>
            </div>
        </button>
    );
}
