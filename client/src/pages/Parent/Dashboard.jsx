import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    const [sidebarOpen, setSidebarOpen] = useState(false);
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

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Header & Hamburger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-4 py-3 flex justify-between items-center">
                <span className="font-bold text-green-600 text-lg">Parent Portal</span>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
                >
                    <span className="text-2xl">☰</span>
                </button>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 border-b bg-gradient-to-r from-green-600 to-green-700 text-white">
                    <h1 className="text-2xl font-bold">Parent Portal</h1>
                    {user?.name && <p className="text-sm font-semibold text-green-100 mt-2">Student: {user.name}</p>}
                    <p className="text-xs text-green-200 mt-1">Phone: {user?.phone}</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <button
                        onClick={() => { setActiveTab('homework'); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'homework' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        📚 Homework
                    </button>
                    <button
                        onClick={() => { setActiveTab('notices'); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'notices' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        📢 Notices
                    </button>
                    <button
                        onClick={() => { setActiveTab('fees'); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'fees' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        💰 Fees
                    </button>
                    <button
                        onClick={() => { setActiveTab('timetable'); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'timetable' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        📅 Timetable
                    </button>
                    <button
                        onClick={() => { setActiveTab('vehicle'); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'vehicle' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        🚌 Vehicle
                    </button>
                    <button
                        onClick={() => { setActiveTab('performance'); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'performance' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        📊 Performance
                    </button>
                    <button
                        onClick={() => { setActiveTab('events'); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'events' ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        📅 Events
                    </button>
                    <button
                        onClick={() => { logout(); navigate('/login'); }}
                        className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg mt-8"
                    >
                        🚪 Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 w-full overflow-hidden">
                <header className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                        {activeTab === 'homework' && 'Homework Assignments'}
                        {activeTab === 'notices' && 'School Notices'}
                        {activeTab === 'fees' && 'Fee Status'}
                    </h2>
                </header>

                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                )}

                {!loading && activeTab === 'homework' && (
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="overflow-x-auto -mx-4 sm:mx-0">
                            <div className="inline-block min-w-full align-middle">
                                <table className="min-w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b bg-gray-50">
                                            <th className="p-4 font-semibold text-gray-600 text-sm">Subject/Title</th>
                                            <th className="p-4 font-semibold text-gray-600 text-sm hidden sm:table-cell">Description</th>
                                            <th className="p-4 font-semibold text-gray-600 text-sm">File</th>
                                            <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {homeworkList.map((hw) => (
                                            <tr key={hw.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-medium text-gray-900">{hw.title}</div>
                                                    <div className="text-sm text-gray-500 sm:hidden mt-1">{hw.description}</div>
                                                </td>
                                                <td className="p-4 hidden sm:table-cell text-gray-600">{hw.description}</td>
                                                <td className="p-4">
                                                    {hw.file_url ? (
                                                        <a href={hw.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-green-600 hover:text-green-800 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                                                            📄 View
                                                        </a>
                                                    ) : <span className="text-gray-400 text-sm">-</span>}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{new Date(hw.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                        {homeworkList.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-gray-500">
                                                    <div className="text-4xl mb-2">📚</div>
                                                    No homework assigned yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && activeTab === 'notices' && (
                    <div className="space-y-4">
                        {noticeList.map((notice) => (
                            <div key={notice.id} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-4">
                                        <span className="text-xl">📢</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{notice.notice_text}</p>
                                        <p className="text-xs text-gray-500 mt-3 font-medium">
                                            Posted: {new Date(notice.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {noticeList.length === 0 && (
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                                <div className="text-4xl mb-2">📭</div>
                                No notices from school.
                            </div>
                        )}
                    </div>
                )}

                {!loading && activeTab === 'fees' && (
                    <div className="animate-fade-in">
                        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl mb-6 border border-green-100">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                                <div>
                                    <h3 className="font-bold text-xl text-green-900">Fee Status</h3>
                                    <p className="text-sm text-gray-500">Track your fee payments by year</p>
                                </div>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="bg-white border border-green-200 text-green-900 text-sm rounded-xl focus:ring-green-500 focus:border-green-500 block p-3 font-bold shadow-sm w-full sm:w-auto"
                                >
                                    <option value={2024}>2024</option>
                                    <option value={2025}>2025</option>
                                    <option value={2026}>2026</option>
                                    <option value={2027}>2027</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {months.map((month) => {
                                    // Find fee record for this specific month and year
                                    const feeRecord = feeList.find(f => f.month === month && (f.year === selectedYear || (!f.year && selectedYear === 2025)));
                                    const isPaid = feeRecord?.status === 'PAID';

                                    return (
                                        <div key={month} className={`relative p-4 rounded-2xl border transition-all duration-300 ${isPaid ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md' : 'bg-white border-gray-100 hover:border-red-100 hover:shadow-sm'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-bold text-lg text-gray-700">{month}</span>
                                                {isPaid ? (
                                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                        ✓ PAID
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                                                        UNPAID
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-sm text-gray-500">
                                                    Amount: <span className={`font-semibold ${isPaid ? 'text-green-700' : 'text-gray-900'}`}>{feeRecord?.amount ? `₹${feeRecord.amount}` : '-'}</span>
                                                </div>
                                                {isPaid && feeRecord.created_at && (
                                                    <div className="text-xs text-green-600 flex items-center gap-1">
                                                        📅 {new Date(feeRecord.created_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>

                                            {isPaid && (
                                                <div className="absolute bottom-0 right-0 p-2 opacity-10">
                                                    <span className="text-4xl">💰</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Timetable Tab */}
                {activeTab === 'timetable' && (
                    <TimetableTab token={token} classId={user?.class_id} />
                )}

                {/* Vehicle Tab */}
                {activeTab === 'vehicle' && (
                    <VehicleTab token={token} />
                )}

                {/* Performance Tab */}
                {activeTab === 'performance' && (
                    <PerformanceTab token={token} userId={user?.id} />
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <EventsTab token={token} />
                )}
            </main>
        </div>
    );
};

export default ParentDashboard;
