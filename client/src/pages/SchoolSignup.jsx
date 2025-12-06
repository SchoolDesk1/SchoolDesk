import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import PremiumLayout from '../components/PremiumLayout';
import SEO from '../components/SEO';
import { Loader2, School, Mail, Lock, User, Phone, MapPin, Tag, Check } from 'lucide-react';
import { getApiUrl } from '../config/api';

const SchoolSignup = () => {
    const [formData, setFormData] = useState({
        school_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        contact_person: '',
        contact_phone: '',
        address: '',
        partnerCode: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Check for referral code in URL
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get('ref');
        if (refCode) {
            setFormData(prev => ({ ...prev, partnerCode: refCode }));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(getApiUrl('/api/auth/register-school'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    school_name: formData.school_name,
                    email: formData.email,
                    password: formData.password,
                    contact_person: formData.contact_person,
                    contact_phone: formData.contact_phone,
                    address: formData.address,
                    partnerCode: formData.partnerCode
                })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                if (!import.meta.env.VITE_API_URL) {
                    throw new Error('Backend server not configured. Please contact support.');
                }
                throw new Error('Server temporarily unavailable. Please try again.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            setSuccess(data.message);

            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PremiumLayout
            title="Start Your Free Trial"
            subtitle="Join 500+ schools transforming their management"
        >
            <SEO
                title="Sign Up for SchoolDesk - Free 14-Day Trial"
                description="Register your school with SchoolDesk today. Start your 14-day free trial and experience the future of school management."
            />
            <div className="text-center mb-8">
                <div className="inline-block p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                    <img src={logo} alt="SchoolDesk Logo" className="w-12 h-12" />
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></div>
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-200 p-3 rounded-lg mb-6 text-sm flex items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></div>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">School Name</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <School size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="school_name"
                                value={formData.school_name}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all"
                                placeholder="Green Valley Academy"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all"
                                placeholder="school@email.com"
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
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all"
                                placeholder="Min. 6 chars"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Confirm Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                            </div>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all"
                                placeholder="Re-enter password"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Contact Person</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="contact_person"
                                value={formData.contact_person}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all"
                                placeholder="Principal Name"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Contact Phone</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                            </div>
                            <input
                                type="tel"
                                name="contact_phone"
                                value={formData.contact_phone}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all"
                                placeholder="Phone Number"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Address</label>
                    <div className="relative group">
                        <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                            <MapPin size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                        </div>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="2"
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all resize-none"
                            placeholder="School Address"
                        ></textarea>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 ml-1">Referral Code (Optional)</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag size={18} className="text-gray-500 group-focus-within:text-purple-400 transition-colors" />
                        </div>
                        <input
                            type="text"
                            name="partnerCode"
                            value={formData.partnerCode}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none text-white placeholder-gray-500 transition-all uppercase"
                            placeholder="SDP001"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} className="animate-spin mr-2" />
                            <span>Creating Account...</span>
                        </>
                    ) : (
                        <span>Start Free Trial</span>
                    )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-xs text-gray-400">
                        <Check size={14} className="text-green-400 mr-2" />
                        14 days free access
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                        <Check size={14} className="text-green-400 mr-2" />
                        Up to 2 classes
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                        <Check size={14} className="text-green-400 mr-2" />
                        Up to 20 students
                    </div>
                    <div className="flex items-center text-xs text-gray-400">
                        <Check size={14} className="text-green-400 mr-2" />
                        All core features
                    </div>
                </div>

                <p className="text-center text-gray-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </PremiumLayout>
    );
};

export default SchoolSignup;
