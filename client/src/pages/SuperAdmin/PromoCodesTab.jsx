import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, CheckCircle2, AlertCircle, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PromoCodesTab = () => {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        type: 'flat', // 'flat' or 'percentage'
        value: '',
        applicablePlans: [], // ['basic', 'standard', 'premium']
        validFrom: '',
        validTo: '',
        usageLimit: ''
    });

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            const token = localStorage.getItem('superAdminToken');
            const response = await fetch('/api/admin/promocodes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setPromoCodes(data.promoCodes || []);
        } catch (error) {
            console.error('Error fetching promo codes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPromoCode = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('superAdminToken');
            const response = await fetch('/api/admin/promocodes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    applicablePlans: JSON.stringify(formData.applicablePlans) // Send as JSON string
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setMessage({ type: 'success', text: 'Promo code created successfully!' });
            fetchPromoCodes();
            setShowAddModal(false);
            setFormData({
                code: '',
                type: 'flat',
                value: '',
                applicablePlans: [],
                validFrom: '',
                validTo: '',
                usageLimit: ''
            });
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const handleDeletePromoCode = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promo code?')) return;

        try {
            const token = localStorage.getItem('superAdminToken');
            const response = await fetch(`/api/admin/promocodes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete promo code');

            setMessage({ type: 'success', text: 'Promo code deleted successfully' });
            fetchPromoCodes();
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const handlePlanChange = (plan) => {
        setFormData(prev => {
            const plans = prev.applicablePlans.includes(plan)
                ? prev.applicablePlans.filter(p => p !== plan)
                : [...prev.applicablePlans, plan];
            return { ...prev, applicablePlans: plans };
        });
    };

    const filteredCodes = promoCodes.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Promo Codes</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-colors"
                >
                    <Plus size={20} /> Create Code
                </button>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto"><X size={16} /></button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search promo codes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCodes.map((code) => (
                        <div key={code.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow relative group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <Tag className="text-indigo-600 h-5 w-5" />
                                    <span className="font-bold text-lg text-gray-900">{code.code}</span>
                                </div>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${code.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {code.status}
                                </span>
                            </div>

                            <div className="text-2xl font-bold text-indigo-600 mb-2">
                                {code.type === 'flat' ? `₹${code.value}` : `${code.value}%`} OFF
                            </div>

                            <div className="space-y-1 text-sm text-gray-500">
                                <p>Plans: {JSON.parse(code.applicable_plans).join(', ')}</p>
                                <p>Valid: {new Date(code.valid_from).toLocaleDateString()} - {new Date(code.valid_to).toLocaleDateString()}</p>
                                <p>Used: {code.used_count} / {code.usage_limit}</p>
                            </div>

                            <button
                                onClick={() => handleDeletePromoCode(code.id)}
                                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Promo Code Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Create Promo Code</h3>
                                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleAddPromoCode} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase"
                                            placeholder="SUMMER2024"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            <option value="flat">Flat Amount (₹)</option>
                                            <option value="percentage">Percentage (%)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value</label>
                                    <input
                                        type="number"
                                        value={formData.value}
                                        onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder={formData.type === 'flat' ? '500' : '20'}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Applicable Plans</label>
                                    <div className="flex gap-4">
                                        {['basic', 'standard', 'premium'].map(plan => (
                                            <label key={plan} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.applicablePlans.includes(plan)}
                                                    onChange={() => handlePlanChange(plan)}
                                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="capitalize text-gray-700">{plan}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
                                        <input
                                            type="date"
                                            value={formData.validFrom}
                                            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
                                        <input
                                            type="date"
                                            value={formData.validTo}
                                            onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                                    <input
                                        type="number"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder="100"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors mt-4"
                                >
                                    Create Promo Code
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PromoCodesTab;
