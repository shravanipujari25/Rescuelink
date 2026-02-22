// In development: use direct URL to bypass proxy limits if needed, or relative /api
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'https://rescuelink-backend-q4ub.onrender.com/api' : '/api');

/**
 * api — thin fetch wrapper that:
 * - Attaches Authorization header from localStorage automatically
 * - Returns parsed JSON on success
 * - Throws an Error with the server's message on failure
 */
const api = async (path, options = {}) => {
    const token = localStorage.getItem('rl_token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    // If it's an AI request, always make it relative to /api/ai so Vite proxy catches it
    // even if VITE_API_URL is set to a specific host for the main backend.
    const url = path.startsWith('/ai') ? `/api${path}` : `${BASE_URL}${path}`;

    let res;
    try {
        res = await fetch(url, {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
    } catch (networkErr) {
        // Network-level failure (CORS, server down, no internet, etc.)
        console.error('[API] Network error ❌', {
            url,
            method: options.method || 'GET',
            error: networkErr,
            message: networkErr.message,
        });
        throw networkErr;
    }

    const data = await res.json().catch((parseErr) => {
        console.error('[API] Failed to parse response JSON ❌', { url, status: res.status, parseErr });
        throw new Error('Invalid JSON response from server');
    });

    if (!res.ok) {
        console.error('[API] HTTP error ❌', {
            url,
            status: res.status,
            responseBody: data,
        });
        const err = new Error(data.message || 'Something went wrong');
        err.status = res.status;
        err.errors = data.errors; // Zod field errors
        throw err;
    }

    return data;
};

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
    signup: (body) => api('/auth/signup', { method: 'POST', body }),
    verifyEmail: (body) => api('/auth/verify-email', { method: 'POST', body }),
    resendOtp: (body) => api('/auth/resend-otp', { method: 'POST', body }),
    login: (body) => api('/auth/login', { method: 'POST', body }),
    logout: () => api('/auth/logout', { method: 'POST' }),
    forgotPassword: (body) => api('/auth/forgot-password', { method: 'POST', body }),
    resetPassword: (body) => api('/auth/reset-password', { method: 'POST', body }),
};


// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------
export const adminApi = {
    dashboard: () => api('/admin/dashboard'),
    listUsers: (params = {}) => api(`/admin/users?${new URLSearchParams(params)}`),
    pending: () => api('/admin/users/pending'),
    getUser: (id) => api(`/admin/users/${id}`),
    approve: (id) => api(`/admin/users/${id}/approve`, { method: 'PATCH' }),
    reject: (id, reason) => api(`/admin/users/${id}/reject`, { method: 'PATCH', body: { reason } }),
    suspend: (id) => api(`/admin/users/${id}/suspend`, { method: 'PATCH' }),
    unsuspend: (id) => api(`/admin/users/${id}/unsuspend`, { method: 'PATCH' }),
};

// ---------------------------------------------------------------------------
// SOS
// ---------------------------------------------------------------------------
export const sosApi = {
    create: (body) => api('/sos', { method: 'POST', body }),
    getAssigned: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return api(`/sos/assigned${query ? `?${query}` : ''}`);
    },
    resolve: (id) => api(`/sos/${id}/resolve`, { method: 'PUT' }),
    updateResponderLocation: (id, body) => api(`/sos/${id}/location`, { method: 'POST', body }),
    getMyActiveSOS: () => api('/sos/my-active'),
    getResolved: () => api('/sos/resolved'),
};
// ---------------------------------------------------------------------------
// Donations
// ---------------------------------------------------------------------------
export const donationApi = {
    getCampaigns: () => api('/donations/campaigns'),
    createCampaign: (body) => api('/donations/campaign', { method: 'POST', body }),
    recordSpend: (body) => api('/donations/spend', { method: 'POST', body }),
    pay: (body) => api('/donations/pay', { method: 'POST', body }),
    getMyDonations: () => api('/donations/my'),
    getAllData: () => api('/donations/all'),
};

// ---------------------------------------------------------------------------
// AI Assistant
// ---------------------------------------------------------------------------
export const aiApi = {
    emergencyAssistant: (message) => api('/ai/emergency-assistant', { method: 'POST', body: { message } }),
};

// ---------------------------------------------------------------------------
// Public Stats
// ---------------------------------------------------------------------------
export const publicApi = {
    getStats: () => api('/public/stats'),
    searchNGOs: (q, service) => {
        const params = new URLSearchParams();
        if (q) params.append('q', q);
        if (service) params.append('service', service);
        return api(`/public/ngos?${params.toString()}`);
    }
};

