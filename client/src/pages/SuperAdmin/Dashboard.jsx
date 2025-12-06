import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import PartnersTab from './PartnersTab';
import PromoCodesTab from './PromoCodesTab';
import PayoutsTab from './PayoutsTab';

const SuperAdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [schools, setSchools] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [users, setUsers] = useState({ teachers: [], parents: [], total: 0 });
    const [payments, setPayments] = useState([]);
    const [revenueStats, setRevenueStats] = useState({});
    const [logs, setLogs] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [searchResults, setSearchResults] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(null);
    const [formData, setFormData] = useState({});
    const { token, logout } = useAuth();

    const handleLogout = () => logout(navigate);

    const API_URL = '/api/admin';

    useEffect(() => {
        fetchSchools();
        fetchComprehensiveAnalytics();
        fetchRevenueStats();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') fetchUsersDetailed();
        if (activeTab === 'revenue') fetchPayments();
        if (activeTab === 'logs') fetchLogs();
        if (activeTab === 'tickets') fetchTickets();
    }, [activeTab]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 2) {
                handleGlobalSearch();
            } else {
                setSearchResults(null);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchSchools = async () => {
        try {
            const response = await axios.get(`${API_URL}/schools`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchools(response.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
        }
    };

    const fetchComprehensiveAnalytics = async () => {
        try {
            const response = await axios.get(`${API_URL}/analytics/comprehensive`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error', error);
        }
    };

    const fetchLogs = async () => {
        try {
            const response = await axios.get(`${API_URL}/logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const fetchTickets = async () => {
        try {
            const response = await axios.get(`${API_URL}/tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(response.data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    const handleGlobalSearch = async () => {
        try {
            const response = await axios.get(`${API_URL}/search?query=${searchQuery}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching:', error);
        }
    };

    const fetchSchoolFullDetails = async (schoolId) => {
        try {
            const response = await axios.get(`${API_URL}/schools/${schoolId}/full-details`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedSchool(response.data);
            setShowModal('schoolDetail');
        } catch (error) {
            console.error('Error fetching school details:', error);
        }
    };

    const handleOpenSchoolControl = (schoolId) => {
        const school = schools.find(s => s.id === schoolId);
        setSelectedSchool(school);
        setShowModal('schoolControl');
    };

    const handleDownloadBackup = async () => {
        try {
            const response = await axios.get(`${API_URL}/backup/system`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `school_desk_system_backup_${Date.now()}.db`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading backup:', error);
            alert('Failed to download backup');
        }
    };

    const fetchUsersDetailed = async (page = 1, filters = {}) => {
        try {
            const params = new URLSearchParams({ page, limit: 100, ...filters });
            const response = await axios.get(`${API_URL}/users/detailed?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchPayments = async () => {
        try {
            const response = await axios.get(`${API_URL}/payments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(response.data || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
            setPayments([]);
        }
    };

    const fetchRevenueStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/analytics/revenue`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRevenueStats(response.data || {});
        } catch (error) {
            console.error('Error fetching revenue stats:', error);
            setRevenueStats({});
        }
    };

    const handleResetSchoolPassword = async (schoolId) => {
        const newPassword = prompt('Enter new password for this school:');
        if (!newPassword) return;

        try {
            await axios.post(`${API_URL}/schools/${schoolId}/reset-password`,
                { newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`✅ Password reset successfully!\n\nNew Password: ${newPassword}\n\nPlease share this with the school admin.`);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const handleToggleSchoolBlock = async (schoolId, currentStatus) => {
        const isBlocked = currentStatus === 'suspended';
        const action = isBlocked ? 'unblock' : 'block';

        if (!window.confirm(`Are you sure you want to ${action} this school?`)) return;

        try {
            await axios.post(`${API_URL}/schools/${schoolId}/toggle-block`,
                { blocked: !isBlocked },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`✅ School ${action}ed successfully!`);
            fetchSchools();
            if (selectedSchool?.id === schoolId) {
                fetchSchoolFullDetails(schoolId);
            }
        } catch (error) {
            alert(error.response?.data?.message || `Failed to ${action} school`);
        }
    };

    const handleUpdateSchoolPlan = async (schoolId, planData) => {
        try {
            await axios.patch(`${API_URL}/schools/${schoolId}/update-plan`,
                planData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('✅ School plan updated successfully!');
            fetchSchools();
            fetchSchoolFullDetails(schoolId);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update plan');
        }
    };

    const handleResetUserPassword = async (userId, userName) => {
        const newPassword = prompt(`Enter new password for ${userName}:`);
        if (!newPassword) return;

        try {
            await axios.post(`${API_URL}/users/${userId}/reset-password`,
                { newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`✅ Password reset successfully!\n\nUser: ${userName}\nNew Password: ${newPassword}`);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to reset password');
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`⚠️ Are you sure you want to delete ${userName}?\n\nThis action cannot be undone.`)) return;

        try {
            await axios.delete(`${API_URL}/users/${userId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('✅ User deleted successfully!');
            fetchUsersDetailed();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 opacity-20 rounded-full blur-3xl animate-pulse"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20 shadow-2xl sticky top-0">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <span className="text-3xl">👑</span> Super Admin
                        </h1>
                    </div>

                    {/* Global Search Bar */}
                    <div className="flex-1 max-w-2xl relative">
                        <input
                            type="text"
                            placeholder="🔍 Search schools, users, payments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {searchResults && searchQuery.length >= 2 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                                {searchResults.schools.length > 0 && (
                                    <div className="p-2">
                                        <p className="text-xs text-white/50 uppercase px-2 mb-1">Schools</p>
                                        {searchResults.schools.map(s => (
                                            <div key={s.id} onClick={() => { fetchSchoolFullDetails(s.id); setSearchQuery(''); }} className="p-2 hover:bg-white/10 rounded cursor-pointer text-white">
                                                {s.school_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searchResults.users.length > 0 && (
                                    <div className="p-2 border-t border-white/10">
                                        <p className="text-xs text-white/50 uppercase px-2 mb-1">Users</p>
                                        {searchResults.users.map(u => (
                                            <div key={u.id} className="p-2 hover:bg-white/10 rounded cursor-pointer text-white">
                                                {u.name} ({u.role}) - {u.school_name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {searchResults.schools.length === 0 && searchResults.users.length === 0 && (
                                    <div className="p-4 text-center text-white/50">No results found</div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-300/30 text-white rounded-lg transition-all"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard icon="🏫" label="Total Schools" value={analytics.totalSchools || 0} color="blue" />
                    <StatCard icon="✅" label="Active Schools" value={analytics.activeSchools || 0} color="green" />
                    <StatCard icon="👨‍🎓" label="Total Students" value={analytics.totalStudents || 0} color="purple" />
                    <StatCard icon="👨‍🏫" label="Total Teachers" value={analytics.totalTeachers || 0} color="pink" />
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 mb-6 flex flex-wrap gap-2">
                    <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="📊" label="Overview" />
                    <TabButton active={activeTab === 'schools'} onClick={() => setActiveTab('schools')} icon="🏫" label="Schools" />
                    <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="👥" label="Users" />
                    <TabButton active={activeTab === 'revenue'} onClick={() => setActiveTab('revenue')} icon="💰" label="Revenue" />
                    <TabButton active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} icon="🤝" label="Partners" />
                    <TabButton active={activeTab === 'promocodes'} onClick={() => setActiveTab('promocodes')} icon="🏷️" label="Promo Codes" />
                    <TabButton active={activeTab === 'payouts'} onClick={() => setActiveTab('payouts')} icon="💸" label="Payouts" />
                    <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon="📜" label="Logs" />
                    <TabButton active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} icon="🎫" label="Support" />
                    <TabButton active={activeTab === 'control'} onClick={() => setActiveTab('control')} icon="⚙️" label="Control Center" />
                    <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="🔧" label="Settings" />
                </div>

                {/* Tab Content */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl">
                    {activeTab === 'overview' && (
                        <OverviewTab
                            analytics={analytics}
                            schools={schools}
                            onSchoolClick={fetchSchoolFullDetails}
                        />
                    )}

                    {activeTab === 'schools' && (
                        <SchoolsTab
                            schools={schools}
                            onViewDetails={fetchSchoolFullDetails}
                            onSchoolControl={handleOpenSchoolControl}
                            onResetPassword={handleResetSchoolPassword}
                            onToggleBlock={handleToggleSchoolBlock}
                        />
                    )}

                    {activeTab === 'users' && (
                        <UsersTab
                            users={users}
                            onResetPassword={handleResetUserPassword}
                            onDeleteUser={handleDeleteUser}
                        />
                    )}

                    {activeTab === 'revenue' && (
                        <RevenueTab
                            payments={payments}
                            schools={schools}
                            revenueStats={revenueStats}
                            analytics={analytics}
                            onViewSchool={(school) => {
                                setSelectedSchool(school);
                                setShowModal('schoolCredentials');
                            }}
                        />
                    )}

                    {activeTab === 'partners' && <PartnersTab />}
                    {activeTab === 'promocodes' && <PromoCodesTab />}
                    {activeTab === 'payouts' && <PayoutsTab />}

                    {activeTab === 'control' && (
                        <ControlCenterTab
                            schools={schools}
                            onAction={(school) => fetchSchoolFullDetails(school.id)}
                        />
                    )}

                    {activeTab === 'settings' && (
                        <SettingsTab
                            onDownloadBackup={handleDownloadBackup}
                        />
                    )}
                </div>
            </div>

            {/* School Credentials Modal */}
            {showModal === 'schoolCredentials' && selectedSchool && (
                <SchoolCredentialsModal
                    school={selectedSchool}
                    onClose={() => {
                        setShowModal(null);
                        setSelectedSchool(null);
                    }}
                />
            )}

            {/* School Control Modal */}
            {showModal === 'schoolControl' && selectedSchool && (
                <SchoolControlModal
                    school={selectedSchool}
                    onClose={() => {
                        setShowModal(null);
                        setSelectedSchool(null);
                    }}
                    onResetPassword={handleResetSchoolPassword}
                    onToggleBlock={handleToggleSchoolBlock}
                    onUpdatePlan={handleUpdateSchoolPlan}
                />
            )}

            {showModal === 'schoolDetail' && selectedSchool && (
                <SchoolDetailModal
                    school={selectedSchool}
                    onClose={() => {
                        setShowModal(null);
                        setSelectedSchool(null);
                    }}
                />
            )}
        </div>
    );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color }) => {
    const colors = {
        blue: 'from-blue-500/20 to-cyan-500/20',
        green: 'from-green-500/20 to-emerald-500/20',
        purple: 'from-purple-500/20 to-pink-500/20',
        pink: 'from-pink-500/20 to-rose-500/20',
    };

    return (
        <div className={`bg-gradient-to-br ${colors[color]} backdrop-blur-md border border-white/20 rounded-xl p-4 transform hover:scale-105 transition-all`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-white/70 text-xs font-medium">{label}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );
};

// Tab Button Component
const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${active
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
            : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
    >
        <span className="mr-2">{icon}</span>
        {label}
    </button>
);

// Overview Tab
const OverviewTab = ({ analytics, schools, onSchoolClick }) => {
    const { graphs } = analytics;

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📊</span> Platform Overview
            </h2>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard icon="🏫" label="Total Schools" value={analytics.totalSchools || 0} color="blue" />
                <StatCard icon="✅" label="Active Schools" value={analytics.activeSchools || 0} color="green" />
                <StatCard icon="🚫" label="Suspended" value={analytics.suspendedSchools || 0} color="pink" />
                <StatCard icon="💰" label="Total Revenue" value={`₹${analytics.totalRevenue || 0}`} color="purple" />

                <StatCard icon="👨‍🎓" label="Total Students" value={analytics.totalStudents || 0} color="blue" />
                <StatCard icon="👨‍🏫" label="Total Teachers" value={analytics.totalTeachers || 0} color="green" />
                <StatCard icon="👨‍👩‍👧‍👦" label="Total Parents" value={analytics.totalParents || 0} color="purple" />
                <StatCard icon="📅" label="Active Subs" value={analytics.activeSubscriptions || 0} color="pink" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Recent Activity / Growth */}
                <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">📈 Growth & Activity</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-white/70">Today's Signups</span>
                            <span className="text-white font-bold text-xl">{analytics.todaySignups || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-white/70">Today's Revenue</span>
                            <span className="text-green-400 font-bold text-xl">₹{analytics.todayPayments || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                            <span className="text-white/70">Monthly Revenue</span>
                            <span className="text-purple-400 font-bold text-xl">₹{analytics.monthlyRevenue || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-4">📚 Content Stats</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-white/60">Total Classes</span>
                            <span className="text-white font-bold">{analytics.totalClasses || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/60">Total Homework</span>
                            <span className="text-white font-bold">{analytics.totalHomework || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/60">Total Notices</span>
                            <span className="text-white font-bold">{analytics.totalNotices || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Graphs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Graph */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">💰 Revenue Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphs?.revenue || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#ffffff60" />
                                <YAxis stroke="#ffffff60" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                                <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* New Schools Graph */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">🏫 New Schools</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={graphs?.newSchools || []}>
                                <XAxis dataKey="name" stroke="#ffffff60" />
                                <YAxis stroke="#ffffff60" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                                <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Active Users Graph */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">👥 Active Users Growth</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphs?.activeUsers || []}>
                                <XAxis dataKey="name" stroke="#ffffff60" />
                                <YAxis stroke="#ffffff60" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                                <Line type="monotone" dataKey="value" stroke="#ffc658" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Plan Sales Graph */}
                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">💎 Plan Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={graphs?.planSales || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {(graphs?.planSales || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Schools Tab with Control Actions
const SchoolsTab = ({ schools, onViewDetails, onSchoolControl, onResetPassword, onToggleBlock }) => (
    <div>
        <h2 className="text-2xl font-bold text-white mb-6">🏫 Schools Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map(school => (
                <div key={school.id} className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-white">{school.school_name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs ${school.status === 'active'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                            }`}>
                            {school.status?.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-white/60 text-sm mb-4">{school.email}</p>
                    <div className="space-y-2 text-sm mb-4">
                        <div className="flex justify-between">
                            <span className="text-white/60">Plan:</span>
                            <span className="text-white font-medium">{school.plan_type || 'Basic'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/60">Contact:</span>
                            <span className="text-white">{school.contact_person || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Control Actions */}
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => onViewDetails(school.id)}
                                className="flex-1 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition text-sm"
                            >
                                👁️ Details
                            </button>
                            <button
                                onClick={() => onSchoolControl(school.id)}
                                className="flex-1 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition text-sm"
                            >
                                ⚙️ Manage
                            </button>
                        </div>
                        <button
                            onClick={() => onResetPassword(school.id)}
                            className="w-full py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition text-sm"
                        >
                            🔑 Reset Password
                        </button>
                        <button
                            onClick={() => onToggleBlock(school.id, school.status)}
                            className={`w-full py-2 rounded-lg transition text-sm ${school.status === 'suspended'
                                ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                                }`}
                        >
                            {school.status === 'suspended' ? '✅ Unblock School' : '🚫 Block School'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Users Tab with Control Actions
const UsersTab = ({ users, onResetPassword, onDeleteUser }) => (
    <div>
        <h2 className="text-2xl font-bold text-white mb-6">👥 Users Management</h2>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-white/60 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-white">{users.total || 0}</p>
                </div>
                <div>
                    <p className="text-white/60 text-sm">Current Page</p>
                    <p className="text-3xl font-bold text-white">{users.page || 1}/{users.totalPages || 1}</p>
                </div>
            </div>
        </div>

        <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {users.users?.map(user => (
                <div key={user.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'teacher'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : 'bg-purple-500/20 text-purple-300'
                                    }`}>
                                    {user.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'} {user.role.toUpperCase()}
                                </span>
                                <h4 className="text-white font-bold">{user.name || user.phone}</h4>
                            </div>
                            <p className="text-white/60 text-sm mt-1">📞 {user.phone}</p>
                            <p className="text-white/50 text-xs mt-1">
                                🏫 {user.school_name} • 📚 {user.class_name} • {user.school_status === 'active' ? '✅' : '❌'} School Status
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onResetPassword(user.id, user.name || user.phone)}
                                className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded text-sm transition"
                                title="Reset Password"
                            >
                                🔑
                            </button>
                            <button
                                onClick={() => onDeleteUser(user.id, user.name || user.phone)}
                                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded text-sm transition"
                                title="Delete User"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Revenue Tab
const RevenueTab = ({ payments, schools, revenueStats, analytics, onViewSchool }) => {
    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">💰 Revenue & Payments</h2>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/10 rounded-xl p-6">
                    <p className="text-white/70 text-sm font-medium">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-white mt-2">₹{totalRevenue.toLocaleString()}</h3>
                    <p className="text-green-300 text-xs mt-2">Lifetime earnings</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 rounded-xl p-6">
                    <p className="text-white/70 text-sm font-medium">Active Subscriptions</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{analytics.activeSchools || 0}</h3>
                    <p className="text-blue-300 text-xs mt-2">Paying schools</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10 rounded-xl p-6">
                    <p className="text-white/70 text-sm font-medium">Pending Payments</p>
                    <h3 className="text-3xl font-bold text-white mt-2">₹0</h3>
                    <p className="text-purple-300 text-xs mt-2">All clear</p>
                </div>
            </div>

            {/* Recent Payments */}
            <div className="bg-white/5 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-bold text-white mb-4">Recent Transactions</h3>
                {payments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-white">
                            <thead className="bg-white/10 text-xs uppercase">
                                <tr>
                                    <th className="p-3 text-left">School</th>
                                    <th className="p-3 text-left">Date</th>
                                    <th className="p-3 text-left">Amount</th>
                                    <th className="p-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {payments.map((payment, index) => (
                                    <tr key={index} className="hover:bg-white/5">
                                        <td className="p-3">{payment.school_name}</td>
                                        <td className="p-3">{new Date(payment.payment_date).toLocaleDateString()}</td>
                                        <td className="p-3 font-bold">₹{payment.amount}</td>
                                        <td className="p-3 text-center">
                                            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">
                                                Completed
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-white/50 text-center py-4">No payment history found</p>
                )}
            </div>

            {/* School Subscription Status */}
            <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">School Subscriptions & Credentials</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-white">
                        <thead className="bg-white/10 text-xs uppercase">
                            <tr>
                                <th className="p-3 text-left">School Name</th>
                                <th className="p-3 text-left">Plan</th>
                                <th className="p-3 text-left">Expiry</th>
                                <th className="p-3 text-center">Credentials</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {schools.map(school => (
                                <tr key={school.id} className="hover:bg-white/5">
                                    <td className="p-3">
                                        <p className="font-medium">{school.school_name}</p>
                                        <p className="text-xs text-white/50">{school.email}</p>
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 rounded text-xs ${school.plan_type === 'premium' ? 'bg-purple-500/20 text-purple-300' :
                                            school.plan_type === 'standard' ? 'bg-blue-500/20 text-blue-300' :
                                                'bg-gray-500/20 text-gray-300'
                                            }`}>
                                            {school.plan_type || 'Basic'}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        {school.plan_expiry_date
                                            ? new Date(school.plan_expiry_date).toLocaleDateString()
                                            : 'Never'}
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => onViewSchool(school)}
                                            className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded text-xs transition"
                                        >
                                            👁️ View Details
                                        </button>
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

// School Credentials Modal
const SchoolCredentialsModal = ({ school, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-bold text-white">🔐 School Credentials</h3>
                <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
            </div>

            <div className="bg-white/5 rounded-xl p-6 space-y-4">
                <div>
                    <label className="block text-white/50 text-xs uppercase mb-1">School Name</label>
                    <p className="text-white font-bold text-lg">{school.school_name}</p>
                </div>
                <div>
                    <label className="block text-white/50 text-xs uppercase mb-1">Login Email</label>
                    <div className="flex items-center gap-2 bg-black/30 p-2 rounded">
                        <code className="text-blue-300 flex-1">{school.email}</code>
                        <button
                            onClick={() => navigator.clipboard.writeText(school.email)}
                            className="text-white/50 hover:text-white"
                            title="Copy Email"
                        >
                            📋
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-white/50 text-xs uppercase mb-1">Password</label>
                    <div className="bg-black/30 p-2 rounded border border-yellow-500/30">
                        <p className="text-yellow-500/80 text-sm italic">
                            ⚠️ Password is hidden for security.
                            <br />You can reset it if needed.
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <p className="text-white/50 text-xs mb-2">Subscription Details:</p>
                    <div className="flex justify-between text-sm">
                        <span className="text-white/70">Plan:</span>
                        <span className="text-white font-medium capitalize">{school.plan_type || 'Basic'}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-white/70">Expires:</span>
                        <span className="text-white font-medium">
                            {school.plan_expiry_date
                                ? new Date(school.plan_expiry_date).toLocaleDateString()
                                : 'Never'}
                        </span>
                    </div>
                </div>
            </div>

            <button
                onClick={onClose}
                className="w-full mt-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            >
                Close
            </button>
        </div>
    </div>
);

// Control Center Tab
const ControlCenterTab = ({ schools, onAction }) => (
    <div>
        <h2 className="text-2xl font-bold text-white mb-6">⚙️ Control Center</h2>
        <p className="text-white/70 mb-6">Quick access to all schools with comprehensive control options</p>

        <div className="overflow-x-auto">
            <table className="w-full text-white">
                <thead className="bg-white/10 text-xs uppercase">
                    <tr>
                        <th className="p-4 text-left">School</th>
                        <th className="p-4 text-left">Email</th>
                        <th className="p-4 text-center">Plan</th>
                        <th className="p-4 text-center">Status</th>
                        <th className="p-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {schools.map(school => (
                        <tr key={school.id} className="hover:bg-white/5 transition">
                            <td className="p-4">
                                <p className="font-medium text-white">{school.school_name}</p>
                                <p className="text-xs text-white/50">ID: {school.id}</p>
                            </td>
                            <td className="p-4 text-white/70">{school.email}</td>
                            <td className="p-4 text-center">
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">
                                    {school.plan_type || 'Basic'}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded text-xs ${school.status === 'active'
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-red-500/20 text-red-300'
                                    }`}>
                                    {school.status?.toUpperCase()}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                <button
                                    onClick={() => onAction(school)}
                                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-sm transition"
                                >
                                    Manage
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

// School Control Modal
const SchoolControlModal = ({ school, onClose, onResetPassword, onToggleBlock, onUpdatePlan }) => {
    const [planData, setPlanData] = useState({
        plan_type: school.plan_type || 'basic',
        max_students: school.max_students || 50,
        plan_expiry_date: school.plan_expiry_date || ''
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/20 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white">🎛️ School Control Panel</h3>
                        <p className="text-white/60 mt-1">{school.school_name}</p>
                    </div>
                    <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">✕</button>
                </div>

                {/* School Info */}
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                    <h4 className="text-white font-bold mb-3">📋 School Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-white/60">School ID</p>
                            <p className="text-white font-medium">{school.id}</p>
                        </div>
                        <div>
                            <p className="text-white/60">Email</p>
                            <p className="text-white font-medium">{school.email}</p>
                        </div>
                        <div>
                            <p className="text-white/60">Contact Person</p>
                            <p className="text-white font-medium">{school.contact_person || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-white/60">Phone</p>
                            <p className="text-white font-medium">{school.contact_phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-white/60">Status</p>
                            <span className={`px-2 py-1 rounded text-xs ${school.status === 'active'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-red-500/20 text-red-300'
                                }`}>
                                {school.status?.toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-white/60">Created</p>
                            <p className="text-white font-medium">{new Date(school.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-white/60">Teachers</p>
                            <p className="text-white font-bold text-xl">{school.teacher_count || 0}</p>
                        </div>
                        <div>
                            <p className="text-white/60">Students</p>
                            <p className="text-white font-bold text-xl">{school.student_count || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Plan Management */}
                <div className="bg-white/5 rounded-xl p-4 mb-6">
                    <h4 className="text-white font-bold mb-3">💎 Plan Management</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-white/70 text-sm mb-1">Plan Type</label>
                            <select
                                value={planData.plan_type}
                                onChange={(e) => setPlanData({ ...planData, plan_type: e.target.value })}
                                className="w-full p-2 bg-gray-700 text-white rounded"
                            >
                                <option value="basic">Basic</option>
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-1">Max Students</label>
                            <input
                                type="number"
                                value={planData.max_students}
                                onChange={(e) => setPlanData({ ...planData, max_students: e.target.value })}
                                className="w-full p-2 bg-gray-700 text-white rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-white/70 text-sm mb-1">Expiry Date</label>
                            <input
                                type="date"
                                value={planData.plan_expiry_date?.split('T')[0] || ''}
                                onChange={(e) => setPlanData({ ...planData, plan_expiry_date: e.target.value })}
                                className="w-full p-2 bg-gray-700 text-white rounded"
                            />
                        </div>
                        <button
                            onClick={() => onUpdatePlan(school.id, planData)}
                            className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                        >
                            💾 Update Plan
                        </button>
                    </div>
                </div>

                {/* Control Actions */}
                <div className="space-y-3">
                    <button
                        onClick={() => {
                            onResetPassword(school.id);
                            onClose();
                        }}
                        className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-lg transition font-semibold"
                    >
                        🔑 Reset School Password
                    </button>
                    <button
                        onClick={() => {
                            onToggleBlock(school.id, school.status);
                            onClose();
                        }}
                        className={`w-full py-3 rounded-lg transition font-semibold ${school.status === 'suspended'
                            ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                            : 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                            }`}
                    >
                        {school.status === 'suspended' ? '✅ Unblock School' : '🚫 Block School'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// School Detail Modal (Full Drill-Down)
const SchoolDetailModal = ({ school, onClose }) => {
    const [activeTab, setActiveTab] = useState('classes');

    if (!school) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-white/20 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            🏫 {school.school_name}
                        </h2>
                        <p className="text-white/60 text-sm">{school.email} • {school.address || 'No Address'}</p>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white text-2xl">×</button>
                </div>

                <div className="flex border-b border-white/10 bg-white/5 overflow-x-auto">
                    {['classes', 'students', 'teachers', 'homework', 'notices', 'payments'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition whitespace-nowrap ${activeTab === tab ? 'bg-purple-500/20 text-purple-300 border-b-2 border-purple-500' : 'text-white/60 hover:bg-white/10'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {activeTab === 'classes' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {school.classes?.map(c => (
                                <div key={c.id} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:bg-white/10 transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-white">{c.class_name}</h3>
                                        <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/60">ID: {c.id}</span>
                                    </div>
                                    <p className="text-white/50 text-sm font-mono bg-black/30 p-2 rounded">🔑 {c.class_password}</p>
                                </div>
                            ))}
                            {(!school.classes || school.classes.length === 0) && <p className="text-white/50 text-center py-8">No classes found.</p>}
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-white text-left">
                                <thead className="bg-white/10 text-xs uppercase sticky top-0">
                                    <tr>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Class</th>
                                        <th className="p-3">Phone</th>
                                        <th className="p-3">Address</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {school.students?.map(s => (
                                        <tr key={s.id} className="hover:bg-white/5">
                                            <td className="p-3 font-medium">{s.name}</td>
                                            <td className="p-3"><span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">{s.class_name}</span></td>
                                            <td className="p-3 text-white/70">{s.phone}</td>
                                            <td className="p-3 text-white/50 text-sm">{s.address || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!school.students || school.students.length === 0) && <p className="text-white/50 text-center py-8">No students found.</p>}
                        </div>
                    )}

                    {activeTab === 'teachers' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {school.teachers?.map(t => (
                                <div key={t.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center border border-white/10">
                                    <div>
                                        <p className="text-white font-bold">{t.name}</p>
                                        <p className="text-white/60 text-sm">{t.phone}</p>
                                    </div>
                                    <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">{t.class_name}</span>
                                </div>
                            ))}
                            {(!school.teachers || school.teachers.length === 0) && <p className="text-white/50 text-center py-8 w-full col-span-2">No teachers found.</p>}
                        </div>
                    )}

                    {activeTab === 'homework' && (
                        <div className="space-y-2">
                            {school.homework?.map(h => (
                                <div key={h.id} className="bg-white/5 p-4 rounded border border-white/10 flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-medium">{h.title}</p>
                                        <p className="text-white/50 text-xs mt-1">{new Date(h.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-white/50 text-sm bg-white/5 px-2 py-1 rounded">{h.class_name}</span>
                                </div>
                            ))}
                            {(!school.homework || school.homework.length === 0) && <p className="text-white/50 text-center py-8">No homework found.</p>}
                        </div>
                    )}

                    {activeTab === 'notices' && (
                        <div className="space-y-2">
                            {school.notices?.map(n => (
                                <div key={n.id} className="bg-white/5 p-4 rounded border border-white/10">
                                    <p className="text-white">{n.notice_text}</p>
                                    <div className="flex justify-between mt-2 text-xs text-white/50">
                                        <span>{new Date(n.created_at).toLocaleDateString()}</span>
                                        <span>Expires: {n.expiry_date || 'Never'}</span>
                                    </div>
                                </div>
                            ))}
                            {(!school.notices || school.notices.length === 0) && <p className="text-white/50 text-center py-8">No notices found.</p>}
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-white text-left">
                                <thead className="bg-white/10 text-xs uppercase">
                                    <tr>
                                        <th className="p-3">Date</th>
                                        <th className="p-3">Amount</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Transaction ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {school.payments?.map(p => (
                                        <tr key={p.id} className="hover:bg-white/5">
                                            <td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td>
                                            <td className="p-3 font-bold text-green-400">₹{p.amount}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${p.status === 'verified' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                                                    }`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono text-xs text-white/50">{p.transaction_id || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!school.payments || school.payments.length === 0) && <p className="text-white/50 text-center py-8">No payments found.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Activity Logs Tab
const ActivityLogsTab = ({ logs }) => (
    <div>
        <h2 className="text-2xl font-bold text-white mb-6">📜 Activity Logs</h2>
        <div className="bg-white/5 rounded-xl p-6">
            <div className="overflow-x-auto">
                <table className="w-full text-white">
                    <thead className="bg-white/10 text-xs uppercase">
                        <tr>
                            <th className="p-3 text-left">Time</th>
                            <th className="p-3 text-left">Action</th>
                            <th className="p-3 text-left">Actor</th>
                            <th className="p-3 text-left">Description</th>
                            <th className="p-3 text-left">IP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-white/5">
                                <td className="p-3 text-sm text-white/60">
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${log.action_type === 'DELETE' ? 'bg-red-500/20 text-red-300' :
                                        log.action_type === 'CREATE' ? 'bg-green-500/20 text-green-300' :
                                            log.action_type === 'UPDATE' ? 'bg-blue-500/20 text-blue-300' :
                                                'bg-gray-500/20 text-gray-300'
                                        }`}>
                                        {log.action_type}
                                    </span>
                                </td>
                                <td className="p-3 text-sm">{log.actor_type}</td>
                                <td className="p-3 text-sm">{log.description}</td>
                                <td className="p-3 text-sm font-mono text-white/50">{log.ip_address}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-white/50">
                                    No activity logs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

// Support Tickets Tab
const SupportTicketsTab = ({ tickets }) => (
    <div>
        <h2 className="text-2xl font-bold text-white mb-6">🎫 Support Tickets</h2>
        <div className="grid gap-4">
            {tickets.map(ticket => (
                <div key={ticket.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white">{ticket.subject}</h3>
                            <p className="text-white/60 text-sm">
                                From: <span className="text-white">{ticket.school_name}</span> ({ticket.email})
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs ${ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'
                            }`}>
                            {ticket.status.toUpperCase()}
                        </span>
                    </div>
                    <div className="bg-black/20 p-4 rounded-lg mb-4">
                        <p className="text-white/80">{ticket.message}</p>
                    </div>
                    {ticket.admin_response && (
                        <div className="bg-blue-500/10 p-4 rounded-lg mb-4 border-l-2 border-blue-500">
                            <p className="text-xs text-blue-300 mb-1">Admin Response:</p>
                            <p className="text-white/80">{ticket.admin_response}</p>
                        </div>
                    )}
                    {ticket.status === 'open' && (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Type your reply..."
                                className="flex-1 bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition">
                                Reply
                            </button>
                        </div>
                    )}
                </div>
            ))}
            {tickets.length === 0 && (
                <div className="p-12 text-center bg-white/5 rounded-xl text-white/50">
                    No support tickets found.
                </div>
            )}
        </div>
    </div>
);

// Settings Tab
const SettingsTab = ({ onDownloadBackup }) => (
    <div>
        <h2 className="text-2xl font-bold text-white mb-6">⚙️ Settings & Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Backup */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">💾 System Backup</h3>
                <p className="text-white/60 text-sm mb-6">
                    Download a complete backup of the entire platform database (schools, users, payments, etc.).
                    Keep this file safe!
                </p>
                <button
                    onClick={onDownloadBackup}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition flex items-center justify-center gap-2"
                >
                    <span>📥</span> Download Full Database Backup
                </button>
            </div>

            {/* Admin Profile */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">🔒 Admin Security</h3>
                <p className="text-white/60 text-sm mb-6">
                    Update your Super Admin password.
                </p>
                <form className="space-y-4">
                    <div>
                        <label className="block text-white/50 text-xs uppercase mb-1">Current Password</label>
                        <input type="password" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white" placeholder="Enter current password" />
                    </div>
                    <div>
                        <label className="block text-white/50 text-xs uppercase mb-1">New Password</label>
                        <input type="password" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white" placeholder="Enter new password" />
                    </div>
                    <button type="button" className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    </div>
);

export default SuperAdminDashboard;
