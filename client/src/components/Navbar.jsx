import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X as CloseIcon } from 'lucide-react';
import logo from '../assets/logo.png';
import '../pages/Home.css'; // Ensure we have access to the styles

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavigation = (sectionId) => {
        if (location.pathname === '/') {
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/', { state: { scrollTo: sectionId } });
        }
        setMobileMenuOpen(false);
    };

    // Handle scroll on mount if navigating from another page
    useEffect(() => {
        if (location.state && location.state.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
            // Clear state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#0a0e27]/95 backdrop-blur-xl border-b border-white/10 shadow-lg' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-2 cursor-pointer logo-container" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 relative">
                            <img src={logo} alt="SchoolDesk" className="w-full h-full object-contain rounded-lg" />
                        </div>
                        <span className="text-xl font-bold gradient-text-animated whitespace-nowrap">SchoolDesk</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        {['Features', 'Pricing', 'Contact'].map((item) => (
                            <button
                                key={item}
                                onClick={() => handleNavigation(item.toLowerCase())}
                                className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
                            >
                                {item}
                            </button>
                        ))}
                        <Link to="/partner/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium whitespace-nowrap">Partner Login</Link>
                        <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm font-medium">Login</Link>
                        <Link to="/signup" className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all whitespace-nowrap">
                            Start Free Trial
                        </Link>
                    </div>

                    <button className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden mobile-menu">
                        {['Features', 'Pricing', 'Contact'].map((item) => (
                            <button
                                key={item}
                                onClick={() => handleNavigation(item.toLowerCase())}
                                className="mobile-menu-item"
                            >
                                {item}
                            </button>
                        ))}
                        <Link to="/partner/login" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>Partner Login</Link>
                        <Link to="/login" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                        <Link to="/signup" className="mobile-menu-cta" onClick={() => setMobileMenuOpen(false)}>Start Free Trial</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
