import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SuperAdminLogin = () => {
    const [secretKey, setSecretKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log('Attempting Super Admin login...');
            const response = await apiClient.post('/api/auth/login-super-admin', {
                secretKey
            });

            console.log('Login response:', response);
            login(response.user, response.accessToken);
            console.log('Navigating to dashboard...');
            navigate('/super-admin/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Invalid secret key');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 max-w-md w-full shadow-2xl">
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4 animate-bounce">👑</div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Super Admin
                    </h1>
                    <p className="text-purple-200">
                        Platform Control Access
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                            Secret Key
                        </label>
                        <input
                            type="password"
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                            className="w-full p-4 bg-white/10 border border-white/20 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-white/40"
                            placeholder="Enter secret key..."
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-sm">
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? 'Authenticating...' : '🔓 Access Control Panel'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all"
                    >
                        ← Back to Home
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-white/40 text-xs">
                        ⚠️ Restricted Access Only
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLogin;
