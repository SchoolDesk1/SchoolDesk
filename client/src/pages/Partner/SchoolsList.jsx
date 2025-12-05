import React, { useEffect, useState } from 'react';
import { Search, Filter, Download, MoreVertical, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PartnerSchoolsList = () => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            const token = localStorage.getItem('partnerToken');
            const response = await fetch('/api/partner/schools', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setSchools(data.schools || []);
        } catch (error) {
            console.error('Error fetching schools:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSchools = schools.filter(school =>
        school.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900">My Schools</h2>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search schools..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                        <Filter size={20} />
                    </button>
                    <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading schools...</div>
            ) : filteredSchools.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="text-gray-400 h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No schools found</h3>
                    <p className="text-gray-500">
                        {searchTerm ? "Try adjusting your search terms" : "Share your referral link to add your first school!"}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">School Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Plan</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Joined Date</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Revenue</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSchools.map((school) => (
                                    <motion.tr
                                        key={school.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">{school.school_name}</p>
                                                <p className="text-sm text-gray-500">{school.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium uppercase">
                                                {school.plan_type || 'Basic'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(school.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${school.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {school.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                                            ₹{school.revenue?.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PartnerSchoolsList;
