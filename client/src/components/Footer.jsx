import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

// Custom X Logo Component
const XLogo = ({ size = 24, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Company Info */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white mb-4">SchoolDesk</h3>
                        <p className="text-gray-400 leading-relaxed">
                            A simple way to manage your school. Works on any device. Secure. Fast.
                        </p>
                        <div className="flex space-x-4 pt-4">
                            <a href="https://instagram.com/schooldesk11" target="_blank" rel="noopener noreferrer"
                                className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 hover:text-white transition-all duration-300">
                                <Instagram size={20} />
                            </a>
                            <a href="https://www.facebook.com/share/1CB3y2JVUW/" target="_blank" rel="noopener noreferrer"
                                className="bg-gray-800 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300">
                                <Facebook size={20} />
                            </a>
                            <a href="https://www.linkedin.com/company/school-desk/" target="_blank" rel="noopener noreferrer"
                                className="bg-gray-800 p-2 rounded-full hover:bg-blue-700 hover:text-white transition-all duration-300">
                                <Linkedin size={20} />
                            </a>
                            <a href="https://x.com/SchoolDesk11" target="_blank" rel="noopener noreferrer"
                                className="bg-gray-800 p-2 rounded-full hover:bg-black hover:text-white transition-all duration-300">
                                <XLogo size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/about" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/contact" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link to="/partner/login" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                                    Partner Login
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Legal</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/terms" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/refund" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                                    Refund & Cancellation
                                </Link>
                            </li>
                            <li>
                                <Link to="/disclaimer" className="hover:text-white hover:translate-x-1 transition-all duration-200 inline-block">
                                    Disclaimer
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3">
                                <Mail className="text-indigo-400 mt-1" size={18} />
                                <a href="mailto:schooldesk18@gmail.com" className="hover:text-white transition-colors">
                                    schooldesk18@gmail.com
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="text-indigo-400 mt-1" size={18} />
                                <a href="tel:+916295801248" className="hover:text-white transition-colors">
                                    +91 6295801248
                                </a>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="text-indigo-400 mt-1" size={18} />
                                <span>Kolkata, West Bengal, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 mt-8 text-center text-sm text-gray-500">
                    <p>&copy; {currentYear} SchoolDesk. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
