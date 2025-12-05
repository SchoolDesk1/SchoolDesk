import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    School,
    Wallet,
    Settings,
    LogOut,
    Menu,
    X,
    GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PartnerHome from './Home';
import PartnerSchoolsList from './SchoolsList';
import PartnerCommissions from './Commissions';
import PartnerSettings from './Settings';

const PartnerDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const partnerData = JSON.parse(localStorage.getItem('partnerData') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('partnerToken');
        localStorage.removeItem('partnerData');
        navigate('/partner/login');
    };

    const navItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Overview', path: '/partner/dashboard' },
        { icon: <School size={20} />, label: 'My Schools', path: '/partner/dashboard/schools' },
        { icon: <Wallet size={20} />, label: 'Commissions', path: '/partner/dashboard/commissions' },
        { icon: <Settings size={20} />, label: 'Settings', path: '/partner/dashboard/settings' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 80 }}
                className={`bg-white border-r border-gray-200 fixed md:relative z-30 h-full hidden md:flex flex-col transition-all duration-300`}
            >
                <div className="p-6 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="text-white h-6 w-6" />
                    </div>
                    {sidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
                        >
                            Partner
                        </motion.span>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                {item.icon}
                                {sidebarOpen && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        {item.label}
                                    </motion.span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all w-full ${!sidebarOpen && 'justify-center'
                            }`}
                    >
                        <LogOut size={20} />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white border-b border-gray-200 z-30 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <GraduationCap className="text-white h-5 w-5" />
                    </div>
                    <span className="font-bold text-lg">Partner Portal</span>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 bg-white z-20 pt-20 px-4 md:hidden"
                    >
                        <nav className="space-y-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-4 rounded-xl text-lg ${location.pathname === item.path
                                            ? 'bg-indigo-50 text-indigo-600 font-semibold'
                                            : 'text-gray-500'
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-4 rounded-xl text-lg text-red-500 w-full"
                            >
                                <LogOut size={20} />
                                Logout
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto h-screen pt-16 md:pt-0">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <header className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome back, {partnerData.name?.split(' ')[0]}!
                            </h1>
                            <p className="text-gray-500">Here's what's happening with your schools today.</p>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <div className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 shadow-sm">
                                Code: <span className="text-indigo-600 font-bold">{partnerData.uniqueCode}</span>
                            </div>
                        </div>
                    </header>

                    <Routes>
                        <Route path="/" element={<PartnerHome />} />
                        <Route path="/schools" element={<PartnerSchoolsList />} />
                        <Route path="/commissions" element={<PartnerCommissions />} />
                        <Route path="/settings" element={<PartnerSettings />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default PartnerDashboard;
