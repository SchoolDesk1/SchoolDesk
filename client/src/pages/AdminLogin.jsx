import React, { useState } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await apiClient.post('/api/auth/login-super-admin', { email, password });

            login(data, data.accessToken);
            navigate('/super-admin');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
            <SEO title="Admin Login - SchoolDesk" noindex={true} />
            {/* Subtle animated background */}
            <div className="absolute inset-0 overflow-hidden opacity-20">
                <div className="absolute top-20 left-20 w-64 h-64 bg-red-500 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="bg-gray-900/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-96 relative z-10 border border-gray-700">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🔐</div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        Super Admin
                    </h2>
                    <p className="text-gray-400 text-sm">Restricted Access Only</p>
                </div>

                {error && (
                    <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-3 mb-4 rounded-lg animate-shake">
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <label className="block text-gray-300 text-sm font-semibold mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-gray-800 border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                            placeholder="admin@example.com"
                            required
                            autoComplete="off"
                        />
                    </div>
                    <div className="relative">
                        <label className="block text-gray-300 text-sm font-semibold mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 bg-gray-800 border-2 border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                            placeholder="Enter admin password"
                            required
                            autoComplete="off"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-purple-600 text-white p-3 rounded-lg font-semibold hover:from-red-700 hover:to-purple-700 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Authenticating...
                            </span>
                        ) : 'Access Admin Panel'}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>⚠️ Unauthorized access is prohibited</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
