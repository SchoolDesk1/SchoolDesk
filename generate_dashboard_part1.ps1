# PowerShell script to generate complete Dashboard.jsx
$outputPath = "client\src\pages\SchoolAdmin\Dashboard_COMPLETE.jsx"

$dashboardContent = @'
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import SubscriptionTab from './SubscriptionTab';

const SchoolAdminDashboard = () => {
    const { user, token, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('students');
    const [classes, setClasses] = useState([]);
    const [notices, setNotices] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [fees, setFees] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Form States  
    const [newClassName, setNewClassName] = useState('');
    const [classPassword, setClassPassword] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [teacherClassFilter, setTeacherClassFilter] = useState('');
    const [feeFilter, setFeeFilter] = useState('all');

    const [newStudent, setNewStudent] = useState({
        name: '', phone: '', contact_phone: '', address: '', role: 'parent',
        class_id: '', feeAmount: '', father_name: ''
    });

    const [newTeacher, setNewTeacher] = useState({
        name: '', phone: '', contact_phone: '', address: '', role: 'teacher', class_id: ''
    });

    const [newNotice, setNewNotice] = useState({ text: '', classId: '', duration: '7' });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Fetch Functions
    useEffect(() => {
        fetchClasses();
        fetchNotices();
        fetchFees();
    }, []);

    useEffect(() => {
        if (activeTab === 'students') fetchStudents();
        if (activeTab === 'teachers') fetchTeachers();
    }, [activeTab, classFilter, teacherClassFilter]);

    const fetchClasses = async () => {
        try {
            const res = await fetch('/api/school/classes', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setClasses(Array.isArray(data) ? data : []);
        } catch (err) {
            setClasses([]);
        }
    };

    const fetchNotices = async () => {
        try {
            const res = await fetch('/api/school/notices', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setNotices(Array.isArray(data) ? data : []);
        } catch (err) {
            setNotices([]);
        }
    };

    const fetchStudents = async () => {
        try {
            const url = classFilter
                ? `/api/school/users?role=parent&class_id=${classFilter}`
                : '/api/school/users?role=parent';
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setStudents(Array.isArray(data) ? data : []);
        } catch (err) {
            setStudents([]);
        }
    };

    const fetchTeachers = async () => {
        try {
            const url = teacherClassFilter
                ? `/api/school/users?role=teacher&class_id=${teacherClassFilter}`
                : '/api/school/users?role=teacher';
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setTeachers(Array.isArray(data) ? data : []);
        } catch (err) {
            setTeachers([]);
        }
    };

    const fetchFees = async () => {
        try {
            const res = await fetch('/api/school/fees/list', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setFees(Array.isArray(data) ? data : []);
        } catch (err) {
            setFees([]);
        }
    };

    // Handler Functions
    const handleCreateClass = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/school/create-class', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    class_name: newClassName,
                    class_password: classPassword
                })
            });
            if (res.ok) {
                fetchClasses();
                setNewClassName('');
                setClassPassword('');
            }
        } catch (err) { console.error('Error creating class:', err); }
    };

    const handleCreateNotice = async (e) => {
        e.preventDefault();
        try {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + parseInt(newNotice.duration));

            const res = await fetch('/api/school/create-notice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    notice_text: newNotice.text,
                    class_id: newNotice.classId || null,
                    expiry_date: expiryDate.toISOString().split('T')[0]
                })
            });
            if (res.ok) {
                fetchNotices();
                setNewNotice({ text: '', classId: '', duration: '7' });
            }
        } catch (err) { console.error('Error creating notice:', err); }
    };

    const handleDeleteNotice = async (id) => {
        if (!window.confirm('Delete this notice?')) return;
        try {
            const res = await fetch(`/api/school/notices/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchNotices();
        } catch (err) { console.error('Error deleting notice:', err); }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();
        try {
            const url = newStudent.id
                ? `/api/school/users/${newStudent.id}`
                : '/api/school/create-user';
            const method = newStudent.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newStudent,
                    fee_amount: newStudent.feeAmount || 0
                })
            });
            if (res.ok) {
                fetchStudents();
                setNewStudent({ name: '', phone: '', contact_phone: '', address: '', role: 'parent', class_id: '', feeAmount: '', father_name: '' });
            }
        } catch (err) { console.error('Error with student:', err); }
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        try {
            const url = newTeacher.id
                ? `/api/school/users/${newTeacher.id}`
                : '/api/school/create-user';
            const method = newTeacher.id ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newTeacher)
            });
            if (res.ok) {
                fetchTeachers();
                setNewTeacher({ name: '', phone: '', contact_phone: '', address: '', role: 'teacher', class_id: '' });
            }
        } catch (err) { console.error('Error with teacher:', err); }
    };

    const handleDeleteStudent = async (studentId) => {
        if (!window.confirm('Delete this student?')) return;
        try {
            const res = await fetch(`/api/school/users/${studentId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchStudents();
        } catch (err) { console.error('Error deleting student:', err); }
    };

    const handleDeleteTeacher = async (teacherId) => {
        if (!window.confirm('Delete this teacher?')) return;
        try {
            const res = await fetch(`/api/school/users/${teacherId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchTeachers();
        } catch (err) { console.error('Error deleting teacher:', err); }
    };

    const handleDownloadBackup = async () => {
        try {
            const res = await fetch('/api/school/backup/download', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `school-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) { console.error('Error downloading backup:', err); }
    };

    const handleRestoreBackup = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!window.confirm('This will replace ALL current data. Continue?')) {
            e.target.value = '';
            return;
        }
        try {
            const text = await file.text();
            const res = await fetch('/api/school/backup/restore', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: text
            });
            if (res.ok) {
                alert('Backup restored successfully');
                window.location.reload();
            }
        } catch (err) { console.error('Error restoring backup:', err); }
    };

    // Continued in Dashboard_Part2.txt due to length...
'@

Write-Output $dashboardContent | Out-File -FilePath $outputPath -Encoding UTF8
Write-Host "Part 1 created. File size: $((Get-Item $outputPath).Length) bytes"
