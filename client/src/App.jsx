import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import Login from './pages/Login';
import SchoolSignup from './pages/SchoolSignup';
import AdminLogin from './pages/AdminLogin';
import AppDashboard from './pages/AppDashboard';
import SuperAdminLogin from './pages/SuperAdmin/Login';
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import SchoolAdminDashboard from './pages/SchoolAdmin/Dashboard';
import TeacherDashboard from './pages/Teacher/Dashboard';
import ParentDashboard from './pages/Parent/Dashboard';
import PartnerLogin from './pages/Partner/Login';
import PartnerDashboard from './pages/Partner/Dashboard';

// New Pages
import About from './pages/About';
import Contact from './pages/Contact';
import { Terms, Privacy, Refund, Disclaimer } from './pages/LegalPages';
import Footer from './components/Footer';

const PrivateRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (role && user.role !== role) {
        return <Navigate to="/app" replace />;
    }

    return children;
};

const PrivatePartnerRoute = ({ children }) => {
    const token = localStorage.getItem('partnerToken');

    if (!token) {
        return <Navigate to="/partner/login" replace />;
    }

    return children;
};

function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <Router>
                    <div className="flex flex-col min-h-screen">
                        <Routes>
                            {/* Public Routes with Footer */}
                            <Route path="/" element={<><Home /><Footer /></>} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<SchoolSignup />} />
                            <Route path="/admin-secret-login" element={<AdminLogin />} />
                            <Route path="/secretsadmin" element={<SuperAdminLogin />} />
                            <Route path="/partner/login" element={<PartnerLogin />} />

                            {/* Information Pages with Footer */}
                            <Route path="/about" element={<><About /><Footer /></>} />
                            <Route path="/contact" element={<><Contact /><Footer /></>} />
                            <Route path="/terms" element={<><Terms /><Footer /></>} />
                            <Route path="/privacy" element={<><Privacy /><Footer /></>} />
                            <Route path="/refund" element={<><Refund /><Footer /></>} />
                            <Route path="/disclaimer" element={<><Disclaimer /><Footer /></>} />

                            {/* Partner Dashboard Routes */}
                            <Route path="/partner/dashboard/*" element={
                                <PrivatePartnerRoute>
                                    <PartnerDashboard />
                                </PrivatePartnerRoute>
                            } />

                            {/* Payment Verification Redirect - preserves query params */}
                            <Route path="/payment/verify" element={
                                <PrivateRoute role="school_admin">
                                    <SchoolAdminDashboard initialTab="subscription" />
                                </PrivateRoute>
                            } />

                            {/* Unified App Route */}
                            <Route path="/app" element={
                                <PrivateRoute>
                                    <AppDashboard />
                                </PrivateRoute>
                            } />

                            {/* Super Admin Routes */}
                            <Route path="/super-admin/dashboard" element={
                                <PrivateRoute role="super_admin">
                                    <SuperAdminDashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/superadmin" element={
                                <PrivateRoute role="super_admin">
                                    <SuperAdminDashboard />
                                </PrivateRoute>
                            } />

                            {/* Legacy Routes (Redirect to /app or keep for direct access) */}
                            <Route path="/school-admin" element={
                                <PrivateRoute role="school_admin">
                                    <SchoolAdminDashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/teacher" element={
                                <PrivateRoute role="teacher">
                                    <TeacherDashboard />
                                </PrivateRoute>
                            } />
                            <Route path="/parent" element={
                                <PrivateRoute role="parent">
                                    <ParentDashboard />
                                </PrivateRoute>
                            } />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </div>
                </Router>
            </AuthProvider>
        </HelmetProvider>
    );
}

export default App;
