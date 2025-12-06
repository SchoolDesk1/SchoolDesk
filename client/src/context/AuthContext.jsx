import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const logout = (navigate = null) => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.clear(); // Clear all localStorage

        // Use React Router navigation if provided, otherwise do a soft navigate
        if (navigate) {
            navigate('/login', { replace: true });
        }
    };

    const refreshUser = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        // Try to load user from localStorage first (for immediate UI)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (e) {
                console.error("Failed to parse stored user:", e);
            }
        }

        try {
            const res = await fetch('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                // Only logout if we don't have a stored user  AND the token is truly invalid
                if (!storedUser && res.status === 401) {
                    logout();
                } else {
                    console.warn("Token refresh failed but user data exists in localStorage");
                }
            }
        } catch (err) {
            console.error("Failed to refresh user:", err);
            // Don't logout on network errors, keep the stored user
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, [token]);

    const login = (userData, newToken) => {
        setUser(userData);
        setToken(newToken);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, refreshUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
