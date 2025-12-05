import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TimetableTab from './TimetableTab';
import MarksTab from './MarksTab';

const API_URL = '/api';

const TeacherDashboard = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('homework');
    const [homeworkList, setHomeworkList] = useState([]);
    const [noticeList, setNoticeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Homework Form State
    const [hwTitle, setHwTitle] = useState('');
    const [hwDesc, setHwDesc] = useState('');
    const [hwFile, setHwFile] = useState(null);

    // Notice Form State
    const [noticeText, setNoticeText] = useState('');

    useEffect(() => {
        if (activeTab === 'homework') {
            fetchHomework();
        } else if (activeTab === 'notices') {
            fetchNotices();
        }
    }, [activeTab]);

    const fetchHomework = async () => {
        try {
            const res = await axios.get(`${API_URL}/teacher/homework-list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHomeworkList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setHomeworkList([]);
        }
    };

    const fetchNotices = async () => {
        try {
            const res = await axios.get(`${API_URL}/teacher/notice-list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNoticeList(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setNoticeList([]);
        }
    };

    const handleHomeworkUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const formData = new FormData();
        formData.append('title', hwTitle);
        formData.append('description', hwDesc);
        if (hwFile) formData.append('file', hwFile);

        try {
            await axios.post(`${API_URL}/teacher/upload-homework`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Homework uploaded successfully!');
            setHwTitle('');
            setHwDesc('');
            setHwFile(null);
            fetchHomework();
        } catch (err) {
            setMessage('Failed to upload homework.');
        } finally {
            setLoading(false);
        }
    };

    const handleNoticePost = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await axios.post(`${API_URL}/teacher/upload-notice`, { notice_text: noticeText }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Notice posted successfully!');
            setNoticeText('');
            fetchNotices();
        } catch (err) {
            setMessage('Failed to post notice.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteHomework = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await axios.delete(`${API_URL}/teacher/homework/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchHomework();
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Header & Hamburger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-4 py-3 flex justify-between items-center">
                <span className="font-bold text-blue-600 text-lg">Teacher Panel</span>
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
                <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <h1 className="text-2xl font-bold">Teacher Panel</h1>
                    <p className="text-sm text-blue-100 mt-1">Class: {user?.class_id}</p>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    <button
                        onClick={() => { setActiveTab('homework'); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'homework' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        📚 Homework
                    </button>
                    <button
                        onClick={() => { setActiveTab('notices'); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'notices' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        📢 Notices
                    </button>
                    <button
                        onClick={() => { setActiveTab('timetable'); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'timetable' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        📅 Timetable
                    </button>
                    <button
                        onClick={() => { setActiveTab('marks'); setSidebarOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === 'marks' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        📝 Marks
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
                        {activeTab === 'homework' ? 'Manage Homework' : 'Class Notices'}
                    </h2>
                </header>

                {message && <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6 shadow-sm animate-fade-in">{message}</div>}

                {activeTab === 'homework' && (
                    <div className="space-y-6">
                        {/* Upload Form */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Upload Homework</h3>
                            <form onSubmit={handleHomeworkUpload} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={hwTitle}
                                        onChange={(e) => setHwTitle(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                                        required
                                        placeholder="e.g., Math Chapter 5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={hwDesc}
                                        onChange={(e) => setHwDesc(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                                        rows="3"
                                        placeholder="Instructions for students..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">File (Optional)</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setHwFile(e.target.files[0])}
                                        className="w-full p-2 border border-gray-300 rounded-lg text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-md active:scale-95"
                                >
                                    {loading ? 'Uploading...' : 'Upload Homework'}
                                </button>
                            </form>
                        </div>

                        {/* List */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Homework History</h3>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                                <div className="inline-block min-w-full align-middle">
                                    <table className="min-w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b bg-gray-50">
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Title</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm hidden sm:table-cell">Description</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">File</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                                                <th className="p-4 font-semibold text-gray-600 text-sm">Action</th>
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
                                                            <a href={hw.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
                                                                📄 View
                                                            </a>
                                                        ) : <span className="text-gray-400 text-sm">-</span>}
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{new Date(hw.created_at).toLocaleDateString()}</td>
                                                    <td className="p-4">
                                                        <button
                                                            onClick={() => handleDeleteHomework(hw.id)}
                                                            className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                            title="Delete"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {homeworkList.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="p-8 text-center text-gray-500">
                                                        <div className="text-4xl mb-2">📝</div>
                                                        No homework uploaded yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notices' && (
                    <div className="space-y-6">
                        {/* Post Form */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Post New Notice</h3>
                            <form onSubmit={handleNoticePost} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notice Text</label>
                                    <textarea
                                        value={noticeText}
                                        onChange={(e) => setNoticeText(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base"
                                        rows="4"
                                        required
                                        placeholder="Write your announcement here..."
                                    ></textarea>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors shadow-md active:scale-95"
                                >
                                    {loading ? 'Posting...' : 'Post Notice'}
                                </button>
                            </form>
                        </div>

                        {/* List */}
                        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">Notice History</h3>
                            <div className="space-y-4">
                                {noticeList.map((notice) => (
                                    <div key={notice.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-white hover:shadow-md transition-all">
                                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{notice.notice_text}</p>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-xs text-gray-500 font-medium">Posted: {new Date(notice.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {noticeList.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <div className="text-4xl mb-2">📢</div>
                                        No notices posted yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Timetable Tab */}
                {activeTab === 'timetable' && (
                    <TimetableTab token={token} classId={user?.class_id} />
                )}

                {/* Marks Tab */}
                {activeTab === 'marks' && (
                    <MarksTab token={token} />
                )}
            </main>
        </div>
    );
};

export default TeacherDashboard;
