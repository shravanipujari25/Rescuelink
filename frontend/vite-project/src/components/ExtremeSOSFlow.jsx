import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './ExtremeSOSFlow.css';

/**
 * ExtremeSOSFlow Component
 * A cinematic, frontend-only simulation of the "Extreme Distress SOS" workflow.
 * States: idle -> countdown -> analyzing -> decision -> alerting -> completed
 */
const ExtremeSOSFlow = ({ onComplete, onCancel }) => {
    const { t } = useTranslation();
    const [state, setState] = useState('idle'); // idle, countdown, analyzing, decision, alerting, completed
    const [countdown, setCountdown] = useState(3);
    const [analysisStep, setAnalysisStep] = useState(0);
    const lastTap = useRef(0);

    // AI Analysis Simulation Steps
    const analysisTexts = [
        "GPS Locating...",
        "Acquiring Satellite Uplink...",
        "Checking Disaster Zone...",
        "AI Vision: Scanning Situation...",
        "Hazard Detected: EXTREME DISTRESS"
    ];

    // Handle Double Tap logic
    const handleSOSClick = () => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            startFlow();
        } else {
            lastTap.current = now;
        }
    };

    const startFlow = () => {
        setState('countdown');
    };

    // Countdown Logic
    useEffect(() => {
        if (state === 'countdown') {
            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else {
                setState('analyzing');
            }
        }
    }, [state, countdown]);

    // Analysis Logic
    useEffect(() => {
        if (state === 'analyzing') {
            if (analysisStep < analysisTexts.length) {
                const timer = setTimeout(() => setAnalysisStep(analysisStep + 1), 1200);
                return () => clearTimeout(timer);
            } else {
                setState('decision');
            }
        }
    }, [state, analysisStep]);

    // Decision -> Alerting Logic
    useEffect(() => {
        if (state === 'decision') {
            const timer = setTimeout(() => setState('alerting'), 2500);
            return () => clearTimeout(timer);
        }
    }, [state]);

    // Alerting -> Completed Logic
    useEffect(() => {
        if (state === 'alerting') {
            const timer = setTimeout(() => setState('completed'), 4000);
            return () => clearTimeout(timer);
        }
    }, [state]);

    // Animation Variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    const cardVariants = {
        hidden: { x: 50, opacity: 0 },
        visible: (i) => ({
            x: 0,
            opacity: 1,
            transition: { delay: i * 0.8, duration: 0.5, type: 'spring' }
        })
    };

    return (
        <div className="extreme-sos-container">
            <AnimatePresence>
                {/* IDLE STATE: Large SOS Button */}
                {state === 'idle' && (
                    <motion.div
                        className="sos-idle-screen"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                    >
                        <div className="sos-demo-hint">DOUBLE TAP TO BROADCAST</div>
                        <motion.button
                            className="sos-master-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSOSClick}
                        >
                            SOS
                        </motion.button>
                        <button className="btn btn-ghost btn-sm" onClick={onCancel} style={{ marginTop: '2rem' }}>
                            Cancel Demo
                        </button>
                    </motion.div>
                )}

                {/* COUNTDOWN OVERLAY */}
                {state === 'countdown' && (
                    <motion.div
                        className="sos-overlay countdown-overlay"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                    >
                        <div className="blur-bg" />
                        <div className="countdown-content">
                            <motion.div
                                key={countdown}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="countdown-number"
                            >
                                {countdown}
                            </motion.div>
                            <h2 className="sos-status-text">Activating Emergency SOS...</h2>
                        </div>
                    </motion.div>
                )}

                {/* ANALYZING STATE */}
                {state === 'analyzing' && (
                    <motion.div
                        className="sos-overlay analyzing-overlay"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="scanner-container">
                            <div className="scanner-line" />
                            <div className="ai-brain-icon">🧠</div>
                            <div className="analysis-text-reel">
                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={analysisStep}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -20, opacity: 0 }}
                                        className="current-analysis-text"
                                    >
                                        {analysisTexts[analysisStep] || analysisTexts[analysisTexts.length - 1]}
                                    </motion.p>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* DECISION STATE */}
                {state === 'decision' && (
                    <motion.div
                        className="sos-overlay decision-overlay"
                        initial={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                        animate={{ backgroundColor: 'rgba(230,57,70,0.2)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="disaster-badge-container"
                        >
                            <div className="sos-alert-pulse" />
                            <h1 className="disaster-alert-title">🚨 DISASTER DETECTED</h1>
                            <p className="vision-ai-status">📸 Vision AI analyzing...</p>
                        </motion.div>
                    </motion.div>
                )}

                {/* ALERTING STATE (MAP PULSE & CARDS) */}
                {state === 'alerting' && (
                    <motion.div className="sos-overlay alerting-overlay">
                        <div className="map-pulse-bg">
                            <div className="pulse-ring r1" />
                            <div className="pulse-ring r2" />
                            <div className="pulse-ring r3" />
                        </div>

                        <div className="alert-cards-container">
                            <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible" className="notif-card">
                                <span className="notif-icon">🛡️</span>
                                <div className="notif-content">
                                    <strong>Volunteers Alerted</strong>
                                    <span>24 nearby responders contacted</span>
                                </div>
                            </motion.div>
                            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible" className="notif-card">
                                <span className="notif-icon">🏢</span>
                                <div className="notif-content">
                                    <strong>Nearby NGOs Notified</strong>
                                    <span>Global Relief & Red Cross active</span>
                                </div>
                            </motion.div>
                            <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible" className="notif-card">
                                <span className="notif-icon">📡</span>
                                <div className="notif-content">
                                    <strong>Satellite Lock</strong>
                                    <span>Live tracking active for responders</span>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {/* FINAL STATE */}
                {state === 'completed' && (
                    <motion.div
                        className="sos-overlay completed-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="success-content">
                            <motion.div
                                className="pulsing-marker"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                📍
                            </motion.div>
                            <h1 className="help-way-title">HELP IS ON THE WAY</h1>
                            <p className="help-way-sub">Stay calm. Responders have been notified.</p>
                            <button className="btn btn-primary" onClick={onComplete} style={{ marginTop: '2rem' }}>
                                Back to Platform
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExtremeSOSFlow;
