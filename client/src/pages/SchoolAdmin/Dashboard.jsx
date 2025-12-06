import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import SubscriptionTab from './SubscriptionTab';
import VehiclesTab from './VehiclesTab';
import EventsTab from './EventsTab';
import { getApiUrl } from '../../config/api';

const SchoolAdminDashboard = ({ initialTab = 'students' }) => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState(initialTab);
    const [classes, setClasses] = useState([]);
    const [notices, setNotices] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [fees, setFees] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [events, setEvents] = useState([]);
    const [newVehicle, setNewVehicle] = useState({
        vehicle_name: '',
        route_details: '',
        driver_name: '',
        driver_phone: '',
        pickup_time: '',
        drop_time: ''
    });
    const [newEvent, setNewEvent] = useState({
        title: '',
        event_date: '',
        description: '',
        category: 'General'
    });

    // Form States
    const [newClassName, setNewClassName] = useState('');
    const [newNotice, setNewNotice] = useState({ text: '', classId: '', duration: '30' });
    const [newStudent, setNewStudent] = useState({
        name: '',
        phone: '',
        contact_phone: '',
        address: '',
        role: 'parent',
        class_id: '',

        father_name: ''
    });
    const [newTeacher, setNewTeacher] = useState({
        name: '',
        phone: '',
        contact_phone: '',
        address: '',
        role: 'teacher',
        class_id: '',
        father_name: ''
    });
    const [feeFilter, setFeeFilter] = useState('all');
    const [classFilter, setClassFilter] = useState('');
    const [teacherClassFilter, setTeacherClassFilter] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (activeTab === 'classes') fetchClasses();
        if (activeTab === 'notices') {
            fetchNotices();
            fetchClasses();
        }
        if (activeTab === 'students') {
            fetchStudents();
            fetchClasses();
        }
        if (activeTab === 'teachers') {
            fetchTeachers();
            fetchClasses();
        }
        if (activeTab === 'fees') {
            fetchFees();
            fetchStudents();
        }
        if (activeTab === 'backup') fetchClasses();
        if (activeTab === 'vehicles') {
            fetchVehicles();
            fetchStudents();
        }
        if (activeTab === 'events') fetchEvents();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'students') {
            fetchStudents();
        }
    }, [classFilter]);

    useEffect(() => {
        if (activeTab === 'teachers') {
            fetchTeachers();
        }
    }, [teacherClassFilter]);

    const fetchClasses = async () => {
        try {
            const res = await fetch(getApiUrl('/api/school/classes'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setClasses(data);
        } catch (err) { console.error(err); }
    };

    const fetchNotices = async () => {
        try {
            const res = await fetch(getApiUrl('/api/school/notices'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                console.error('Failed to fetch notices:', res.status);
                setNotices([]);
                return;
            }
            const data = await res.json();
            console.log('Fetched notices:', data);
            setNotices(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('fetchNotices error:', err);
            setNotices([]);
        }
    };

    const fetchStudents = async () => {
        try {
            const path = classFilter
                ? `/api/school/users?role=parent&class_id=${classFilter}`
                : '/api/school/users?role=parent';
            const url = getApiUrl(path);
            console.log('Fetching students:', url);
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            console.log('Students fetched:', data.length, 'students');
            setStudents(data);
        } catch (err) { console.error('fetchStudents error:', err); }
    };

    const fetchTeachers = async () => {
        try {
            const path = teacherClassFilter
                ? `/api/school/users?role=teacher&class_id=${teacherClassFilter}`
                : '/api/school/users?role=teacher';
            const url = getApiUrl(path);
            console.log('Fetching teachers:', url);
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            console.log('Teachers fetched:', data.length, 'teachers');
            setTeachers(data);
        } catch (err) { console.error('fetchTeachers error:', err); }
    };

    const fetchFees = async () => {
        try {
            const res = await fetch(getApiUrl('/api/school/fees/list'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setFees(data);
        } catch (err) { console.error(err); }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(getApiUrl('/api/school/create-class'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ class_name: newClassName })
            });
            const data = await res.json();
            if (res.ok) {
                setNewClassName('');
                fetchClasses();
                if (data.class_password) {
                    alert(`Class created successfully!\n\nClass Password: ${data.class_password}\n\n⚠️ IMPORTANT: This password is NO LONGER used for login!\n\nTeachers and Parents now have individual passwords.\nWhen you create a teacher/parent, you'll get their unique password.`);
                } else {
                    alert('Class created successfully!');
                }
            } else {
                alert(data.message || 'Failed to create class');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating class');
        }
    };

    const handleCreateNotice = async (e) => {
        e.preventDefault();
        console.log('Posting notice:', newNotice);
        try {
            const payload = {
                notice_text: newNotice.text,
                class_id: newNotice.classId || null,
                duration: newNotice.duration || null
            };
            console.log('Notice payload:', payload);

            const res = await fetch(getApiUrl('/api/school/create-notice'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            console.log('Notice response status:', res.status);
            const data = await res.json();
            console.log('Notice response data:', data);

            if (res.ok) {
                setNewNotice({ text: '', classId: '', duration: '30' });
                await fetchNotices();
                alert('Notice posted successfully!');
            } else {
                alert('Failed to post notice: ' + (data.message || data.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('handleCreateNotice error:', err);
            alert('Error posting notice: ' + err.message);
        }
    };

    const handleDeleteNotice = async (id) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) {
            return;
        }
        try {
            const res = await fetch(getApiUrl(`/api/school/notices/${id}`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Notice deleted successfully');
                fetchNotices();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete notice');
            }
        } catch (err) {
            console.error('Delete notice error:', err);
            alert('Error deleting notice');
        }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            const isUpdate = newStudent.id;
            const path = isUpdate
                ? `/api/school/users/${newStudent.id}`
                : '/api/school/create-user';
            const url = getApiUrl(path);
            const method = isUpdate ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newStudent)
            });
            const data = await res.json();
            if (res.ok) {
                setNewStudent({ name: '', phone: '', contact_phone: '', address: '', role: 'parent', class_id: '', father_name: '' });
                fetchStudents();
                if (data.password) {
                    alert(`Student registered successfully!\n\nCredentials:\nPhone: ${newStudent.phone}\nPassword: ${data.password}\n\nPlease share this password with the parent.`);
                } else {
                    alert(isUpdate ? 'Student updated successfully!' : 'Student registered successfully!');
                }
            } else {
                alert(data.message || 'Failed to save student');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving student');
        }
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        try {
            const isUpdate = newTeacher.id;
            const path = isUpdate
                ? `/api/school/users/${newTeacher.id}`
                : '/api/school/create-user';
            const url = getApiUrl(path);
            const method = isUpdate ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newTeacher)
            });
            const data = await res.json();
            if (res.ok) {
                setNewTeacher({ name: '', phone: '', contact_phone: '', address: '', role: 'teacher', class_id: '', father_name: '' });
                fetchTeachers();
                if (data.password) {
                    alert(`Teacher registered successfully!\n\nCredentials:\nPhone: ${newTeacher.phone}\nPassword: ${data.password}\n\nPlease share this password with the teacher.`);
                } else {
                    alert(isUpdate ? 'Teacher updated successfully!' : 'Teacher registered successfully!');
                }
            } else {
                alert(data.message || 'Failed to save teacher');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving teacher');
        }
    };

    const handleDeleteStudent = async (studentId, studentName) => {
        if (!window.confirm(`Are you sure you want to delete ${studentName || 'this student'}?`)) {
            return;
        }
        try {
            const res = await fetch(getApiUrl(`/api/school/users/${studentId}`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Student deleted successfully');
                fetchStudents();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete student');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting student');
        }
    };

    const handleDeleteTeacher = async (teacherId, teacherName) => {
        if (!window.confirm(`Are you sure you want to delete ${teacherName || 'this teacher'}?`)) {
            return;
        }
        try {
            const res = await fetch(getApiUrl(`/api/school/users/${teacherId}`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Teacher deleted successfully');
                fetchTeachers();
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to delete teacher');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('Error deleting teacher');
        }
    };

    const handleDownloadBackup = async () => {
        try {
            const res = await fetch(getApiUrl('/api/school/backup/download'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const backup = await res.json();
                const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `school_backup_${Date.now()}.json`;
                a.click();
                window.URL.revokeObjectURL(url);
                alert('Backup downloaded successfully!');
            } else {
                alert('Failed to download backup');
            }
        } catch (err) {
            console.error('Backup error:', err);
            alert('Error downloading backup');
        }
    };

    const handleRestoreBackup = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!window.confirm('⚠️ WARNING: This will replace all your school data with the backup. Are you sure?')) {
            e.target.value = '';
            return;
        }

        try {
            const text = await file.text();
            const backup = JSON.parse(text);

            const res = await fetch(getApiUrl('/api/school/backup/restore'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(backup)
            });

            if (res.ok) {
                alert('✅ Backup restored successfully! Refreshing data...');
                fetchClasses();
                fetchStudents();
                fetchTeachers();
                fetchNotices();
                fetchFees();
            } else {
                const data = await res.json();
                alert('Failed to restore backup: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Restore error:', err);
            alert('Error restoring backup. Please check the file format.');
        }
        e.target.value = '';
    };

    // ========== VEHICLES MANAGEMENT ==========
    const fetchVehicles = async () => {
        try {
            const res = await fetch(getApiUrl('/api/school/vehicles'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setVehicles(data);
        } catch (err) { console.error('Fetch vehicles error:', err); }
    };

    const handleCreateVehicle = async (e) => {
        e.preventDefault();
        try {
            const isUpdate = newVehicle.id;
            const path = isUpdate ? `/api/school/vehicles/${newVehicle.id}` : '/api/school/vehicles/create';
            const url = getApiUrl(path);
            const method = isUpdate ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newVehicle)
            });
            if (res.ok) {
                setNewVehicle({ vehicle_name: '', route_details: '', driver_name: '', driver_phone: '', pickup_time: '', drop_time: '' });
                fetchVehicles();
                alert(isUpdate ? 'Vehicle updated!' : 'Vehicle added successfully!');
            }
        } catch (err) {
            console.error(err);
            alert('Error saving vehicle');
        }
    };

    const handleDeleteVehicle = async (id, name) => {
        if (!window.confirm(`Delete vehicle "${name}"?`)) return;
        try {
            const res = await fetch(getApiUrl(`/api/school/vehicles/${id}`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Vehicle deleted');
                fetchVehicles();
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting vehicle');
        }
    };

    const handleAssignVehicle = async (studentId, vehicleId) => {
        try {
            const res = await fetch(getApiUrl('/api/school/vehicles/assign'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ student_id: studentId, vehicle_id: vehicleId })
            });
            if (res.ok) {
                alert('Vehicle assigned successfully!');
                fetchStudents();
            }
        } catch (err) {
            console.error(err);
            alert('Error assigning vehicle');
        }
    };

    // ========== EVENTS MANAGEMENT ==========
    const fetchEvents = async () => {
        try {
            const res = await fetch(getApiUrl('/api/school/events'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setEvents(data);
        } catch (err) { console.error('Fetch events error:', err); }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(getApiUrl('/api/school/events/create'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newEvent)
            });
            if (res.ok) {
                setNewEvent({ title: '', event_date: '', description: '', category: 'General' });
                fetchEvents();
                alert('Event created successfully!');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating event');
        }
    };

    const handleDeleteEvent = async (id, title) => {
        if (!window.confirm(`Delete event "${title}"?`)) return;
        try {
            const res = await fetch(getApiUrl(`/api/school/events/${id}`), {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Event deleted');
                fetchEvents();
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting event');
        }
    };

    const handleToggleFee = async (studentId, month) => {
        try {
            const res = await fetch(getApiUrl('/api/school/fees/toggle'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ student_id: studentId, month: month, year: selectedYear })
            });
            if (res.ok) fetchFees();
        } catch (err) { console.error('Error toggling fee:', err); }
    };

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 bg-indigo-900 text-white p-3 rounded-lg shadow-lg"
            >
                {sidebarOpen ? '✕' : '☰'}
            </button>

            {/* Sidebar */}
            <div className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 shadow-2xl transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                <div className="flex items-center mb-8">
                    <img src={logo} alt="SchoolDesk" className="w-12 h-12 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold">{user?.school_name}</h1>
                        <p className="text-xs text-indigo-300">Admin Panel</p>
                    </div>
                </div>

                <nav className="space-y-2">
                    {[
                        { id: 'students', label: 'Students', icon: '👨‍🎓' },
                        { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
                        { id: 'classes', label: 'Classes', icon: '📚' },
                        { id: 'notices', label: 'Notices', icon: '📢' },
                        { id: 'fees', label: 'Fees', icon: '💰' },
                        { id: 'vehicles', label: 'Vehicles', icon: '🚌' },
                        { id: 'events', label: 'Events', icon: '📅' },
                        { id: 'backup', label: 'Backup', icon: '💾' },
                        { id: 'subscription', label: 'Subscription', icon: '💳' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full text-left py-3 px-4 rounded-lg transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-white text-indigo-900 shadow-lg transform scale-105'
                                : 'hover:bg-indigo-700 hover:translate-x-1'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                    <button onClick={() => logout(navigate)} className="w-full text-left py-3 px-4 hover:bg-red-600 rounded-lg mt-8 transition-all duration-300">
                        🚪 Logout
                    </button>
                </nav>

                {/* Plan Badge */}
                <div className="mt-8 p-4 bg-white/10 backdrop-blur-lg rounded-lg">
                    <p className="text-xs text-indigo-300">Current Plan</p>
                    <p className="text-lg font-bold">{user?.plan_type || 'Trial'}</p>
                    <p className="text-xs text-indigo-300 mt-1">Expires: {user?.plan_expiry_date || 'N/A'}</p>
                </div>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                />
            )}

            {/* Main Content */}
            <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto pt-16 lg:pt-4">

                {/* Students Tab */}
                {activeTab === 'students' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="mr-3">👨‍🎓</span> Student Management
                        </h2>

                        {/* Create Student Form */}
                        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl mb-6 border border-indigo-100">
                            <h3 className="font-bold text-xl mb-4 text-indigo-900">
                                {newStudent.id ? 'Edit Student' : 'Register New Student'}
                            </h3>
                            <form onSubmit={handleCreateStudent} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Student Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newStudent.name}
                                            onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                            className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                            placeholder="Student name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Father's Name</label>
                                        <input
                                            type="text"
                                            value={newStudent.father_name}
                                            onChange={e => setNewStudent({ ...newStudent, father_name: e.target.value })}
                                            className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                            placeholder="Father name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={newStudent.phone}
                                            onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                                            className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                            placeholder="Phone"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
                                        <input
                                            type="tel"
                                            value={newStudent.contact_phone}
                                            onChange={e => setNewStudent({ ...newStudent, contact_phone: e.target.value })}
                                            className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                            placeholder="Alt. phone"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Class *</label>
                                        <select
                                            required
                                            value={newStudent.class_id}
                                            onChange={e => setNewStudent({ ...newStudent, class_id: e.target.value })}
                                            className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(c => (
                                                <option key={c.id} value={c.id}>{c.class_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                    <textarea
                                        value={newStudent.address}
                                        onChange={e => setNewStudent({ ...newStudent, address: e.target.value })}
                                        className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                        rows="2"
                                        placeholder="Address"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg"
                                    >
                                        {newStudent.id ? 'Update Student' : 'Register Student'}
                                    </button>
                                    {newStudent.id && (
                                        <button
                                            type="button"
                                            onClick={() => setNewStudent({ name: '', phone: '', contact_phone: '', address: '', role: 'parent', class_id: '', father_name: '' })}
                                            className="w-full sm:w-auto bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Class Filter */}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Class</label>
                            <select
                                value={classFilter}
                                onChange={e => setClassFilter(e.target.value)}
                                className="p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.class_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Student List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {students.map(student => (
                                <div key={student.id} className="bg-white/80 backdrop-blur-lg p-4 sm:p-5 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-indigo-100 hover:border-indigo-300">
                                    <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                                        <h3 className="font-bold text-base sm:text-lg text-indigo-900 break-words">{student.name || 'No Name'}</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setNewStudent({ ...student, feeAmount: '' })}
                                                className="text-blue-600 hover:text-blue-800 transition-colors"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student.id, student.name)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-xs sm:text-sm text-gray-700 break-words">
                                        <p className="break-all"><strong>📞</strong> {student.phone}</p>
                                        {student.father_name && <p><strong>👨 Father:</strong> {student.father_name}</p>}
                                        {student.contact_phone && <p><strong>📱</strong> {student.contact_phone}</p>}
                                        {student.address && <p><strong>📍</strong> {student.address}</p>}
                                        <p><strong>Class:</strong> {student.class_name}</p>
                                        <p className="text-xs text-gray-500">Role: {student.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {students.length === 0 && (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">📚</div>
                                <p className="text-gray-400 text-lg">No students found.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Teachers Tab */}
                {activeTab === 'teachers' && (
                    <div className="animate-fade-in">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                            <span className="mr-2 sm:mr-3">👨‍🏫</span> Teacher Management
                        </h2>

                        {/* Teacher Form */}
                        <div className="bg-white/80 backdrop-blur-lg p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-xl mb-4 sm:mb-6 border border-indigo-100">
                            <h3 className="font-bold text-base sm:text-lg md:text-xl mb-3 sm:mb-4 text-indigo-900">
                                {newTeacher.id ? 'Edit Teacher' : 'Add New Teacher'}
                            </h3>
                            <form onSubmit={handleCreateTeacher} className="space-y-3 sm:space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Teacher Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={newTeacher.name}
                                            onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                            className="w-full p-2 sm:p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                            placeholder="Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={newTeacher.phone}
                                            onChange={e => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                                            className="w-full p-2 sm:p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                            placeholder="Phone"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Alt. Phone</label>
                                        <input
                                            type="tel"
                                            value={newTeacher.contact_phone}
                                            onChange={e => setNewTeacher({ ...newTeacher, contact_phone: e.target.value })}
                                            className="w-full p-2 sm:p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                            placeholder="Alt."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Assign Class *</label>
                                        <select
                                            required
                                            value={newTeacher.class_id}
                                            onChange={e => setNewTeacher({ ...newTeacher, class_id: e.target.value })}
                                            className="w-full p-2 sm:p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                        >
                                            <option value="">Select Class</option>
                                            {classes.map(c => (
                                                <option key={c.id} value={c.id}>{c.class_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Address</label>
                                    <textarea
                                        value={newTeacher.address}
                                        onChange={e => setNewTeacher({ ...newTeacher, address: e.target.value })}
                                        className="w-full p-2 sm:p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                        rows="2"
                                        placeholder="Address"
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg text-sm sm:text-base"
                                    >
                                        {newTeacher.id ? 'Update Teacher' : 'Add Teacher'}
                                    </button>
                                    {newTeacher.id && (
                                        <button
                                            type="button"
                                            onClick={() => setNewTeacher({ name: '', phone: '', contact_phone: '', address: '', role: 'teacher', class_id: '', father_name: '' })}
                                            className="w-full sm:w-auto bg-gray-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all text-sm sm:text-base"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Filter */}
                        <div className="mb-3 sm:mb-4 px-1 sm:px-2">
                            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Filter by Class</label>
                            <select
                                value={teacherClassFilter}
                                onChange={e => setTeacherClassFilter(e.target.value)}
                                className="w-full sm:w-auto p-2 sm:p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.class_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Teacher Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {teachers.map(teacher => (
                                <div key={teacher.id} className="bg-white/80 backdrop-blur-lg p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-indigo-100">
                                    <div className="flex justify-between items-start mb-2 sm:mb-3 flex-wrap gap-2">
                                        <h3 className="font-bold text-sm sm:text-base md:text-lg text-indigo-900 break-words flex-1">{teacher.name || 'No Name'}</h3>
                                        <div className="flex gap-1 sm:gap-2">
                                            <button
                                                onClick={() => setNewTeacher(teacher)}
                                                className="text-blue-600 hover:text-blue-800 transition-colors text-lg sm:text-xl"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                                                className="text-red-600 hover:text-red-800 transition-colors text-lg sm:text-xl"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-gray-700 break-words">
                                        <p className="break-all"><strong>📞</strong> {teacher.phone}</p>
                                        {teacher.contact_phone && <p><strong>📱</strong> {teacher.contact_phone}</p>}
                                        {teacher.address && <p><strong>📍</strong> {teacher.address}</p>}
                                        {teacher.class_name && <p className="bg-indigo-100 px-2 py-0.5 sm:py-1 rounded text-indigo-900 inline-block mt-1 sm:mt-2"><strong>📚</strong> {teacher.class_name}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {teachers.length === 0 && (
                            <div className="text-center py-12 sm:py-20">
                                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">👨‍🏫</div>
                                <p className="text-gray-400 text-sm sm:text-lg">No teachers yet. Add your first teacher!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Classes Tab */}
                {activeTab === 'classes' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="mr-3">📚</span> Class Management
                        </h2>

                        <div className="bg-white/80 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-xl mb-6 border border-indigo-100">
                            <h3 className="font-bold text-xl mb-4 text-indigo-900">Create New Class</h3>
                            <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="text"
                                    required
                                    value={newClassName}
                                    onChange={e => setNewClassName(e.target.value)}
                                    className="flex-1 p-4 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base"
                                    placeholder="Enter class name (e.g., Class 1)"
                                />
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <span>Create</span>
                                    <span className="hidden sm:inline">Class</span>
                                    <span>✨</span>
                                </button>
                            </form>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {classes.map(cls => (
                                <div key={cls.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-indigo-50 overflow-hidden group">
                                    <div className="p-5">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                                📚
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{cls.class_name}</h3>
                                                <p className="text-xs text-gray-500">Created: {new Date(cls.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                            <p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wider">Legacy Password</p>
                                            <div className="flex items-center justify-between">
                                                <code className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{cls.class_password || 'N/A'}</code>
                                                <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">⚠️ Not for login</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {classes.length === 0 && (
                            <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-indigo-100">
                                <div className="text-6xl mb-4 opacity-50">📚</div>
                                <p className="text-gray-500 text-lg font-medium">No classes created yet.</p>
                                <p className="text-gray-400 text-sm">Create your first class to get started.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Notices Tab */}
                {activeTab === 'notices' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="mr-3">📢</span> School Notices
                        </h2>

                        {/* Post New Notice */}
                        <div className="bg-white/80 backdrop-blur-lg p-4 sm:p-6 rounded-2xl shadow-xl mb-6 border border-indigo-100">
                            <h3 className="font-bold text-xl mb-4 text-indigo-900">Post New Notice</h3>
                            <form onSubmit={handleCreateNotice} className="space-y-4">
                                <textarea
                                    required
                                    value={newNotice.text}
                                    onChange={e => setNewNotice({ ...newNotice, text: e.target.value })}
                                    className="w-full p-4 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base resize-none"
                                    rows="3"
                                    placeholder="Write your announcement here..."
                                />
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <select
                                        value={newNotice.classId}
                                        onChange={e => setNewNotice({ ...newNotice, classId: e.target.value })}
                                        className="flex-1 p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base bg-white"
                                    >
                                        <option value="">📢 School-wide (All Classes)</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>📚 {c.class_name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={newNotice.duration}
                                        onChange={e => setNewNotice({ ...newNotice, duration: e.target.value })}
                                        className="w-full sm:w-48 p-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-base bg-white"
                                    >
                                        <option value="7">📅 7 Days</option>
                                        <option value="14">📅 14 Days</option>
                                        <option value="30">📅 30 Days</option>
                                        <option value="60">📅 60 Days</option>
                                    </select>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <span>Post</span>
                                        <span className="hidden sm:inline">Notice</span>
                                        <span>🚀</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Notice List */}
                        <div className="grid gap-4">
                            {notices.map(notice => (
                                <div key={notice.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-indigo-50 overflow-hidden group">
                                    <div className="p-5">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${notice.class_id ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {notice.class_id ? '📚 Class Notice' : '📢 School-wide'}
                                                    </span>
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        🕒 {new Date(notice.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">{notice.notice_text}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteNotice(notice.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                                                title="Delete Notice"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        {notice.expiry_date && (
                                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                                                <span>⏳ Expires on:</span>
                                                <span className="font-medium text-gray-700">{new Date(notice.expiry_date).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {notices.length === 0 && (
                            <div className="text-center py-20 bg-white/50 rounded-3xl border-2 border-dashed border-indigo-100">
                                <div className="text-6xl mb-4 opacity-50">📢</div>
                                <p className="text-gray-500 text-lg font-medium">No notices active.</p>
                                <p className="text-gray-400 text-sm">Post an announcement to keep parents informed.</p>
                            </div>
                        )}
                    </div>
                )}


                {/* Fees Tab */}
                {activeTab === 'fees' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="mr-3">💰</span> Fee Management
                        </h2>

                        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl mb-6 border border-indigo-100">
                            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h3 className="font-bold text-xl text-indigo-900">Fee Status</h3>
                                    <p className="text-sm text-gray-500">Tap on a month to toggle payment status</p>
                                </div>
                                <div className="flex flex-wrap gap-3 items-center">
                                    {/* Year Selector */}
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="bg-white border border-indigo-200 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 font-bold shadow-sm"
                                    >
                                        <option value={2024}>2024</option>
                                        <option value={2025}>2025</option>
                                        <option value={2026}>2026</option>
                                        <option value={2027}>2027</option>
                                    </select>

                                    <div className="flex bg-gray-100 p-1 rounded-xl">
                                        <button onClick={() => setFeeFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${feeFilter === 'all' ? 'bg-white text-indigo-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>All</button>
                                        <button onClick={() => setFeeFilter('paid')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${feeFilter === 'paid' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Paid</button>
                                        <button onClick={() => setFeeFilter('unpaid')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${feeFilter === 'unpaid' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Unpaid</button>
                                    </div>
                                </div>
                            </div>

                            {students.length === 0 ? (
                                <div className="text-center py-20">
                                    <div className="text-6xl mb-4 animate-bounce">📚</div>
                                    <p className="text-gray-400 text-lg">No students found. Add students first.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {students.filter(student => {
                                        if (feeFilter === 'all') return true;
                                        // Filter fees by student AND selected year
                                        const studentFees = fees.filter(f => f.parent_id === student.id && (f.year === selectedYear || (!f.year && selectedYear === 2025))); // Handle legacy data

                                        if (feeFilter === 'paid') return studentFees.some(f => f.status === 'PAID');
                                        if (feeFilter === 'unpaid') return months.some(month => {
                                            const feeRecord = studentFees.find(f => f.month === month);
                                            return !feeRecord || feeRecord.status === 'UNPAID';
                                        });
                                        return true;
                                    }).map((student) => (
                                        <div key={student.id} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden group">
                                            <div className="p-5 border-b border-gray-50 bg-gradient-to-r from-gray-50/50 to-white">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-lg font-bold shadow-md transform group-hover:scale-110 transition-transform duration-300">
                                                        {(student.name || student.phone).charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">{student.name || 'Unknown'}</h3>
                                                        <p className="text-sm text-gray-500 truncate">{student.father_name || 'No Father Name'}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium border border-indigo-100">{student.class_name || 'No Class'}</span>
                                                            <span className="text-xs text-gray-400">{student.phone}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <div className="grid grid-cols-4 gap-2">
                                                    {months.map(month => {
                                                        // Find fee record for this specific year
                                                        const feeRecord = fees.find(f => f.parent_id === student.id && f.month === month && (f.year === selectedYear || (!f.year && selectedYear === 2025)));
                                                        const isPaid = feeRecord?.status === 'PAID';
                                                        return (
                                                            <button
                                                                key={month}
                                                                onClick={() => handleToggleFee(student.id, month)}
                                                                className={`
                                                                    py-2 rounded-lg text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-0.5
                                                                    ${isPaid
                                                                        ? 'bg-emerald-500 text-white shadow-emerald-200 shadow-md transform scale-105'
                                                                        : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 border border-gray-100 hover:border-red-200'
                                                                    }
                                                                `}
                                                                title={isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                                                            >
                                                                <span>{month}</span>
                                                                {isPaid && <span className="text-[10px] opacity-80">✓</span>}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Backup Tab */}
                {activeTab === 'backup' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
                            <span className="mr-3">💾</span> Backup & Restore
                        </h2>

                        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-indigo-100">
                            <div className="space-y-6">
                                {/* Download Backup */}
                                <div className="border-b pb-6">
                                    <h3 className="font-bold text-xl mb-3 text-indigo-900">📥 Download Backup</h3>
                                    <p className="text-gray-600 mb-4">
                                        Download a complete backup of your school's data as a JSON file.
                                    </p>
                                    <button
                                        onClick={handleDownloadBackup}
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <span>💾</span> Download Backup Now
                                    </button>
                                </div>

                                {/* Restore Backup */}
                                <div>
                                    <h3 className="font-bold text-xl mb-3 text-indigo-900">📤 Restore from Backup</h3>
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                                        <p className="text-red-700 font-semibold">⚠️ Warning</p>
                                        <p className="text-red-600 text-sm mt-1">
                                            Restoring a backup will replace ALL of your current school data.
                                            This action cannot be undone.
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleRestoreBackup}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-600 file:to-pink-600 file:text-white hover:file:scale-105 file:transition-all file:shadow-lg cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Subscription Tab */}
                {activeTab === 'subscription' && (
                    <SubscriptionTab user={user} token={token} />
                )}

                {/* Vehicles Tab */}
                {activeTab === 'vehicles' && (
                    <VehiclesTab token={token} />
                )}

                {/* Events Tab */}
                {activeTab === 'events' && (
                    <EventsTab token={token} />
                )}
            </div>
        </div>
    );
};

export default SchoolAdminDashboard;
