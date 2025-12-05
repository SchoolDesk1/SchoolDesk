import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import PremiumLayout from '../components/PremiumLayout';
import SEO from '../components/SEO';
import { Loader2, Lock, Mail, Phone, User } from 'lucide-react';

const Login = () => {
    const [role, setRole] = useState('school_admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [classPassword, setClassPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setEmail('');
        setPassword('');
        setPhone('');
        setClassPassword('');
        setError('');
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        let endpoint = '';
        let body = {};

        try {
            if (role === 'school_admin') {
                endpoint = '/api/auth/login-school';
                body = { email, password };
            } else {
                if (!/^\d{10}$/.test(phone)) {
                    setLoading(false);
                    return setError('Enter a valid 10-digit phone number.');
                }
                endpoint = '/api/auth/login-user';
                body = { phone, password: classPassword, role };
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server error: Backend is not responding correctly.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            login(data, data.accessToken);
            navigate('/app');

        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PremiumLayout
            title="Welcome Back"
            subtitle="Sign in to manage your school"
        >
            <SEO
                title="Login - SchoolDesk"
                description="Secure login for SchoolDesk. Access your dashboard for school administration, teaching tools, or parent portal."
            />
            <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                    <img src={logo} alt="SchoolDesk Logo" className="w-12 h-12" />
                </div>
            </div>

            {/* Role Tabs */}
            <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mb-8">
                {['school_admin', 'teacher', 'parent'].map((r) => (
                    <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${role === r
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        {r === 'school_admin' ? 'School' : r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {role === 'school_admin' ? (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all"
                                    placeholder="admin@school.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Phone Number</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all"
                                    placeholder="9876543210"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={classPassword}
                                    onChange={(e) => setClassPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin mr-2" />
                            <span>Signing in...</span>
                        </>
                    ) : (
                        <span>Sign In</span>
                    )}
                </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                    Don't have a school account?{' '}
                    <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Start Free Trial
                    </Link>
                </p>
            </div>
        </PremiumLayout>
    );
};

export default Login;
