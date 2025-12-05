import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Check, Star, Sparkles, Zap, Award, TrendingUp,
    Users, BookOpen, Calendar, CreditCard, Bell, Shield, BarChart,
    Smartphone, LayoutDashboard, UserCheck, FileText,
    ArrowRight, Play, MessageSquare, Heart, Target, Rocket
} from 'lucide-react';
import Navbar from '../components/Navbar';
import SEO from '../components/SEO';
import './Home.css';

const Home = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    useEffect(() => {
        window.scrollTo(0, 0);

        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const features = [
        { icon: Users, title: "Student Management", desc: "Effortlessly manage student records and profiles", gradient: "from-blue-500 to-cyan-500" },
        { icon: BookOpen, title: "Class Organization", desc: "Organize classes and sections seamlessly", gradient: "from-purple-500 to-pink-500" },
        { icon: Calendar, title: "Smart Scheduling", desc: "Automated timetables and scheduling", gradient: "from-orange-500 to-red-500" },
        { icon: CreditCard, title: "Fee Management", desc: "Complete payment tracking and reminders", gradient: "from-green-500 to-emerald-500" },
        { icon: FileText, title: "Homework Hub", desc: "Digital assignments with file uploads", gradient: "from-indigo-500 to-purple-500" },
        { icon: BarChart, title: "Analytics Dashboard", desc: "Real-time insights and performance metrics", gradient: "from-pink-500 to-rose-500" },
    ];

    const benefits = [
        { icon: Zap, title: "Lightning Fast", desc: "Optimized performance for instant access" },
        { icon: Shield, title: "Bank-Level Security", desc: "Your data is encrypted and protected" },
        { icon: Smartphone, title: "Mobile Ready", desc: "Perfect on any device, anywhere" },
        { icon: Heart, title: "Easy to Use", desc: "Intuitive interface everyone loves" },
    ];

    const stats = [
        { number: "50+", label: "Active Schools", icon: Award },
        { number: "5K+", label: "Happy Students", icon: Users },
        { number: "99.9%", label: "Uptime", icon: TrendingUp },
        { number: "24/7", label: "Support", icon: MessageSquare },
    ];

    return (
        <div className="landing-page">
            <SEO
                title="SchoolDesk - Smartest School Management Software"
                description="Streamline your school processing with SchoolDesk. Manage students, fees, exams, and more with our all-in-one cloud based platform."
                type="website"
            />
            {/* Cursor Glow Effect */}
            <div
                className="cursor-glow"
                style={{
                    left: mousePosition.x,
                    top: mousePosition.y,
                }}
            />

            <Navbar />

            {/* HERO SECTION */}
            <section className="hero-modern" ref={heroRef}>
                <div className="hero-background">
                    <div className="gradient-orb orb-1" />
                    <div className="gradient-orb orb-2" />
                    <div className="gradient-orb orb-3" />
                </div>

                <div className="hero-content-wrapper">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="hero-badge"
                    >
                        <Sparkles size={16} />
                        <span>The Future of School Management</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="hero-title-modern"
                    >
                        Manage Your School
                        <span className="gradient-text-shine"> Like Never Before</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="hero-description"
                    >
                        SchoolDesk is the all-in-one platform that brings schools, teachers, students,
                        and parents together. Experience seamless management with powerful features.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="hero-cta-group"
                    >
                        <Link to="/signup" className="cta-modern cta-gradient">
                            <span>Start Free Trial</span>
                            <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="cta-modern cta-glass">
                            <Play size={20} />
                            <span>Watch Demo</span>
                        </Link>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="hero-stats"
                    >
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item">
                                <stat.icon size={24} className="stat-icon" />
                                <div>
                                    <div className="stat-number">{stat.number}</div>
                                    <div className="stat-label">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* FEATURES SECTION */}
            <section id="features" className="features-modern">
                <div className="container-modern">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="section-header-modern"
                    >
                        <div className="section-badge">
                            <Target size={16} />
                            <span>Powerful Features</span>
                        </div>
                        <h2 className="section-title-modern">
                            Everything You Need, <span className="gradient-text-shine">All in One Place</span>
                        </h2>
                        <p className="section-description">
                            From attendance to analytics, SchoolDesk has every tool you need to run your institution efficiently
                        </p>
                    </motion.div>

                    <div className="features-grid-modern">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="feature-card-modern"
                            >
                                <div className={`feature-icon-wrapper gradient-${feature.gradient}`}>
                                    <feature.icon size={28} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.desc}</p>
                                <div className="feature-hover-glow" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BENEFITS SECTION */}
            <section className="benefits-section">
                <div className="container-modern">
                    <div className="benefits-grid">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="benefits-content"
                        >
                            <div className="section-badge">
                                <Rocket size={16} />
                                <span>Why Choose Us</span>
                            </div>
                            <h2 className="section-title-modern">
                                Built for <span className="gradient-text-shine">Modern Schools</span>
                            </h2>
                            <p className="section-description">
                                We've designed SchoolDesk with cutting-edge technology to provide
                                the best experience for everyone in your educational ecosystem.
                            </p>

                            <div className="benefits-list">
                                {benefits.map((benefit, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="benefit-item"
                                    >
                                        <div className="benefit-icon">
                                            <benefit.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="benefit-title">{benefit.title}</h4>
                                            <p className="benefit-description">{benefit.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <Link to="/signup" className="cta-modern cta-gradient mt-8">
                                <span>Get Started Now</span>
                                <ArrowRight size={20} />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="benefits-visual"
                        >
                            <div className="visual-card card-1">
                                <LayoutDashboard size={48} />
                                <span>Smart Dashboard</span>
                            </div>
                            <div className="visual-card card-2">
                                <Bell size={48} />
                                <span>Instant Notifications</span>
                            </div>
                            <div className="visual-card card-3">
                                <BarChart size={48} />
                                <span>Performance Tracking</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* PRICING SECTION */}
            <section id="pricing" className="pricing-modern">
                <div className="container-modern">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="section-header-modern"
                    >
                        <div className="section-badge">
                            <Star size={16} />
                            <span>Pricing Plans</span>
                        </div>
                        <h2 className="section-title-modern">
                            Simple, <span className="gradient-text-shine">Transparent Pricing</span>
                        </h2>
                        <p className="section-description">
                            Choose the perfect plan for your school. No hidden fees, cancel anytime.
                        </p>
                    </motion.div>

                    <div className="pricing-grid">
                        {/* Trial */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -12, scale: 1.02 }}
                            className="pricing-card"
                        >
                            <h3 className="pricing-name">Trial</h3>
                            <div className="pricing-price">
                                <span className="price-amount">FREE</span>
                            </div>
                            <p className="pricing-duration">14 Days Trial</p>
                            <ul className="pricing-features">
                                <li><Check size={20} /> 2 Classes</li>
                                <li><Check size={20} /> 20 Students</li>
                                <li><Check size={20} /> Homework</li>
                                <li><Check size={20} /> Notices</li>
                                <li><Check size={20} /> Fee Status (View Only)</li>
                                <li><Check size={20} /> Parent Access</li>
                            </ul>
                            <Link to="/signup" className="pricing-cta">Start Free Trial</Link>
                        </motion.div>

                        {/* Basic */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ y: -12, scale: 1.02 }}
                            className="pricing-card"
                        >
                            <h3 className="pricing-name">Basic</h3>
                            <div className="pricing-price">
                                <span className="currency">₹</span>
                                <span className="price-amount">499</span>
                                <span className="period">/mo</span>
                            </div>
                            <p className="pricing-duration">Perfect for small schools</p>
                            <ul className="pricing-features">
                                <li><Check size={20} /> Up to 8 Classes</li>
                                <li><Check size={20} /> Up to 100 Students</li>
                                <li><Check size={20} /> Homework</li>
                                <li><Check size={20} /> Notices</li>
                                <li><Check size={20} /> Fee Management</li>
                                <li><Check size={20} /> Events</li>
                                <li><Check size={20} /> Parent App</li>
                                <li><Check size={20} /> Teacher App</li>
                            </ul>
                            <Link to="/signup" className="pricing-cta">Choose Basic</Link>
                        </motion.div>

                        {/* Standard */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ y: -12, scale: 1.02 }}
                            className="pricing-card pricing-popular"
                        >
                            <div className="popular-badge">POPULAR</div>
                            <h3 className="pricing-name">Standard</h3>
                            <div className="pricing-price">
                                <span className="currency">₹</span>
                                <span className="price-amount">799</span>
                                <span className="period">/mo</span>
                            </div>
                            <p className="pricing-duration">For growing institutions</p>
                            <ul className="pricing-features">
                                <li><Check size={20} /> Up to 15 Classes</li>
                                <li><Check size={20} /> Up to 300 Students</li>
                                <li><Check size={20} /> Transport Module</li>
                                <li><Check size={20} /> Fee Management</li>
                                <li><Check size={20} /> Marks</li>
                                <li><Check size={20} /> Events</li>
                                <li><Check size={20} /> Homework</li>
                                <li><Check size={20} /> Notices</li>
                            </ul>
                            <Link to="/signup" className="pricing-cta pricing-cta-gradient">Choose Standard</Link>
                        </motion.div>

                        {/* Premium */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ y: -12, scale: 1.02 }}
                            className="pricing-card"
                        >
                            <h3 className="pricing-name">Premium</h3>
                            <div className="pricing-price">
                                <span className="currency">₹</span>
                                <span className="price-amount">999</span>
                                <span className="period">/mo</span>
                            </div>
                            <p className="pricing-duration">Complete solution</p>
                            <ul className="pricing-features">
                                <li><Check size={20} /> Unlimited Classes</li>
                                <li><Check size={20} /> Unlimited Students</li>
                                <li><Check size={20} /> All Admin Features</li>
                                <li><Check size={20} /> All Teacher Features</li>
                                <li><Check size={20} /> All Parent Features</li>
                                <li><Check size={20} /> Transport</li>
                                <li><Check size={20} /> Marks & Performance</li>
                                <li><Check size={20} /> Priority Support</li>
                            </ul>
                            <Link to="/signup" className="pricing-cta">Choose Premium</Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS SECTION */}
            <section id="contact" className="testimonials-section">
                <div className="container-modern">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="section-header-modern"
                    >
                        <div className="section-badge">
                            <Heart size={16} />
                            <span>Loved by Schools</span>
                        </div>
                        <h2 className="section-title-modern">
                            What <span className="gradient-text-shine">Educators Say</span>
                        </h2>
                        <p className="section-description">
                            Hear from school administrators and teachers who've transformed their institutions with SchoolDesk
                        </p>
                    </motion.div>

                    <div className="testimonials-grid">
                        {[
                            {
                                name: "Priya Sharma",
                                role: "Principal",
                                school: "Saraswati Vidya Mandir, Satna",
                                image: "PS",
                                rating: 5,
                                text: "SchoolDesk has completely transformed how we manage our school. The fee management system alone has saved us countless hours. Parents love the real-time updates!"
                            },
                            {
                                name: "Rajesh Kumar",
                                role: "School Administrator",
                                school: "Little Angels School, Bihar Sharif",
                                image: "RK",
                                rating: 5,
                                text: "We switched from paper-based records to SchoolDesk 6 months ago. Best decision ever! Everything is now organized, and we can access data from anywhere."
                            },
                            {
                                name: "Anjali Patel",
                                role: "Head Teacher",
                                school: "Gyan Ganga Public School, Raigarh",
                                image: "AP",
                                rating: 5,
                                text: "As a teacher, I love how easy it is to upload homework and track attendance. The parent app keeps everyone connected. Highly recommended!"
                            },
                            {
                                name: "Vikram Singh",
                                role: "Director",
                                school: "Sunshine Academy, Deoghar",
                                image: "VS",
                                rating: 5,
                                text: "The analytics dashboard gives us insights we never had before. We can now track student performance and make data-driven decisions. Outstanding platform!"
                            },
                            {
                                name: "Meera Reddy",
                                role: "Academic Coordinator",
                                school: "Adarsh Vidya Niketan, Hardoi",
                                image: "MR",
                                rating: 5,
                                text: "SchoolDesk made our school paperless! The transport module is fantastic - parents can track their child's bus in real-time. Great support team too!"
                            },
                            {
                                name: "Arjun Gupta",
                                role: "Principal",
                                school: "Blooming Buds School, Siliguri",
                                image: "AG",
                                rating: 5,
                                text: "We manage 500+ students effortlessly now. The automated fee reminders and digital report cards have improved our efficiency by 80%. Worth every rupee!"
                            }
                        ].map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="testimonial-card"
                            >
                                <div className="testimonial-header">
                                    <div className="testimonial-avatar">
                                        <div className="avatar-circle">{testimonial.image}</div>
                                    </div>
                                    <div className="testimonial-info">
                                        <h4 className="testimonial-name">{testimonial.name}</h4>
                                        <p className="testimonial-role">{testimonial.role}</p>
                                        <p className="testimonial-school">{testimonial.school}</p>
                                    </div>
                                </div>
                                <div className="testimonial-rating">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={16} className="star-filled" />
                                    ))}
                                </div>
                                <p className="testimonial-text">"{testimonial.text}"</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="testimonials-cta"
                    >
                        <Link to="/signup" className="cta-modern cta-gradient">
                            <span>Start Free Trial</span>
                            <ArrowRight size={20} />
                        </Link>
                        <a href="mailto:schooldesk18@gmail.com" className="cta-modern cta-glass">
                            <MessageSquare size={20} />
                            <span>Contact Sales</span>
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
