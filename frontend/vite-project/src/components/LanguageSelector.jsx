import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (e) => {
        i18n.changeLanguage(e.target.value);
    };

    return (
        <div className="language-selector" style={{ minWidth: '120px' }}>
            <select
                value={i18n.language}
                onChange={changeLanguage}
                className="form-select"
                style={{ padding: '0.4rem 2rem 0.4rem 0.8rem', fontSize: '0.875rem', height: 'auto' }}
            >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
            </select>
        </div>
    );
};

export default LanguageSelector;
