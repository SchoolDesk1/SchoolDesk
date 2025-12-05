import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import SchoolAdminDashboard from './SchoolAdmin/Dashboard';
import TeacherDashboard from './Teacher/Dashboard';
import ParentDashboard from './Parent/Dashboard';

const AppDashboard = () => {
    const { user } = useAuth();

    // If not logged in, redirect to login
    if (!user) return <Navigate to="/login" />;

    // Route based on role
    switch (user.role) {
        case 'school_admin':
            return <SchoolAdminDashboard />;
        case 'teacher':
            return <TeacherDashboard />;
        case 'parent':
            return <ParentDashboard />;
        default:
            // Fallback for unknown roles or if something goes wrong
            return <Navigate to="/login" />;
    }
};

export default AppDashboard;
