import React from 'react';
import { Link } from 'react-router-dom';
import { School, Home as HomeIcon } from 'lucide-react';
import logo from '../assets/logo.png';

import SEO from '../components/SEO';

const About = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            <SEO
                title="About SchoolDesk - Simplifying School Management"
                description="Learn more about SchoolDesk, our mission to transform education management, and the team behind the platform."
            />
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2">
                        <img src={logo} alt="SchoolDesk" className="h-10 w-10" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            SchoolDesk
                        </span>
                    </Link>
                    <Link to="/" className="flex items-center text-indigo-600 hover:text-indigo-700">
                        <HomeIcon size={20} className="mr-1" />
                        Back to Home
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    About SchoolDesk
                </h1>

                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-6">
                    <div className="text-center mb-8">
                        <School className="mx-auto text-indigo-600 mb-4" size={64} />
                        <p className="text-xl text-gray-600 italic">
                            "A simple way to manage your school."
                        </p>
                    </div>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Who We Are</h2>
                        <p className="text-gray-700 leading-relaxed">
                            SchoolDesk is a modern school management platform designed to simplify daily operations for schools,
                            teachers, students, and parents. We believe that managing a school should be easy, efficient, and
                            accessible to everyone, regardless of technical expertise.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
                        <p className="text-gray-700 leading-relaxed">
                            Our mission is to empower educational institutions worldwide with a simple, affordable, and powerful
                            platform that brings together students, teachers, parents, and administrators in one unified system.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            We eliminate paperwork, reduce confusion, and help schools focus on what matters most – education.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">What We Offer</h2>
                        <ul className="space-y-3 text-gray-700">
                            <li className="flex items-start">
                                <span className="text-indigo-600 mr-2">✓</span>
                                <span><strong>Complete School Management:</strong> Classes, students, teachers, fees, attendance, and more</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-indigo-600 mr-2">✓</span>
                                <span><strong>Easy Communication:</strong> Homework, notices, and updates shared instantly</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-indigo-600 mr-2">✓</span>
                                <span><strong>Mobile-First Design:</strong> Works seamlessly on phones, tablets, and computers</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-indigo-600 mr-2">✓</span>
                                <span><strong>Affordable Pricing:</strong> Plans starting from ₹499/month</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-indigo-600 mr-2">✓</span>
                                <span><strong>Free Trial:</strong> Try all features free for 14 days</span>
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Who Uses SchoolDesk?</h2>
                        <p className="text-gray-700 leading-relaxed">
                            SchoolDesk is perfect for:
                        </p>
                        <ul className="grid md:grid-cols-2 gap-3 text-gray-700">
                            <li className="flex items-center">
                                <span className="text-indigo-600 mr-2">•</span>
                                Schools of all sizes
                            </li>
                            <li className="flex items-center">
                                <span className="text-indigo-600 mr-2">•</span>
                                Coaching centers
                            </li>
                            <li className="flex items-center">
                                <span className="text-indigo-600 mr-2">•</span>
                                Small academies
                            </li>
                            <li className="flex items-center">
                                <span className="text-indigo-600 mr-2">•</span>
                                Educational institutions
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Why Choose SchoolDesk?</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-indigo-50 p-6 rounded-xl">
                                <h3 className="font-bold text-indigo-900 mb-2">Simple to Use</h3>
                                <p className="text-gray-700 text-sm">
                                    No technical knowledge required. Anyone can start using SchoolDesk in minutes.
                                </p>
                            </div>
                            <div className="bg-purple-50 p-6 rounded-xl">
                                <h3 className="font-bold text-purple-900 mb-2">Fast & Reliable</h3>
                                <p className="text-gray-700 text-sm">
                                    Built with modern technology for speed and reliability. Works on any device.
                                </p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-xl">
                                <h3 className="font-bold text-green-900 mb-2">Affordable</h3>
                                <p className="text-gray-700 text-sm">
                                    Transparent pricing. No hidden fees. Plans for every budget.
                                </p>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-xl">
                                <h3 className="font-bold text-blue-900 mb-2">Secure</h3>
                                <p className="text-gray-700 text-sm">
                                    Your data is protected with industry-standard security measures.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-2xl text-center">
                        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
                        <p className="mb-6">Join hundreds of schools already using SchoolDesk.</p>
                        <Link to="/signup" className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                            Start Free Trial
                        </Link>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default About;
