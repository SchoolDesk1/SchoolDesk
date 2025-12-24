import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
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
    const [showModal, setShowModal] = useState(null);
    const { token, user } = useAuth(); // Removed logout as it's passed to Layout

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

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'schools', label: 'Institutes', icon: '🏫' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'revenue', label: 'Revenue', icon: '💰' },
        { id: 'partners', label: 'Partners', icon: '🤝' },
        { id: 'promocodes', label: 'Promo Codes', icon: '🏷️' },
        { id: 'payouts', label: 'Payouts', icon: '💸' },
        { id: 'logs', label: 'Logs', icon: '📜' },
        { id: 'tickets', label: 'Support', icon: '🎫' },
        { id: 'control', label: 'Control Center', icon: '⚙️' },
        { id: 'settings', label: 'Settings', icon: '🔧' },
    ];

    return (
        <DashboardLayout
            menuItems={menuItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            role="Super Admin"
            userProfile={{ name: user?.name || 'Admin', detail: 'System Administrator' }}
        >
            {/* Global Search Bar (Optional to keep here or move to Header logic inside Layout if refactored, but keeping floating for now) */}
            <div className="mb-6 relative z-30">
                <input
                    type="text"
                    placeholder="🔍 Search institutes, users, payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-surface-200 rounded-xl py-3 px-4 text-surface-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {searchResults && searchQuery.length >= 2 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-surface-100 rounded-xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                        {searchResults.schools.length > 0 && (
                            <div className="p-2">
                                <p className="text-xs text-surface-400 uppercase px-2 mb-1">Institutes</p>
                                {searchResults.schools.map(s => (
                                    <div key={s.id} onClick={() => { fetchSchoolFullDetails(s.id); setSearchQuery(''); }} className="p-2 hover:bg-surface-50 rounded cursor-pointer text-surface-700">
                                        {s.school_name}
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchResults.users.length > 0 && (
                            <div className="p-2 border-t border-surface-100">
                                <p className="text-xs text-surface-400 uppercase px-2 mb-1">Users</p>
                                {searchResults.users.map(u => (
                                    <div key={u.id} className="p-2 hover:bg-surface-50 rounded cursor-pointer text-surface-700">
                                        {u.name} ({u.role}) - {u.school_name}
                                    </div>
                                ))}
                            </div>
                        )}
                        {searchResults.schools.length === 0 && searchResults.users.length === 0 && (
                            <div className="p-4 text-center text-surface-500">No results found</div>
                        )}
                    </div>
                )}
            </div>

            <div className="animate-fade-in">
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

                {activeTab === 'logs' && (
                    <ActivityLogsTab logs={logs} />
                )}

                {activeTab === 'tickets' && (
                    <SupportTicketsTab tickets={tickets} />
                )}
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
        </DashboardLayout>
    );
};

