import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SubscriptionTab from './SubscriptionTab';
import VehiclesTab from './VehiclesTab';
import EventsTab from './EventsTab';
import { getApiUrl } from '../../config/api';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import UpgradePopup from '../../components/UpgradePopup';
import DashboardLayout from '../../components/DashboardLayout';
import Card from '../../components/ui/Card';

const SchoolAdminDashboard = ({ initialTab = 'students' }) => {
    const navigate = useNavigate();
    const { user, token, logout } = useAuth();
    const { isLimitReached, checkAccess, planType } = usePlanLimits();
    const [upgradePopup, setUpgradePopup] = useState({ open: false, message: '', type: 'limit' });

    const [activeTab, setActiveTab] = useState(initialTab);
    const [classes, setClasses] = useState([]);
    const [notices, setNotices] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [fees, setFees] = useState([]);

    const menuItems = [
        { id: 'students', label: 'Students', icon: '👨‍🎓' },
        { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
        { id: 'classes', label: 'Classes', icon: '📚' },
        { id: 'notices', label: 'Notices', icon: '📢' },
        { id: 'fees', label: 'Fees', icon: '💰' },
        { id: 'vehicles', label: 'Vehicles', icon: '🚌' },
        { id: 'events', label: 'Events', icon: '📅' },
        { id: 'backup', label: 'Backup', icon: '💾' },
        { id: 'subscription', label: 'Subscription', icon: '💳' }
    ];
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

        // Optional: Client-side check if we have the full list
        if (isLimitReached('classes', classes.length)) {
            setUpgradePopup({ open: true, message: `You have reached the class limit for the ${planType} plan.`, type: 'limit' });
            return;
        }

        try {
            const res = await fetch(getApiUrl('/api/school/create-class'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ class_name: newClassName })
            });
            const data = await res.json();

            if (res.status === 403) {
                setUpgradePopup({
                    open: true,
                    message: data.message || "Plan limit reached.",
                    type: data.code === 'PLAN_EXPIRED' ? 'expired' : 'limit'
                });
                return;
            }

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

            if (res.status === 403) {
                setUpgradePopup({
                    open: true,
                    message: data.message || "Access denied due to plan limits.",
                    type: data.code === 'PLAN_EXPIRED' ? 'expired' : 'limit'
                });
                return;
            }

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

            if (res.status === 403) {
                setUpgradePopup({
                    open: true,
                    message: data.message || "Access denied due to plan limits.",
                    type: data.code === 'PLAN_EXPIRED' ? 'expired' : 'limit'
                });
                return;
            }

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

            if (res.status === 403) {
                const data = await res.json();
                setUpgradePopup({
                    open: true,
                    message: data.message || "Backup feature is not available in your plan.",
                    type: data.code === 'PLAN_EXPIRED' ? 'expired' : 'limit'
                });
                return;
            }

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

        if (!window.confirm('⚠️ WARNING: This will replace all your institute data with the backup. Are you sure?')) {
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
        <DashboardLayout
            menuItems={menuItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            role="Institute Admin"
            userProfile={{ name: user?.school_name || 'Institute Admin', detail: `Plan: ${user?.plan_type || 'Trial'}` }}
        >
            <UpgradePopup
                isOpen={upgradePopup.open}
                onClose={() => setUpgradePopup({ ...upgradePopup, open: false })}
                message={upgradePopup.message}
                type={upgradePopup.type}
            />

            {/* Students Tab */}
            {activeTab === 'students' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-surface-900">Student Management</h2>
                            <p className="text-surface-500 mt-1">Manage student records and details.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setNewStudent({ name: '', phone: '', father_name: '', contact_phone: '', address: '', role: 'student', class_id: '', feeAmount: '' })}
                                className="btn-primary flex items-center gap-2"
                            >
                                <span>➕</span> Add Student
                            </button>
                        </div>
                    </div>

                    <Card title={newStudent.id ? 'Edit Student' : 'Add New Student'}>
                        <form onSubmit={handleCreateStudent} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Student Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newStudent.name}
                                        onChange={e => setNewStudent({ ...newStudent, name: e.target.value })}
                                        className="input-field"
                                        placeholder="Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newStudent.phone}
                                        onChange={e => setNewStudent({ ...newStudent, phone: e.target.value })}
                                        className="input-field"
                                        placeholder="Phone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Father's Name</label>
                                    <input
                                        type="text"
                                        value={newStudent.father_name}
                                        onChange={e => setNewStudent({ ...newStudent, father_name: e.target.value })}
                                        className="input-field"
                                        placeholder="Father's Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Alt. Phone</label>
                                    <input
                                        type="tel"
                                        value={newStudent.contact_phone}
                                        onChange={e => setNewStudent({ ...newStudent, contact_phone: e.target.value })}
                                        className="input-field"
                                        placeholder="Alt. Phone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Assign Class *</label>
                                    <select
                                        required
                                        value={newStudent.class_id}
                                        onChange={e => setNewStudent({ ...newStudent, class_id: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.class_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Monthly Fee (₹)</label>
                                    <input
                                        type="number"
                                        value={newStudent.feeAmount || ''}
                                        onChange={e => setNewStudent({ ...newStudent, feeAmount: e.target.value })}
                                        className="input-field"
                                        placeholder="Fee Amount"
                                    />
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label className="block text-sm font-semibold text-surface-700 mb-1">Address</label>
                                <textarea
                                    value={newStudent.address}
                                    onChange={e => setNewStudent({ ...newStudent, address: e.target.value })}
                                    className="input-field"
                                    rows="2"
                                    placeholder="Address"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                {newStudent.id && (
                                    <button
                                        type="button"
                                        onClick={() => setNewStudent({ name: '', phone: '', father_name: '', contact_phone: '', address: '', role: 'student', class_id: '' })}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {newStudent.id ? 'Update Student' : 'Add Student'}
                                </button>
                            </div>
                        </form>
                    </Card>

                    <div className="flex justify-end">
                        <div className="w-full sm:w-64">
                            <select
                                value={classFilter}
                                onChange={e => setClassFilter(e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.class_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {students.map(student => (
                            <div key={student.id} className="card group hover:border-primary-200 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-surface-900 group-hover:text-primary-700 transition-colors">{student.name || 'No Name'}</h3>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setNewStudent({ ...student, feeAmount: '' })}
                                            className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStudent(student.id, student.name)}
                                            className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-surface-600">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 text-center">📞</span>
                                        <span className="font-medium">{student.phone}</span>
                                    </div>
                                    {student.father_name && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 text-center">👨</span>
                                            <span>{student.father_name}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 text-center">📚</span>
                                        <span className="bg-surface-100 text-surface-700 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                                            {student.class_name}
                                        </span>
                                    </div>
                                    {student.address && (
                                        <div className="flex items-start gap-2">
                                            <span className="w-5 text-center mt-0.5">📍</span>
                                            <span className="line-clamp-2">{student.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {students.length === 0 && (
                        <div className="text-center py-20 bg-surface-50 rounded-xl border border-dashed border-surface-200">
                            <div className="text-5xl mb-4 opacity-20">👨‍🎓</div>
                            <p className="text-surface-500 text-lg font-medium">No students found.</p>
                            <p className="text-surface-400">Add a new student to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Teachers Tab */}
            {activeTab === 'teachers' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-surface-900">Teacher Management</h2>
                            <p className="text-surface-500 mt-1">Manage staff records and assignments.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setNewTeacher({ name: '', phone: '', contact_phone: '', address: '', role: 'teacher', class_id: '', father_name: '' })}
                                className="btn-primary flex items-center gap-2"
                            >
                                <span>➕</span> Add Teacher
                            </button>
                        </div>
                    </div>

                    {/* Teacher Form */}
                    <Card title={newTeacher.id ? 'Edit Teacher' : 'Add New Teacher'}>
                        <form onSubmit={handleCreateTeacher} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Teacher Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTeacher.name}
                                        onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                        className="input-field"
                                        placeholder="Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={newTeacher.phone}
                                        onChange={e => setNewTeacher({ ...newTeacher, phone: e.target.value })}
                                        className="input-field"
                                        placeholder="Phone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Alt. Phone</label>
                                    <input
                                        type="tel"
                                        value={newTeacher.contact_phone}
                                        onChange={e => setNewTeacher({ ...newTeacher, contact_phone: e.target.value })}
                                        className="input-field"
                                        placeholder="Alt. Phone"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-surface-700 mb-1">Assign Class *</label>
                                    <select
                                        required
                                        value={newTeacher.class_id}
                                        onChange={e => setNewTeacher({ ...newTeacher, class_id: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">Select Class</option>
                                        {classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.class_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label className="block text-sm font-semibold text-surface-700 mb-1">Address</label>
                                <textarea
                                    value={newTeacher.address}
                                    onChange={e => setNewTeacher({ ...newTeacher, address: e.target.value })}
                                    className="input-field"
                                    rows="2"
                                    placeholder="Address"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                {newTeacher.id && (
                                    <button
                                        type="button"
                                        onClick={() => setNewTeacher({ name: '', phone: '', contact_phone: '', address: '', role: 'teacher', class_id: '', father_name: '' })}
                                        className="btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {newTeacher.id ? 'Update Teacher' : 'Add Teacher'}
                                </button>
                            </div>
                        </form>
                    </Card>

                    {/* Filter */}
                    <div className="flex justify-end">
                        <div className="w-full sm:w-64">
                            <select
                                value={teacherClassFilter}
                                onChange={e => setTeacherClassFilter(e.target.value)}
                                className="input-field"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.class_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Teacher Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teachers.map(teacher => (
                            <div key={teacher.id} className="card group hover:border-primary-200 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-surface-900 group-hover:text-primary-700 transition-colors">{teacher.name || 'No Name'}</h3>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setNewTeacher(teacher)}
                                            className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                                            className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-surface-600">
                                    <div className="flex items-center gap-2">
                                        <span className="w-5 text-center">📞</span>
                                        <span className="font-medium">{teacher.phone}</span>
                                    </div>
                                    {teacher.contact_phone && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 text-center">📱</span>
                                            <span>{teacher.contact_phone}</span>
                                        </div>
                                    )}
                                    {teacher.class_name && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 text-center">📚</span>
                                            <span className="bg-surface-100 text-surface-700 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                                                {teacher.class_name}
                                            </span>
                                        </div>
                                    )}
                                    {teacher.address && (
                                        <div className="flex items-start gap-2">
                                            <span className="w-5 text-center mt-0.5">📍</span>
                                            <span className="line-clamp-2">{teacher.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {teachers.length === 0 && (
                        <div className="text-center py-20 bg-surface-50 rounded-xl border border-dashed border-surface-200">
                            <div className="text-5xl mb-4 opacity-20">👨‍🏫</div>
                            <p className="text-surface-500 text-lg font-medium">No teachers found.</p>
                            <p className="text-surface-400">Add a new teacher to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Classes Tab */}
            {activeTab === 'classes' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-surface-900">Class Management</h2>
                            <p className="text-surface-500 mt-1">Create and manage classes.</p>
                        </div>
                    </div>

                    <Card title="Create New Class">
                        <form onSubmit={handleCreateClass} className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                required
                                value={newClassName}
                                onChange={e => setNewClassName(e.target.value)}
                                className="input-field flex-1"
                                placeholder="Enter class name (e.g., Class 1)"
                            />
                            <button
                                type="submit"
                                className="btn-primary flex items-center justify-center gap-2 px-8"
                            >
                                <span>➕</span>
                                <span>Create Class</span>
                            </button>
                        </form>
                    </Card>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {classes.map(cls => (
                            <div key={cls.id} className="card hover:border-primary-200 transition-all duration-300 group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                        📚
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-surface-900 group-hover:text-primary-700 transition-colors">{cls.class_name}</h3>
                                        <p className="text-xs text-surface-500">Created: {new Date(cls.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="bg-surface-50 rounded-xl p-3 border border-surface-100">
                                    <p className="text-xs text-surface-500 mb-1 font-medium uppercase tracking-wider">Legacy Password</p>
                                    <div className="flex items-center justify-between">
                                        <code className="text-sm font-bold text-primary-600 bg-white px-2 py-1 rounded border border-surface-200">{cls.class_password || 'N/A'}</code>
                                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-200 font-medium">⚠️ Login Disabled</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {classes.length === 0 && (
                        <div className="text-center py-20 bg-surface-50 rounded-xl border border-dashed border-surface-200">
                            <div className="text-5xl mb-4 opacity-20">📚</div>
                            <p className="text-surface-500 text-lg font-medium">No classes created yet.</p>
                            <p className="text-surface-400">Create your first class to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Notices Tab */}
            {activeTab === 'notices' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-surface-900">School Notices</h2>
                            <p className="text-surface-500 mt-1">Post and manage announcements.</p>
                        </div>
                    </div>

                    <Card title="Post New Notice">
                        <form onSubmit={handleCreateNotice} className="space-y-4">
                            <textarea
                                required
                                value={newNotice.text}
                                onChange={e => setNewNotice({ ...newNotice, text: e.target.value })}
                                className="input-field resize-none"
                                rows="3"
                                placeholder="Write your announcement here..."
                            />
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select
                                    value={newNotice.classId}
                                    onChange={e => setNewNotice({ ...newNotice, classId: e.target.value })}
                                    className="input-field flex-1"
                                >
                                    <option value="">📢 School-wide (All Classes)</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>📚 {c.class_name}</option>
                                    ))}
                                </select>
                                <select
                                    value={newNotice.duration}
                                    onChange={e => setNewNotice({ ...newNotice, duration: e.target.value })}
                                    className="input-field w-full sm:w-48"
                                >
                                    <option value="7">📅 7 Days</option>
                                    <option value="14">📅 14 Days</option>
                                    <option value="30">📅 30 Days</option>
                                    <option value="60">📅 60 Days</option>
                                </select>
                                <button
                                    type="submit"
                                    className="btn-primary flex items-center justify-center gap-2 px-8"
                                >
                                    <span>Post</span>
                                    <span className="hidden sm:inline">Notice</span>
                                    <span>🚀</span>
                                </button>
                            </div>
                        </form>
                    </Card>

                    {/* Notice List */}
                    <div className="grid gap-4">
                        {notices.map(notice => (
                            <div key={notice.id} className="card hover:border-primary-200 transition-all duration-300 group">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${notice.class_id ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {notice.class_id ? '📚 Class Notice' : '📢 School-wide'}
                                            </span>
                                            <span className="text-xs text-surface-400 flex items-center gap-1">
                                                🕒 {new Date(notice.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-surface-800 text-lg leading-relaxed whitespace-pre-wrap">{notice.notice_text}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNotice(notice.id)}
                                        className="text-surface-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                                        title="Delete Notice"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                {notice.expiry_date && (
                                    <div className="mt-4 pt-3 border-t border-surface-100 flex items-center gap-2 text-xs text-surface-500">
                                        <span>⏳ Expires on:</span>
                                        <span className="font-medium text-surface-700">{new Date(notice.expiry_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    {notices.length === 0 && (
                        <div className="text-center py-20 bg-surface-50 rounded-xl border border-dashed border-surface-200">
                            <div className="text-5xl mb-4 opacity-20">📢</div>
                            <p className="text-surface-500 text-lg font-medium">No notices active.</p>
                            <p className="text-surface-400">Post an announcement to keep parents informed.</p>
                        </div>
                    )}
                </div>
            )}


            {/* Fees Tab */}
            {activeTab === 'fees' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-surface-900">Fee Management</h2>
                            <p className="text-surface-500 mt-1">Track and manage student payments.</p>
                        </div>
                    </div>

                    <Card>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-xl text-surface-900">Fee Status Dashboard</h3>
                                <p className="text-sm text-surface-500">Tap on a month to toggle payment status</p>
                            </div>
                            <div className="flex flex-wrap gap-3 items-center">
                                {/* Year Selector */}
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="input-field py-2 font-bold w-auto"
                                >
                                    <option value={2024}>2024</option>
                                    <option value={2025}>2025</option>
                                    <option value={2026}>2026</option>
                                    <option value={2027}>2027</option>
                                </select>

                                <div className="flex bg-surface-100 p-1 rounded-xl">
                                    <button onClick={() => setFeeFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${feeFilter === 'all' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>All</button>
                                    <button onClick={() => setFeeFilter('paid')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${feeFilter === 'paid' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>Paid</button>
                                    <button onClick={() => setFeeFilter('unpaid')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${feeFilter === 'unpaid' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>Unpaid</button>
                                </div>
                            </div>
                        </div>

                        {students.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4 animate-bounce">📚</div>
                                <p className="text-surface-400 text-lg">No students found. Add students first.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
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
                                    <div key={student.id} className="bg-surface-50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-surface-100 overflow-hidden group">
                                        <div className="p-5 border-b border-surface-200 bg-white">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-lg font-bold shadow-md transform group-hover:scale-110 transition-transform duration-300">
                                                    {(student.name || student.phone).charAt(0).toUpperCase()}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="font-bold text-surface-900 text-lg leading-tight truncate">{student.name || 'Unknown'}</h3>
                                                    <p className="text-sm text-surface-500 truncate">{student.father_name || 'No Father Name'}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium border border-primary-100">{student.class_name || 'No Class'}</span>
                                                        <span className="text-xs text-surface-400">{student.phone}</span>
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
                                                                    : 'bg-white text-surface-400 hover:bg-red-50 hover:text-red-500 border border-surface-200 hover:border-red-200'
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
                    </Card>
                </div>
            )}

            {/* Backup Tab */}
            {activeTab === 'backup' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-display font-bold text-surface-900">Backup & Restore</h2>
                            <p className="text-surface-500 mt-1">Secure your data with manual backups.</p>
                        </div>
                    </div>

                    <Card title="Data Management">
                        <div className="space-y-8">
                            {/* Download Backup */}
                            <div className="border-b border-surface-100 pb-8">
                                <h3 className="font-bold text-lg mb-2 text-surface-900">📥 Download Backup</h3>
                                <p className="text-surface-500 mb-4">
                                    Download a complete backup of your school's data as a JSON file. This includes students, teachers, classes, and fee records.
                                </p>
                                <button
                                    onClick={handleDownloadBackup}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <span>💾</span>
                                    <span>Download Backup Now</span>
                                </button>
                            </div>

                            {/* Restore Backup */}
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-surface-900">📤 Restore from Backup</h3>
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-r-lg">
                                    <p className="text-red-800 font-bold flex items-center gap-2">
                                        <span>⚠️</span> Warning
                                    </p>
                                    <p className="text-red-700 text-sm mt-1">
                                        Restoring a backup will <strong>permanently replace ALL</strong> of your current school data.
                                        This action cannot be undone. Please be certain before proceeding.
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-surface-700 mb-2">Select Backup File</label>
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={handleRestoreBackup}
                                        className="block w-full text-sm text-surface-500 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 file:cursor-pointer cursor-pointer border border-surface-200 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
                <SubscriptionTab
                    user={user}
                    token={token}
                    stats={{
                        studentsCount: students.length,
                        classesCount: classes.length,
                        teachersCount: teachers.length
                    }}
                />
            )}

            {/* Vehicles Tab */}
            {activeTab === 'vehicles' && (
                <VehiclesTab token={token} />
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
                <EventsTab token={token} />
            )}
        </DashboardLayout>
    );
};

export default SchoolAdminDashboard;
