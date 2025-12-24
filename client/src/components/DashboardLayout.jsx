import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png'; // Assuming logo exists here or adjust path

const DashboardLayout = ({ children, menuItems, activeTab, onTabChange, role, userProfile }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-surface-50 flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-sidebar transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="p-8 flex items-center gap-3 border-b border-white/5">
                        {/* Fallback to text if logo missing, but trying to use logic from prev dashboards */}
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl shadow-glow">
                            S
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold text-white tracking-tight">SchoolDesk</h1>
                            <p className="text-xs text-surface-400 font-medium tracking-wide uppercase">{role} Portal</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
                        {menuItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onTabChange(item.id);
                                    setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${activeTab === item.id
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20'
                                        : 'text-surface-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <span className="text-xl relative z-10">{item.icon}</span>
                                <span className="font-medium relative z-10">{item.label}</span>
                                {activeTab === item.id && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-100 z-0" />
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* User Profile Footer */}
                    <div className="p-4 border-t border-white/5 bg-black/20">
                        {userProfile && (
                            <div className="mb-4 px-2">
                                <p className="text-white font-medium truncate">{userProfile.name}</p>
                                <p className="text-xs text-surface-400 truncate">{userProfile.detail}</p>
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                            <span>🚪</span>
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-surface-200 p-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="font-bold text-lg text-surface-900">SchoolDesk</div>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-surface-600 hover:bg-surface-100 rounded-lg"
                    >
                        ☰
                    </button>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
