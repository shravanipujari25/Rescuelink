import { useState, useRef, useEffect } from 'react';
import { aiApi } from '../services/api';
import { useTranslation } from 'react-i18next';
import './SmartAssistant.css';

export default function SmartAssistant() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { role: 'ai', text: 'Hello! I am your RescueLink Smart Assistant. You can tell me about an emergency or ask for help.' }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMsg = message.trim();
        setChat(prev => [...prev, { role: 'user', text: userMsg }]);
        setMessage('');
        setLoading(true);

        try {
            const res = await aiApi.emergencyAssistant(userMsg);

            // Format the list of guidance steps into a readable string
            let aiText = "";
            if (res.guidance && Array.isArray(res.guidance)) {
                if (res.guidance.length > 1) {
                    aiText = res.guidance.map((step, idx) => `${idx + 1}. ${step}`).join('\n');
                } else {
                    aiText = res.guidance.join('\n');
                }
            } else {
                aiText = "I have analyzed your situation and classified it as a " + res.classification + " emergency.";
            }

            if (res.recommend_sos) {
                aiText += "\n\n🚨 **Emergency detected.** I recommend sending an SOS immediately.";
            }

            setChat(prev => [...prev, {
                role: 'ai',
                text: aiText,
                data: res
            }]);
        } catch (err) {
            setChat(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to my brain right now.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`smart-assistant-wrap ${isOpen ? 'open' : ''}`}>
            {/* FAB Button */}
            <button className="assistant-fab" onClick={() => setIsOpen(!isOpen)}>
                <span className="fab-icon">{isOpen ? '✕' : '🤖'}</span>
                {!isOpen && <span className="fab-label">Ask AI for Help</span>}
            </button>

            {/* Chat Window */}
            <div className="assistant-window">
                <div className="window-header">
                    <div className="header-brand">
                        <span className="brand-dot"></span>
                        <h3>RescueLink AI</h3>
                    </div>
                </div>

                <div className="chat-messages" ref={scrollRef}>
                    {chat.map((m, i) => (
                        <div key={i} className={`message-row ${m.role}`}>
                            <div className="message-bubble">
                                {m.text}
                                {m.data?.classification && m.data.classification !== 'other' && (
                                    <div className="message-meta">
                                        Type: {m.data.classification} | Severity: {m.data.severity_level}
                                        {m.data.sentiment && <div style={{ opacity: 0.8, marginTop: '2px' }}>AI Mood: {m.data.sentiment} ({m.data.urgency_score}/10)</div>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="message-row ai">
                            <div className="message-bubble loading">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        </div>
                    )}
                </div>

                <form className="chat-input" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Type your emergency or question..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !message.trim()}>
                        {loading ? '...' : '→'}
                    </button>
                </form>
            </div>
        </div>
    );
}
