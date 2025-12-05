import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, AlertCircle, Clock, DollarSign, User } from 'lucide-react';
import { motion } from 'framer-motion';

const PayoutsTab = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            const token = localStorage.getItem('superAdminToken');
            const response = await fetch('/api/admin/payouts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setPayouts(data.payouts || []);
        } catch (error) {
            console.error('Error fetching payouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (!window.confirm(`Are you sure you want to mark this payout as ${status}?`)) return;

        try {
            const token = localStorage.getItem('superAdminToken');
            const response = await fetch(`/api/admin/payouts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) throw new Error('Failed to update status');

            setMessage({ type: 'success', text: `Payout marked as ${status}` });
            fetchPayouts();
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const filteredPayouts = payouts.filter(p =>
        p.partner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.partner_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Payout Requests</h2>

            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                    <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto"><XCircle size={16} /></button>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by partner name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Partner</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Amount</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Payment Details</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Requested At</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayouts.map((payout) => (
                                <tr key={payout.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{payout.partner_name}</p>
                                            <p className="text-sm text-gray-500">{payout.partner_email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        ₹{payout.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate" title={payout.payment_details}>
                                        {payout.payment_details}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(payout.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${payout.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                payout.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {payout.status === 'pending' && (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(payout.id, 'completed')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Mark as Completed"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(payout.id, 'rejected')}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Reject Request"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PayoutsTab;
