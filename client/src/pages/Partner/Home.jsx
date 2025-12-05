import React, { useEffect, useState } from 'react';
import {
    Users,
    IndianRupee,
    TrendingUp,
    ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, subtext }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
    >
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                +12% this month
            </span>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-2">{subtext}</p>}
    </motion.div>
);

const PartnerHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('partnerToken');

            // Fetch stats
            const statsRes = await fetch('/api/partner/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const statsData = await statsRes.json();
            setStats(statsData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Schools"
                    value={stats?.totalSchools || 0}
                    icon={Users}
                    color="bg-blue-500"
                    subtext="Active schools referred by you"
                />
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
                    icon={IndianRupee}
                    color="bg-green-500"
                    subtext="Total revenue generated"
                />
                <StatCard
                    title="Pending Commission"
                    value={`₹${stats?.pendingCommission?.toLocaleString() || 0}`}
                    icon={TrendingUp}
                    color="bg-purple-500"
                    subtext="Available for payout"
                />
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900">Recent Schools</h3>
                    <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1">
                        View All <ExternalLink size={16} />
                    </button>
                </div>

                {stats?.totalSchools === 0 ? (
                    <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Users className="mx-auto h-12 w-12 mb-3 opacity-50" />
                        <p>No schools added yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 text-gray-500 text-sm">
                                    <th className="pb-3 font-medium">School Name</th>
                                    <th className="pb-3 font-medium">Date Joined</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium text-right">Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {/* We'll populate this properly in the full list page */}
                                <tr>
                                    <td className="py-3 text-gray-500" colSpan="4">
                                        Check "My Schools" tab for detailed list
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnerHome;
