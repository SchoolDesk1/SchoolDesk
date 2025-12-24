import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/ui/Card';
import TimetableTab from './TimetableTab';
import VehicleTab from './VehicleTab';
import PerformanceTab from './PerformanceTab';
import EventsTab from './EventsTab';

const ParentDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('homework');
    const [homeworkList, setHomeworkList] = useState([]);
    const [noticeList, setNoticeList] = useState([]);
    const [feeList, setFeeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Use relative path since backend serves frontend
    const API_URL = '/api';

    useEffect(() => {
        if (activeTab === 'homework') fetchHomework();
        else if (activeTab === 'notices') fetchNotices();
        else if (activeTab === 'fees') fetchFees();
    }, [activeTab]);

    const fetchHomework = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/parent/homework`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHomeworkList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setHomeworkList([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/parent/notices`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNoticeList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setNoticeList([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFees = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/parent/fees`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFeeList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setFeeList([]);
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: 'homework', label: 'Homework', icon: '📚' },
        { id: 'notices', label: 'Notices', icon: '📢' },
        { id: 'fees', label: 'Fees', icon: '💰' },
        { id: 'timetable', label: 'Timetable', icon: '📅' },
        { id: 'vehicle', label: 'Vehicle', icon: '🚌' },
        { id: 'performance', label: 'Performance', icon: '📊' },
        { id: 'events', label: 'Events', icon: '📅' },
        { id: 'logout', label: 'Logout', icon: '🚪', action: () => { logout(); navigate('/login'); } }
    ];

    return (
        <DashboardLayout
            menuItems={menuItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            role="Parent Portal"
            userProfile={{ name: user?.name || 'Student', detail: `Phone: ${user?.phone || 'N/A'}` }}
        >
            {loading && (
                <div className="flex justify-center items-center py-20 animate-fade-in">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            )}

            {!loading && activeTab === 'homework' && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-surface-900">Homework Assignments</h2>
                        <p className="text-surface-500 mt-1">Track and submit homework.</p>
                    </div>

                    <Card>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-surface-100 bg-surface-50/50">
                                        <th className="p-4 font-semibold text-surface-600 text-sm">Subject/Title</th>
                                        <th className="p-4 font-semibold text-surface-600 text-sm hidden sm:table-cell">Description</th>
                                        <th className="p-4 font-semibold text-surface-600 text-sm">File</th>
                                        <th className="p-4 font-semibold text-surface-600 text-sm">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {homeworkList.map((hw) => (
                                        <tr key={hw.id} className="hover:bg-surface-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-bold text-surface-900">{hw.title}</div>
                                                <div className="text-sm text-surface-500 sm:hidden mt-1 line-clamp-2">{hw.description}</div>
                                            </td>
                                            <td className="p-4 hidden sm:table-cell text-surface-600 max-w-xs truncate">{hw.description}</td>
                                            <td className="p-4">
                                                {hw.file_url ? (
                                                    <a href={hw.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-full text-sm font-medium transition-colors">
                                                        <span>📄</span> View
                                                    </a>
                                                ) : <span className="text-surface-400 text-sm">-</span>}
                                            </td>
                                            <td className="p-4 text-sm text-surface-600 whitespace-nowrap">{new Date(hw.created_at).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                    {homeworkList.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-12 text-center">
                                                <div className="text-5xl mb-3 opacity-20">📚</div>
                                                <p className="text-surface-500 font-medium">No homework assigned yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {!loading && activeTab === 'notices' && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h2 className="text-3xl font-display font-bold text-surface-900">School Notices</h2>
                        <p className="text-surface-500 mt-1">Important announcements.</p>
                    </div>

                    <div className="grid gap-4">
                        {noticeList.map((notice) => (
                            <div key={notice.id} className="card hover:border-primary-200 transition-all duration-300">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 bg-primary-50 rounded-full p-3 text-primary-600">
                                        <span className="text-xl">📢</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-surface-800 text-lg whitespace-pre-wrap leading-relaxed">{notice.notice_text}</p>
                                        <p className="text-xs text-surface-400 mt-3 font-medium flex items-center gap-1">
                                            <span>🕒</span> Posted: {new Date(notice.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {noticeList.length === 0 && (
                            <div className="text-center py-20 bg-surface-50 rounded-xl border border-dashed border-surface-200">
                                <div className="text-5xl mb-4 opacity-20">📭</div>
                                <p className="text-surface-500 text-lg font-medium">No notices from school.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!loading && activeTab === 'fees' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-surface-900">Fee Status</h2>
                            <p className="text-surface-500 mt-1">Track fee payments by year.</p>
                        </div>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="input-field py-2 font-bold w-full sm:w-auto"
                        >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                            <option value={2027}>2027</option>
                        </select>
                    </div>

                    <Card>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {months.map((month) => {
                                // Find fee record for this specific month and year
                                const feeRecord = feeList.find(f => f.month === month && (f.year === selectedYear || (!f.year && selectedYear === 2025)));
                                const isPaid = feeRecord?.status === 'PAID';

                                return (
                                    <div key={month} className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${isPaid ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100 shadow-sm' : 'bg-white border-surface-100 hover:border-surface-200'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-lg text-surface-700">{month}</span>
                                            {isPaid ? (
                                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                    ✓ PAID
                                                </span>
                                            ) : (
                                                <span className="bg-surface-100 text-surface-500 text-xs font-bold px-2 py-1 rounded-full">
                                                    UNPAID
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm text-surface-500">
                                                Amount: <span className={`font-semibold ${isPaid ? 'text-emerald-700' : 'text-surface-900'}`}>{feeRecord?.amount ? `₹${feeRecord.amount}` : '-'}</span>
                                            </div>
                                            {isPaid && feeRecord.created_at && (
                                                <div className="text-xs text-emerald-600 flex items-center gap-1">
                                                    📅 {new Date(feeRecord.created_at).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>

                                        {isPaid && (
                                            <div className="absolute bottom-2 right-2 opacity-10">
                                                <span className="text-3xl">💰</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            )}

            {/* Other Tabs */}
            {activeTab === 'timetable' && <TimetableTab token={token} classId={user?.class_id} />}
            {activeTab === 'vehicle' && <VehicleTab token={token} />}
            {activeTab === 'performance' && <PerformanceTab token={token} userId={user?.id} />}
            {activeTab === 'events' && <EventsTab token={token} />}

        </DashboardLayout>
    );
};

export default ParentDashboard;
