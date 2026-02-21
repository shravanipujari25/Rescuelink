import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'rl_token';
const USER_KEY = 'rl_user';

/**
 * AuthProvider — manages auth state globally.
 * Persists token + user to localStorage so sessions survive refresh.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; }
        catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
    const [loading, setLoading] = useState(false);

    const isAuthenticated = !!token && !!user;

    // -------------------------------------------------------------------------
    // login — called after successful /api/auth/login response
    // -------------------------------------------------------------------------
    const login = useCallback((userData, jwtToken) => {
        localStorage.setItem(TOKEN_KEY, jwtToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setToken(jwtToken);
        setUser(userData);
    }, []);

    // -------------------------------------------------------------------------
    // logout — calls the API to blocklist the token, then clears state
    // -------------------------------------------------------------------------
    const logout = useCallback(async () => {
        setLoading(true);
        try {
            await authApi.logout();
        } catch {
            // Even if the API call fails, clear local state
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            setToken(null);
            setUser(null);
            setLoading(false);
        }
    }, []);

    // -------------------------------------------------------------------------
    // updateUser — for partial updates (e.g. after admin approval)
    // -------------------------------------------------------------------------
    const updateUser = useCallback((updates) => {
        setUser((prev) => {
            const next = { ...prev, ...updates };
            localStorage.setItem(USER_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, token, isAuthenticated, loading, login, logout, updateUser }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