// Stat Card Component (Refactored to match new design)
const StatCard = ({ icon, label, value, color }) => {
    // Mapping simplified to match standard Card or just clean styling
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        pink: 'bg-pink-50 text-pink-600',
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-surface-100 flex items-center justify-between hover:shadow-md transition-all">
            <div>
                <p className="text-surface-500 text-sm font-medium">{label}</p>
                <h3 className="text-3xl font-display font-bold text-surface-900 mt-2">{value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${colorClasses[color] || 'bg-surface-50 text-surface-600'}`}>
                {icon}
            </div>
        </div>
    );
};

// Overview Tab
const OverviewTab = ({ analytics, schools, onSchoolClick }) => {
    const { graphs } = analytics;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-surface-900">Platform Overview</h2>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon="🏫" label="Total Institutes" value={analytics.totalSchools || 0} color="blue" />
                <StatCard icon="✅" label="Active Institutes" value={analytics.activeSchools || 0} color="green" />
                <StatCard icon="🚫" label="Suspended" value={analytics.suspendedSchools || 0} color="pink" />
                <StatCard icon="💰" label="Total Revenue" value={`₹${analytics.totalRevenue || 0}`} color="purple" />

                <StatCard icon="👨‍🎓" label="Total Students" value={analytics.totalStudents || 0} color="blue" />
                <StatCard icon="👨‍🏫" label="Total Teachers" value={analytics.totalTeachers || 0} color="green" />
                <StatCard icon="👨‍👩‍👧‍👦" label="Total Parents" value={analytics.totalParents || 0} color="purple" />
                <StatCard icon="📅" label="Active Subs" value={analytics.activeSubscriptions || 0} color="pink" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Recent Activity / Growth */}
                <Card title="Growth & Activity">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg">
                            <span className="text-surface-600">Today's Signups</span>
                            <span className="text-surface-900 font-bold text-xl">{analytics.todaySignups || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                            <span className="text-emerald-700">Today's Revenue</span>
                            <span className="text-emerald-700 font-bold text-xl">₹{analytics.todayPayments || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <span className="text-purple-700">Monthly Revenue</span>
                            <span className="text-purple-700 font-bold text-xl">₹{analytics.monthlyRevenue || 0}</span>
                        </div>
                    </div>
                </Card>

                {/* Quick Stats */}
                <Card title="Content Stats">
                    <div className="space-y-4">
                        <div className="flex justify-between border-b border-surface-100 pb-2">
                            <span className="text-surface-500">Total Classes</span>
                            <span className="text-surface-900 font-bold">{analytics.totalClasses || 0}</span>
                        </div>
                        <div className="flex justify-between border-b border-surface-100 pb-2">
                            <span className="text-surface-500">Total Homework</span>
                            <span className="text-surface-900 font-bold">{analytics.totalHomework || 0}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-surface-500">Total Notices</span>
                            <span className="text-surface-900 font-bold">{analytics.totalNotices || 0}</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Graphs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Revenue Trend">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphs?.revenue || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="New Institutes">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={graphs?.newSchools || []}>
                                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Active Users Growth">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={graphs?.activeUsers || []}>
                                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ stroke: '#f59e0b', strokeWidth: 2, r: 4, fill: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Plan Distribution">
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
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index % 4]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

// Schools Tab with Control Actions
const SchoolsTab = ({ schools, onViewDetails, onSchoolControl, onResetPassword, onToggleBlock }) => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-display font-bold text-surface-900">Institute Management</h2>
            <div className="text-sm text-surface-500">
                Total Institutes: <span className="font-bold text-surface-900">{schools.length}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map(school => (
                <div key={school.id} className="bg-white rounded-xl p-5 border border-surface-200 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{school.school_name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${school.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {school.status?.toUpperCase()}
                        </span>
                    </div>
                    <p className="text-surface-500 text-sm mb-4 truncate">{school.email}</p>
                    <div className="space-y-2 text-sm mb-4 bg-surface-50 p-3 rounded-lg">
                        <div className="flex justify-between">
                            <span className="text-surface-500">Plan:</span>
                            <span className="text-surface-900 font-medium capitalize">{school.plan_type || 'Basic'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-surface-500">Contact:</span>
                            <span className="text-surface-900 truncate ml-2">{school.contact_person || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Control Actions */}
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <button
                                onClick={() => onViewDetails(school.id)}
                                className="flex-1 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg transition text-sm font-medium"
                            >
                                👁️ Details
                            </button>
                            <button
                                onClick={() => onSchoolControl(school.id)}
                                className="flex-1 py-2 bg-surface-100 hover:bg-surface-200 text-surface-600 rounded-lg transition text-sm font-medium"
                            >
                                ⚙️ Manage
                            </button>
                        </div>
                        <button
                            onClick={() => onResetPassword(school.id)}
                            className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition text-sm font-medium"
                        >
                            🔑 Reset Password
                        </button>
                        <button
                            onClick={() => onToggleBlock(school.id, school.status)}
                            className={`w-full py-2 rounded-lg transition text-sm font-medium ${school.status === 'suspended'
                                ? 'bg-green-50 hover:bg-green-100 text-green-600'
                                : 'bg-red-50 hover:bg-red-100 text-red-600'
                                }`}
                        >
                            {school.status === 'suspended' ? '✅ Unblock Institute' : '🚫 Block Institute'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    </div >
);

// Users Tab with Control Actions
const UsersTab = ({ users, onResetPassword, onDeleteUser }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-surface-900">Users Management</h2>

        <div className="bg-white rounded-xl p-6 border border-surface-200 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-surface-500 text-sm font-medium uppercase tracking-wide">Total Users</p>
                    <p className="text-3xl font-bold text-surface-900 mt-1">{users.total || 0}</p>
                </div>
                <div>
                    <p className="text-surface-500 text-sm font-medium uppercase tracking-wide">Current Page</p>
                    <p className="text-3xl font-bold text-surface-900 mt-1">{users.page || 1} <span className="text-surface-400 text-xl font-normal">/ {users.totalPages || 1}</span></p>
                </div>
            </div>
        </div>

        <Card title="All Users" className="overflow-hidden">
            <div className="space-y-0 divide-y divide-surface-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                {users.users?.map(user => (
                    <div key={user.id} className="p-4 hover:bg-surface-50 transition flex justify-between items-start group">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${user.role === 'teacher'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-indigo-100 text-indigo-700'
                                    }`}>
                                    {user.role === 'teacher' ? 'Teacher' : 'Student'}
                                </span>
                                <h4 className="text-surface-900 font-bold">{user.name || user.phone}</h4>
                            </div>
                            <p className="text-surface-500 text-sm mt-1">📞 {user.phone}</p>
                            <p className="text-surface-400 text-xs mt-1">
                                🏫 {user.school_name} • 📚 {user.class_name} • <span className={user.school_status === 'active' ? 'text-green-600' : 'text-red-600'}>{user.school_status === 'active' ? 'Active' : 'Inactive'} Institute</span>
                            </p>
                        </div>

                        <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onResetPassword(user.id, user.name || user.phone)}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-sm transition font-medium border border-amber-200"
                                title="Reset Password"
                            >
                                🔑 Reset
                            </button>
                            <button
                                onClick={() => onDeleteUser(user.id, user.name || user.phone)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition font-medium border border-red-200"
                                title="Delete User"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    </div>
);

