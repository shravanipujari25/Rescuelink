import logger from '../config/logger.js';

/**
 * AI Triage Service
 * Interfaces with the FastAPI AI microservice for emergency classification and assessment.
 */
export const aiTriageService = {
    /**
     * Triage an emergency message
     * @param {string} message - The user's emergency description
     * @param {string} requestId - Request ID for logging
     * @returns {Promise<Object|null>} - AI analysis or null if failed
     */
    async getTriage(message, requestId) {
        if (!message) return null;

        const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://localhost:8000';

        try {
            logger.info({ requestId, message }, 'Calling AI Triage service');

            // Set a timeout using AbortController (Node 18+)
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${AI_BACKEND_URL}/api/ai/triage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!response.ok) {
                const errorData = await response.json();
                logger.error({ requestId, status: response.status, errorData }, 'AI Triage service error response');
                return null;
            }

            const data = await response.json();
            logger.info({ requestId, data }, 'AI Triage analysis received');

            return {
                disaster_type: data.disaster_type,
                severity_score: data.severity_score,
                priority: data.priority,
                injured: data.injured,
                trapped: data.trapped,
                ai_source: data.source,
                ai_confidence: data.confidence
            };

        } catch (error) {
            if (error.name === 'AbortError') {
                logger.warn({ requestId }, 'AI Triage service timeout (5s)');
            } else {
                logger.error({ requestId, err: error }, 'Failed to communicate with AI Triage service');
            }
            return null; // Graceful fallback
        }
    }
};
