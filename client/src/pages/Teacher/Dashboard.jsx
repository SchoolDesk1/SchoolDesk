import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TimetableTab from './TimetableTab';
import MarksTab from './MarksTab';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/ui/Card';

const API_URL = '/api';

const TeacherDashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('homework');
    const [homeworkList, setHomeworkList] = useState([]);
    const [noticeList, setNoticeList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Homework Form State
    const [hwTitle, setHwTitle] = useState('');
    const [hwDesc, setHwDesc] = useState('');
    const [hwFile, setHwFile] = useState(null);

    // Notice Form State
    const [noticeText, setNoticeText] = useState('');

    const menuItems = [
        { id: 'homework', label: 'Homework', icon: '📚' },
        { id: 'notices', label: 'Notices', icon: '📢' },
        { id: 'timetable', label: 'Timetable', icon: '📅' },
        { id: 'marks', label: 'Marks', icon: '📝' },
    ];

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
        <DashboardLayout
            menuItems={menuItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            role="Teacher"
            userProfile={{ name: user?.name || 'Teacher', detail: `Class: ${user?.class_id}` }}
        >
            <div className="mb-8">
                <h2 className="text-3xl font-display font-bold text-surface-900">
                    {activeTab === 'homework' && 'Manage Homework'}
                    {activeTab === 'notices' && 'Class Notices'}
                    {activeTab === 'timetable' && 'Class Timetable'}
                    {activeTab === 'marks' && 'Student Marks'}
                </h2>
                <p className="text-surface-500 mt-2">Welcome back, manage your interactions efficiently.</p>
            </div>

            {message && (
                <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center animate-fade-in shadow-sm">
                    <span className="mr-2 text-xl">✅</span> {message}
                </div>
            )}

            {activeTab === 'homework' && (
                <div className="space-y-8 animate-slide-up">
                    <Card title="Upload New Assignment">
                        <form onSubmit={handleHomeworkUpload} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-2">Homework Title</label>
                                    <input
                                        type="text"
                                        value={hwTitle}
                                        onChange={(e) => setHwTitle(e.target.value)}
                                        className="input-field"
                                        required
                                        placeholder="e.g., Mathematics - Chapter 5"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-2">Attach File (Optional)</label>
                                    <input
                                        type="file"
                                        onChange={(e) => setHwFile(e.target.files[0])}
                                        className="w-full text-sm text-surface-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Instructions / Description</label>
                                <textarea
                                    value={hwDesc}
                                    onChange={(e) => setHwDesc(e.target.value)}
                                    className="input-field min-h-[100px]"
                                    rows="3"
                                    placeholder="Enter detailed instructions for the students..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary"
                                >
                                    {loading ? 'Uploading...' : 'Publish Homework'}
                                </button>
                            </div>
                        </form>
                    </Card>

                    <div className="card">
                        <h3 className="text-xl font-bold text-surface-900 mb-6 tracking-tight">Recent Assignments</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-surface-200">
                                        <th className="p-4 font-semibold text-surface-500 text-sm uppercase tracking-wider">Title</th>
                                        <th className="p-4 font-semibold text-surface-500 text-sm uppercase tracking-wider hidden sm:table-cell">Description</th>
                                        <th className="p-4 font-semibold text-surface-500 text-sm uppercase tracking-wider">File</th>
                                        <th className="p-4 font-semibold text-surface-500 text-sm uppercase tracking-wider">Date</th>
                                        <th className="p-4 font-semibold text-surface-500 text-sm uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-100">
                                    {homeworkList.map((hw) => (
                                        <tr key={hw.id} className="hover:bg-surface-50 transition-colors">
                                            <td className="p-4">
                                                <div className="font-semibold text-surface-900">{hw.title}</div>
                                                <div className="text-sm text-surface-500 sm:hidden mt-1 line-clamp-1">{hw.description}</div>
                                            </td>
                                            <td className="p-4 hidden sm:table-cell text-surface-600 max-w-xs truncate">{hw.description}</td>
                                            <td className="p-4">
                                                {hw.file_url ? (
                                                    <a href={hw.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                                        View File
                                                    </a>
                                                ) : <span className="text-surface-400 text-sm">-</span>}
                                            </td>
                                            <td className="p-4 text-sm text-surface-600 whitespace-nowrap">{new Date(hw.created_at).toLocaleDateString()}</td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteHomework(hw.id)}
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {homeworkList.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-12 text-center text-surface-400">
                                                <div className="text-5xl mb-4 opacity-20">📚</div>
                                                <p>No homework assignments found.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'notices' && (
                <div className="space-y-8 animate-slide-up">
                    <Card title="Post New Class Notice">
                        <form onSubmit={handleNoticePost} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-surface-700 mb-2">Announcement Details</label>
                                <textarea
                                    value={noticeText}
                                    onChange={(e) => setNoticeText(e.target.value)}
                                    className="input-field min-h-[120px]"
                                    rows="4"
                                    required
                                    placeholder="Write your class announcement here..."
                                ></textarea>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary"
                                >
                                    {loading ? 'Posting...' : 'Post Announcement'}
                                </button>
                            </div>
                        </form>
                    </Card>

                    <div className="grid grid-cols-1 gap-6">
                        {noticeList.map((notice) => (
                            <div key={notice.id} className="card group hover:border-primary-200 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center text-secondary-600 text-xl flex-shrink-0">
                                        📢
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-surface-800 leading-relaxed whitespace-pre-wrap">{notice.notice_text}</p>
                                        <div className="mt-4 flex items-center gap-2 text-xs text-surface-400 font-medium">
                                            <span>📅 {new Date(notice.created_at).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>⏰ {new Date(notice.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {noticeList.length === 0 && (
                            <div className="text-center py-12 text-surface-400 bg-surface-50 rounded-xl border border-dashed border-surface-200">
                                <p>No notices have been posted yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Timetable Tab */}
            {activeTab === 'timetable' && (
                <div className="animate-slide-up">
                    <Card>
                        <TimetableTab token={token} classId={user?.class_id} />
                    </Card>
                </div>
            )}

            {/* Marks Tab */}
            {activeTab === 'marks' && (
                <div className="animate-slide-up">
                    <Card>
                        <MarksTab token={token} />
                    </Card>
                </div>
            )}
        </DashboardLayout>
    );
};

export default TeacherDashboard;
