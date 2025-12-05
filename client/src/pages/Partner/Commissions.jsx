import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, ArrowUpRight, Clock, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PartnerCommissions = () => {
    const [stats, setStats] = useState(null);
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPayoutModal, setShowPayoutModal] = useState(false);

    // Payout Form State
    const [amount, setAmount] = useState('');
    const [paymentDetails, setPaymentDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('partnerToken');

            // Fetch Stats
            const statsRes = await fetch('/api/partner/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const statsData = await statsRes.json();
            setStats(statsData);

            // Fetch Payout History
            const payoutsRes = await fetch('/api/partner/payouts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const payoutsData = await payoutsRes.json();
            setPayouts(payoutsData.payouts || []);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPayout = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('partnerToken');
            const response = await fetch('/api/partner/request-payout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ amount: parseFloat(amount), paymentDetails })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message);

            setMessage({ type: 'success', text: 'Payout request submitted successfully!' });
            setAmount('');
            setPaymentDetails('');
            fetchData(); // Refresh data
            setTimeout(() => {
                setShowPayoutModal(false);
                setMessage({ type: '', text: '' });
            }, 2000);

        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading commissions...</div>;

    return (
        <div className="space-y-8 relative">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Commissions & Payouts</h2>
                <button
                    onClick={() => setShowPayoutModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                    Request Payout
                </button>
            </div>

            {/* Commission Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Wallet className="h-6 w-6" />
                        </div>
                        <span className="font-medium text-indigo-100">Available Balance</span>
                    </div>
                    <h3 className="text-3xl font-bold mb-1">₹{stats?.pendingCommission?.toLocaleString() || '0.00'}</h3>
                    <p className="text-sm text-indigo-200">Ready for payout</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="font-medium text-gray-600">Total Earned</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">₹{stats?.totalCommission?.toLocaleString() || '0.00'}</h3>
                    <p className="text-sm text-gray-500">Lifetime earnings</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                        <span className="font-medium text-gray-600">Total Paid Out</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        ₹{((stats?.totalCommission || 0) - (stats?.pendingCommission || 0)).toLocaleString()}
                    </h3>
                    <p className="text-sm text-gray-500">Processed payments</p>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-6">Payout History</h3>

                {payouts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ArrowUpRight className="text-gray-400 h-6 w-6" />
                        </div>
                        <p className="font-medium text-gray-900">No transactions yet</p>
                        <p className="text-sm mt-1">Commission payments will appear here once processed.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Date</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Details</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payouts.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(payout.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            ₹{payout.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">
                                            {payout.payment_details}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${payout.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    payout.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payout Request Modal */}
            <AnimatePresence>
                {showPayoutModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Request Payout</h3>
                                <button onClick={() => setShowPayoutModal(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            {message.text && (
                                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={handleRequestPayout} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        max={stats?.pendingCommission || 0}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder="Enter amount"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Available: ₹{stats?.pendingCommission?.toLocaleString() || '0.00'}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Details</label>
                                    <textarea
                                        value={paymentDetails}
                                        onChange={(e) => setPaymentDetails(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        placeholder="Enter UPI ID or Bank Account Details (Account No, IFSC, Name)"
                                        rows="3"
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting || (stats?.pendingCommission || 0) <= 0}
                                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : 'Submit Request'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PartnerCommissions;