// Revenue Tab
const RevenueTab = ({ payments, schools, revenueStats, analytics, onViewSchool }) => {
    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold text-surface-900">Revenue & Payments</h2>

            {/* Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-6 shadow-sm">
                    <p className="text-emerald-700 text-sm font-medium uppercase tracking-wide">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-surface-900 mt-2">₹{totalRevenue.toLocaleString()}</h3>
                    <p className="text-emerald-600 text-xs mt-2 font-medium">Lifetime earnings</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 shadow-sm">
                    <p className="text-blue-700 text-sm font-medium uppercase tracking-wide">Active Subscriptions</p>
                    <h3 className="text-3xl font-bold text-surface-900 mt-2">{analytics.activeSchools || 0}</h3>
                    <p className="text-blue-600 text-xs mt-2 font-medium">Paying institutes</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 rounded-xl p-6 shadow-sm">
                    <p className="text-purple-700 text-sm font-medium uppercase tracking-wide">Pending Payments</p>
                    <h3 className="text-3xl font-bold text-surface-900 mt-2">₹0</h3>
                    <p className="text-purple-600 text-xs mt-2 font-medium">All clear</p>
                </div>
            </div>

            {/* Recent Payments */}
            <Card title="Recent Transactions" className="overflow-hidden">
                {payments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-surface-900">
                            <thead className="bg-surface-50 text-xs uppercase text-surface-500 font-semibold border-b border-surface-200">
                                <tr>
                                    <th className="p-4 text-left">Institute</th>
                                    <th className="p-4 text-left">Date</th>
                                    <th className="p-4 text-left">Amount</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                {payments.map((payment, index) => (
                                    <tr key={index} className="hover:bg-surface-50 transition-colors">
                                        <td className="p-4 font-medium">{payment.school_name}</td>
                                        <td className="p-4 text-surface-600">{new Date(payment.payment_date).toLocaleDateString()}</td>
                                        <td className="p-4 font-bold text-emerald-600">₹{payment.amount}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                                Completed
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-surface-500 text-center py-8 italic">No payment history found</p>
                )}
            </Card>

            {/* School Subscription Status */}
            <Card title="Institute Subscriptions & Credentials" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-surface-900">
                        <thead className="bg-surface-50 text-xs uppercase text-surface-500 font-semibold border-b border-surface-200">
                            <tr>
                                <th className="p-4 text-left">Institute Name</th>
                                <th className="p-4 text-left">Plan</th>
                                <th className="p-4 text-left">Expiry</th>
                                <th className="p-4 text-center">Credentials</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100">
                            {schools.map(school => (
                                <tr key={school.id} className="hover:bg-surface-50 transition-colors">
                                    <td className="p-4">
                                        <p className="font-bold text-surface-900">{school.school_name}</p>
                                        <p className="text-xs text-surface-500">{school.email}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${school.plan_type === 'premium' ? 'bg-purple-100 text-purple-700' :
                                            school.plan_type === 'standard' ? 'bg-blue-100 text-blue-700' :
                                                'bg-surface-100 text-surface-600'
                                            }`}>
                                            {school.plan_type || 'Basic'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-surface-600 font-mono text-sm">
                                        {school.plan_expiry_date
                                            ? new Date(school.plan_expiry_date).toLocaleDateString()
                                            : 'Never'}
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => onViewSchool(school)}
                                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg text-xs transition font-medium border border-amber-200"
                                        >
                                            👁️ View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// School Credentials Modal
const SchoolCredentialsModal = ({ school, onClose }) => {
    if (!school) return null;

    return (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-surface-100 pb-4">
                    <h3 className="text-xl font-bold text-surface-900">Login Credentials</h3>
                    <button onClick={onClose} className="text-surface-400 hover:text-surface-600 transition-colors">
                        ✖️
                    </button>
                </div>
                <div className="space-y-4">
                    <div className="bg-surface-50 p-4 rounded-lg border border-surface-200">
                        <p className="text-xs uppercase text-surface-500 font-bold tracking-wide mb-1">School Name</p>
                        <p className="text-lg font-bold text-surface-900">{school.school_name}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <p className="text-xs uppercase text-blue-600 font-bold tracking-wide mb-1">Admin Email</p>
                        <div className="flex justify-between items-center">
                            <p className="text-lg font-mono text-blue-900">{school.email}</p>
                            <button
                                onClick={() => navigator.clipboard.writeText(school.email)}
                                className="text-blue-600 text-sm hover:underline font-medium"
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                        <p className="text-xs uppercase text-amber-600 font-bold tracking-wide mb-1">Default Password</p>
                        <div className="flex justify-between items-center">
                            <p className="text-lg font-mono text-amber-900">school@123</p>
                            <span className="text-xs text-amber-600 italic">(If not changed by user)</span>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-surface-100">
                        <p className="text-surface-500 text-xs mb-2 font-bold uppercase tracking-wide">Subscription Details:</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-surface-500">Plan:</span>
                            <span className="text-surface-900 font-medium capitalize">{school.plan_type || 'Basic'}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-surface-500">Expires:</span>
                            <span className="text-surface-900 font-medium">
                                {school.plan_expiry_date
                                    ? new Date(school.plan_expiry_date).toLocaleDateString()
                                    : 'Never'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-lg font-bold transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Control Center Tab
const ControlCenterTab = ({ schools, onAction }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-display font-bold text-surface-900">Control Center</h2>
            <p className="text-surface-500 mt-1">Quick access to all schools with comprehensive control options</p>
        </div>

        <Card title="Quick Actions Board" className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-surface-900">
                    <thead className="bg-surface-50 text-xs uppercase text-surface-500 font-semibold border-b border-surface-200">
                        <tr>
                            <th className="p-4 text-left">School</th>
                            <th className="p-4 text-left">Email</th>
                            <th className="p-4 text-center">Plan</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                        {schools.map(school => (
                            <tr key={school.id} className="hover:bg-surface-50 transition-colors">
                                <td className="p-4">
                                    <p className="font-bold text-surface-900">{school.school_name}</p>
                                    <p className="text-xs text-surface-500 font-mono">ID: {school.id}</p>
                                </td>
                                <td className="p-4 text-surface-600 text-sm">{school.email}</td>
                                <td className="p-4 text-center">
                                    <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
                                        {school.plan_type || 'Basic'}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${school.status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {school.status?.toUpperCase()}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => onAction(school)}
                                        className="px-4 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 rounded-lg text-sm transition font-medium border border-primary-200"
                                    >
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);

// School Control Modal
// School Control Modal
const SchoolControlModal = ({ school, onClose, onResetPassword, onToggleBlock, onUpdatePlan }) => {
    const [planData, setPlanData] = useState({
        plan_type: school.plan_type || 'basic',
        max_students: school.max_students || 50,
        plan_expiry_date: school.plan_expiry_date || ''
    });

    return (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-surface-200 rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-start mb-6 border-b border-surface-100 pb-4">
                    <div>
                        <h3 className="text-2xl font-bold text-surface-900">🎛️ School Control Panel</h3>
                        <p className="text-surface-500 mt-1">{school.school_name}</p>
                    </div>
                    <button onClick={onClose} className="text-surface-400 hover:text-surface-600 text-2xl transition-colors">✖️</button>
                </div>

                {/* School Info */}
                <div className="bg-surface-50 rounded-xl p-4 mb-6 border border-surface-100">
                    <h4 className="text-surface-900 font-bold mb-3">📋 School Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-surface-500 text-xs uppercase font-bold tracking-wide">School ID</p>
                            <p className="text-surface-900 font-medium">{school.id}</p>
                        </div>
                        <div>
                            <p className="text-surface-500 text-xs uppercase font-bold tracking-wide">Email</p>
                            <p className="text-surface-900 font-medium">{school.email}</p>
                        </div>
                        <div>
                            <p className="text-surface-500 text-xs uppercase font-bold tracking-wide">Contact Person</p>
                            <p className="text-surface-900 font-medium">{school.contact_person || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-surface-500 text-xs uppercase font-bold tracking-wide">Phone</p>
                            <p className="text-surface-900 font-medium">{school.contact_phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-surface-500 text-xs uppercase font-bold tracking-wide">Status</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide inline-block mt-0.5 ${school.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {school.status?.toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-surface-500 text-xs uppercase font-bold tracking-wide">Created</p>
                            <p className="text-surface-900 font-medium">{new Date(school.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-surface-500 text-xs uppercase font-bold tracking-wide">Teachers</p>
                            <p className="text-surface-900 font-bold text-xl">{school.teacher_count || 0}</p>
                        </div>
                        <div>
                            <p className="text-surface-500 text-xs uppercase font-bold tracking-wide">Students</p>
                            <p className="text-surface-900 font-bold text-xl">{school.student_count || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Plan Management */}
                <div className="bg-white rounded-xl p-4 mb-6 border border-surface-200 shadow-sm">
                    <h4 className="text-surface-900 font-bold mb-3">💎 Plan Management</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-surface-500 text-xs font-bold uppercase tracking-wide mb-1">Plan Type</label>
                            <select
                                value={planData.plan_type}
                                onChange={(e) => setPlanData({ ...planData, plan_type: e.target.value })}
                                className="w-full p-2 bg-surface-50 border border-surface-200 text-surface-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                            >
                                <option value="basic">Basic</option>
                                <option value="standard">Standard</option>
                                <option value="premium">Premium</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-surface-500 text-xs font-bold uppercase tracking-wide mb-1">Max Students</label>
                            <input
                                type="number"
                                value={planData.max_students}
                                onChange={(e) => setPlanData({ ...planData, max_students: e.target.value })}
                                className="w-full p-2 bg-surface-50 border border-surface-200 text-surface-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-surface-500 text-xs font-bold uppercase tracking-wide mb-1">Expiry Date</label>
                            <input
                                type="date"
                                value={planData.plan_expiry_date?.split('T')[0] || ''}
                                onChange={(e) => setPlanData({ ...planData, plan_expiry_date: e.target.value })}
                                className="w-full p-2 bg-surface-50 border border-surface-200 text-surface-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                            />
                        </div>
                        <button
                            onClick={() => onUpdatePlan(school.id, planData)}
                            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-bold shadow-lg shadow-primary-900/10"
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
                        className="w-full py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition font-bold border border-amber-200"
                    >
                        🔑 Reset School Password
                    </button>
                    <button
                        onClick={() => {
                            onToggleBlock(school.id, school.status);
                            onClose();
                        }}
                        className={`w-full py-3 rounded-lg transition font-bold ${school.status === 'suspended'
                            ? 'bg-green-50 hover:bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
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
// School Detail Modal (Full Drill-Down)
const SchoolDetailModal = ({ school, onClose }) => {
    const [activeTab, setActiveTab] = useState('classes');

    if (!school) return null;

    return (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-surface-200 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-surface-100 flex justify-between items-center bg-surface-50">
                    <div>
                        <h2 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
                            🏫 {school.school_name}
                        </h2>
                        <p className="text-surface-500 text-sm">{school.email} • {school.address || 'No Address'}</p>
                    </div>
                    <button onClick={onClose} className="text-surface-400 hover:text-surface-600 text-2xl transition-colors">×</button>
                </div>

                <div className="flex border-b border-surface-200 bg-white overflow-x-auto">
                    {['classes', 'students', 'teachers', 'homework', 'notices', 'payments'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition whitespace-nowrap border-b-2 ${activeTab === tab
                                ? 'border-primary-600 text-primary-700 bg-primary-50'
                                : 'border-transparent text-surface-500 hover:text-surface-700 hover:bg-surface-50'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-surface-50/50">
                    {activeTab === 'classes' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {school.classes?.map(c => (
                                <div key={c.id} className="bg-white p-5 rounded-xl border border-surface-200 hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-bold text-surface-900 group-hover:text-primary-600 transition-colors">{c.class_name}</h3>
                                        <span className="text-xs bg-surface-100 text-surface-600 px-2 py-1 rounded-full font-medium">ID: {c.id}</span>
                                    </div>
                                    <p className="text-surface-600 text-sm bg-surface-50 p-2 rounded-lg border border-surface-100 font-mono flex items-center gap-2">
                                        <span>🔑</span> {c.class_password}
                                    </p>
                                </div>
                            ))}
                            {(!school.classes || school.classes.length === 0) && (
                                <p className="col-span-3 text-surface-500 text-center py-12 italic border-2 border-dashed border-surface-200 rounded-xl">No classes found.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'students' && (
                        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-surface-900 text-left">
                                    <thead className="bg-surface-50 text-xs uppercase text-surface-500 font-semibold border-b border-surface-200 sticky top-0">
                                        <tr>
                                            <th className="p-4">Name</th>
                                            <th className="p-4">Class</th>
                                            <th className="p-4">Phone</th>
                                            <th className="p-4">Address</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-100">
                                        {school.students?.map(s => (
                                            <tr key={s.id} className="hover:bg-surface-50 transition-colors">
                                                <td className="p-4 font-medium text-surface-900">{s.name}</td>
                                                <td className="p-4"><span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">{s.class_name}</span></td>
                                                <td className="p-4 text-surface-600 font-mono text-sm">{s.phone}</td>
                                                <td className="p-4 text-surface-500 text-sm max-w-xs truncate">{s.address || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {(!school.students || school.students.length === 0) && <p className="text-surface-500 text-center py-12 italic">No students found.</p>}
                        </div>
                    )}

                    {activeTab === 'teachers' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {school.teachers?.map(t => (
                                <div key={t.id} className="bg-white p-4 rounded-xl flex justify-between items-center border border-surface-200 shadow-sm hover:shadow-md transition-all">
                                    <div>
                                        <p className="text-surface-900 font-bold">{t.name}</p>
                                        <p className="text-surface-500 text-sm font-mono mt-0.5">{t.phone}</p>
                                    </div>
                                    <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">{t.class_name}</span>
                                </div>
                            ))}
                            {(!school.teachers || school.teachers.length === 0) && (
                                <p className="col-span-2 text-surface-500 text-center py-12 italic border-2 border-dashed border-surface-200 rounded-xl">No teachers found.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'homework' && (
                        <div className="space-y-4">
                            {school.homework?.map(h => (
                                <div key={h.id} className="bg-white p-5 rounded-xl border border-surface-200 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                                    <div>
                                        <p className="text-surface-900 font-medium text-lg">{h.title}</p>
                                        <p className="text-surface-500 text-xs mt-1 font-medium">{new Date(h.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className="text-surface-600 text-sm bg-surface-100 px-3 py-1 rounded-lg font-medium">{h.class_name}</span>
                                </div>
                            ))}
                            {(!school.homework || school.homework.length === 0) && (
                                <p className="text-surface-500 text-center py-12 italic border-2 border-dashed border-surface-200 rounded-xl">No homework found.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'notices' && (
                        <div className="space-y-4">
                            {school.notices?.map(n => (
                                <div key={n.id} className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm">
                                    <p className="text-surface-800 leading-relaxed">{n.notice_text}</p>
                                    <div className="flex justify-between mt-3 text-xs text-surface-500 font-medium uppercase tracking-wide border-t border-surface-100 pt-3">
                                        <span>Posted: {new Date(n.created_at).toLocaleDateString()}</span>
                                        <span>Expires: {n.expiry_date || 'Never'}</span>
                                    </div>
                                </div>
                            ))}
                            {(!school.notices || school.notices.length === 0) && (
                                <p className="text-surface-500 text-center py-12 italic border-2 border-dashed border-surface-200 rounded-xl">No notices found.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-surface-900 text-left">
                                    <thead className="bg-surface-50 text-xs uppercase text-surface-500 font-semibold border-b border-surface-200">
                                        <tr>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Amount</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Transaction ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-100">
                                        {school.payments?.map(p => (
                                            <tr key={p.id} className="hover:bg-surface-50 transition-colors">
                                                <td className="p-4 text-surface-600">{new Date(p.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 font-bold text-emerald-600">₹{p.amount}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${p.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {p.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-xs text-surface-500">{p.transaction_id || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {(!school.payments || school.payments.length === 0) && <p className="text-surface-500 text-center py-12 italic">No payments found.</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Activity Logs Tab
const ActivityLogsTab = ({ logs }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-surface-900">Activity Logs</h2>
        <Card title="System Activity" className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-surface-900">
                    <thead className="bg-surface-50 text-xs uppercase text-surface-500 font-semibold border-b border-surface-200">
                        <tr>
                            <th className="p-4 text-left">Time</th>
                            <th className="p-4 text-left">Action</th>
                            <th className="p-4 text-left">Actor</th>
                            <th className="p-4 text-left">Description</th>
                            <th className="p-4 text-left">IP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                        {logs.map(log => (
                            <tr key={log.id} className="hover:bg-surface-50 transition-colors">
                                <td className="p-4 text-sm text-surface-500 font-mono">
                                    {new Date(log.created_at).toLocaleString()}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${log.action_type === 'DELETE' ? 'bg-red-100 text-red-700' :
                                        log.action_type === 'CREATE' ? 'bg-green-100 text-green-700' :
                                            log.action_type === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                                                'bg-surface-100 text-surface-600'
                                        }`}>
                                        {log.action_type}
                                    </span>
                                </td>
                                <td className="p-4 text-sm font-medium">{log.actor_type}</td>
                                <td className="p-4 text-sm text-surface-600">{log.description}</td>
                                <td className="p-4 text-sm font-mono text-surface-400">{log.ip_address}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-surface-500 italic">
                                    No activity logs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    </div>
);

// Support Tickets Tab
const SupportTicketsTab = ({ tickets }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-surface-900">Support Tickets</h2>
        <div className="grid gap-6">
            {tickets.map(ticket => (
                <div key={ticket.id} className="bg-white rounded-xl p-6 border border-surface-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-bold text-surface-900">{ticket.subject}</h3>
                            <p className="text-surface-500 text-sm">
                                From: <span className="font-medium text-surface-700">{ticket.school_name}</span> ({ticket.email})
                            </p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${ticket.status === 'open' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                            }`}>
                            {ticket.status.toUpperCase()}
                        </span>
                    </div>
                    <div className="bg-surface-50 p-4 rounded-lg mb-4 border border-surface-100">
                        <p className="text-surface-700">{ticket.message}</p>
                    </div>
                    {ticket.admin_response && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500 text-sm">
                            <p className="font-bold text-blue-700 mb-1">Admin Response:</p>
                            <p className="text-blue-900">{ticket.admin_response}</p>
                        </div>
                    )}
                    {ticket.status === 'open' && (
                        <div className="flex gap-2 mt-4">
                            <input
                                type="text"
                                placeholder="Type your reply..."
                                className="flex-1 bg-white border border-surface-200 rounded-lg px-4 py-2 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            />
                            <button className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition font-medium shadow-lg shadow-primary-900/10">
                                Reply
                            </button>
                        </div>
                    )}
                </div>
            ))}
            {tickets.length === 0 && (
                <div className="p-12 text-center bg-surface-50 rounded-xl border-2 border-dashed border-surface-200 text-surface-400">
                    No support tickets found.
                </div>
            )}
        </div>
    </div>
);

// Settings Tab
const SettingsTab = ({ onDownloadBackup }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-display font-bold text-surface-900">Settings & Tools</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Backup */}
            <Card title="System Backup">
                <p className="text-surface-500 text-sm mb-6">
                    Download a complete backup of the entire platform database (schools, users, payments, etc.).
                    Keep this file safe!
                </p>
                <button
                    onClick={onDownloadBackup}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/10"
                >
                    <span>📥</span> Download Full Database Backup
                </button>
            </Card>

            {/* Admin Profile */}
            <Card title="Admin Security">
                <p className="text-surface-500 text-sm mb-6">
                    Update your Super Admin password.
                </p>
                <form className="space-y-4">
                    <div>
                        <label className="block text-surface-500 text-xs font-bold uppercase tracking-wide mb-1">Current Password</label>
                        <input type="password" className="w-full bg-surface-50 border border-surface-200 rounded-lg px-4 py-2 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="Enter current password" />
                    </div>
                    <div>
                        <label className="block text-surface-500 text-xs font-bold uppercase tracking-wide mb-1">New Password</label>
                        <input type="password" className="w-full bg-surface-50 border border-surface-200 rounded-lg px-4 py-2 text-surface-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" placeholder="Enter new password" />
                    </div>
                    <button type="button" className="w-full py-3 bg-surface-100 hover:bg-surface-200 text-surface-700 rounded-lg font-bold transition">
                        Update Password
                    </button>
                </form>
            </Card>
        </div>
    </div>
);

export default SuperAdminDashboard;
