import React from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon } from 'lucide-react';
import logo from '../assets/logo.png';
import SEO from '../components/SEO';

const LegalPage = ({ title, content, description }) => {
    return (
        <div className="min-h-screen bg-[#0a0e27] text-white selection:bg-purple-500/30">
            <SEO title={`${title} - SchoolDesk`} description={description || `${title} for SchoolDesk platform.`} />
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-[#0a0e27]/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity" />
                                <img src={logo} alt="SchoolDesk" className="w-full h-full object-contain relative z-10 rounded-lg" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                                SchoolDesk
                            </span>
                        </Link>
                        <Link
                            to="/"
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-gray-300 hover:text-white"
                        >
                            <HomeIcon size={18} />
                            <span>Back to Home</span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-white drop-shadow-lg">
                        {title}
                    </h1>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000" />
                        <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
                            <div className="prose prose-invert prose-lg max-w-none">
                                {content}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Terms = () => (
    <LegalPage
        title="Terms & Conditions"
        content={
            <div className="space-y-6 text-gray-300">
                <p className="text-sm text-gray-400">Last Updated: January 2025</p>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using SchoolDesk ("the Service"), you accept and agree to be bound by the
                        terms and provision of this agreement. If you do not agree to these Terms & Conditions,
                        please do not use our Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. Use of Service</h2>
                    <p className="mb-3">SchoolDesk provides a school management platform for:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>School administrators to manage classes, students, teachers, fees, and attendance</li>
                        <li>Teachers to upload homework, post notices, and track student progress</li>
                        <li>Parents to view their child's homework, notices, fees, and attendance</li>
                        <li>Students to access homework, timetables, and performance data</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
                    <p className="mb-3">When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>Safeguarding your password</li>
                        <li>All activities that occur under your account</li>
                        <li>Notifying us immediately of any unauthorized use</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Subscription and Payments</h2>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>Free trial: 14 days with 2 classes and 20 students</li>
                        <li>Paid plans are billed monthly in advance</li>
                        <li>Prices are subject to change with 30 days notice</li>
                        <li>Refunds are handled according to our Refund & Cancellation Policy</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Prohibited Uses</h2>
                    <p className="mb-3">You may not use SchoolDesk to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>Violate any laws or regulations</li>
                        <li>Share inappropriate or harmful content</li>
                        <li>Attempt to gain unauthorized access to the Service</li>
                        <li>Interfere with or disrupt the Service</li>
                        <li>Use the Service for any illegal or unauthorized purpose</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
                    <p>
                        The Service and its original content, features, and functionality are owned by SchoolDesk
                        and are protected by international copyright, trademark, and other intellectual property laws.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
                    <p>
                        SchoolDesk shall not be liable for any indirect, incidental, special, consequential, or
                        punitive damages resulting from your use or inability to use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. We will notify users of any changes
                        by posting the new Terms & Conditions on this page.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
                    <p>
                        If you have any questions about these Terms & Conditions, please contact us at:
                    </p>
                    <p className="mt-2">
                        Email: <a href="mailto:schooldesk18@gmail.com" className="text-purple-400 hover:text-purple-300 hover:underline">schooldesk18@gmail.com</a><br />
                        Phone: <a href="tel:+916295801248" className="text-purple-400 hover:text-purple-300 hover:underline">+91 6295801248</a>
                    </p>
                </section>
            </div>
        }
    />
);

export const Privacy = () => (
    <LegalPage
        title="Privacy Policy"
        content={
            <div className="space-y-6 text-gray-300">
                <p className="text-sm text-gray-400">Last Updated: January 2025</p>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                    <p className="mb-3">We collect information you provide directly to us, including:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li><strong>School Information:</strong> School name, email, contact details, address</li>
                        <li><strong>Student Information:</strong> Name, class, section, attendance records</li>
                        <li><strong>Parent Information:</strong> Name, phone number, email</li>
                        <li><strong>Teacher Information:</strong> Name, phone number, subjects taught</li>
                        <li><strong>Usage Data:</strong> How you interact with our Service</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
                    <p className="mb-3">We use the information we collect to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>Provide, maintain, and improve our Service</li>
                        <li>Process transactions and send related information</li>
                        <li>Send technical notices, updates, and support messages</li>
                        <li>Respond to your comments and questions</li>
                        <li>Monitor and analyze trends and usage</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing</h2>
                    <p>
                        We do not sell, trade, or rent your personal information to third parties. We may share
                        your information only in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-3 text-gray-300">
                        <li>With your consent</li>
                        <li>To comply with legal obligations</li>
                        <li>To protect our rights and safety</li>
                        <li>With service providers who assist us in operating our Service</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                    <p>
                        We implement appropriate security measures to protect your personal information. However,
                        no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Data Retention</h2>
                    <p>
                        We retain your information for as long as your account is active or as needed to provide
                        you services. If you wish to delete your account, please contact us.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                    <p className="mb-3">You have the right to:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>Access your personal information</li>
                        <li>Correct inaccurate information</li>
                        <li>Request deletion of your information</li>
                        <li>Object to processing of your information</li>
                        <li>Export your data</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">7. Children's Privacy</h2>
                    <p>
                        Our Service is designed for use by schools and educational institutions. Student data is
                        collected and managed by schools, and we act as a data processor on their behalf.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Privacy Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by
                        posting the new Privacy Policy on this page.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">9. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, contact us at:
                    </p>
                    <p className="mt-2">
                        Email: <a href="mailto:schooldesk18@gmail.com" className="text-purple-400 hover:text-purple-300 hover:underline">schooldesk18@gmail.com</a><br />
                        Phone: <a href="tel:+916295801248" className="text-purple-400 hover:text-purple-300 hover:underline">+91 6295801248</a>
                    </p>
                </section>
            </div>
        }
    />
);

export const Refund = () => (
    <LegalPage
        title="Refund & Cancellation Policy"
        content={
            <div className="space-y-6 text-gray-300">
                <p className="text-sm text-gray-400">Last Updated: January 2025</p>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Free Trial</h2>
                    <p>
                        We offer a 14-day free trial with access to 2 classes and 20 students. No credit card is
                        required. You can cancel anytime during the trial period without any charges.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. Monthly Subscriptions</h2>
                    <p className="mb-3">Our monthly subscription plans include:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>Basic Plan: ₹499/month</li>
                        <li>Standard Plan: ₹799/month</li>
                        <li>Premium Plan: ₹999/month</li>
                    </ul>
                    <p className="mt-3">
                        Subscriptions are billed monthly in advance. You can cancel your subscription at any time
                        from your account settings.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. Refund Policy</h2>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>
                            <strong>7-Day Money-Back Guarantee:</strong> If you're not satisfied with our service
                            within the first 7 days of your paid subscription, we'll provide a full refund.
                        </li>
                        <li>
                            <strong>After 7 Days:</strong> Refunds are not available for the remaining duration of
                            the current billing period.
                        </li>
                        <li>
                            <strong>Service Issues:</strong> If there's a service outage or technical issue on our
                            end that prevents you from using the Service for more than 48 hours, you may request a
                            prorated refund.
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Cancellation Policy</h2>
                    <p className="mb-3">You can cancel your subscription at any time:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>Go to your account settings</li>
                        <li>Click on "Manage Subscription"</li>
                        <li>Select "Cancel Subscription"</li>
                    </ul>
                    <p className="mt-3">
                        Your access will continue until the end of your current billing period. No refund will be
                        provided for the unused portion of the month.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. How to Request a Refund</h2>
                    <p className="mb-3">To request a refund, contact us at:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>Email: <a href="mailto:schooldesk18@gmail.com" className="text-purple-400 hover:text-purple-300 hover:underline">schooldesk18@gmail.com</a></li>
                        <li>Phone: <a href="tel:+916295801248" className="text-purple-400 hover:text-purple-300 hover:underline">+91 6295801248</a></li>
                    </ul>
                    <p className="mt-3">
                        Please include your account email, subscription plan, and reason for the refund request.
                        Refunds are typically processed within 5-7 business days.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Exceptions</h2>
                    <p className="mb-3">Refunds will not be provided for:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>Violation of Terms & Conditions</li>
                        <li>Account suspension or termination due to misuse</li>
                        <li>Requests made after 7 days of payment</li>
                        <li>Unused portions of a billing period after cancellation</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">7. Partner Program</h2>
                    <p>
                        Partner program earnings and commissions are non-refundable. Please review the Partner
                        Agreement for complete details.
                    </p>
                </section>
            </div>
        }
    />
);

export const Disclaimer = () => (
    <LegalPage
        title="Disclaimer"
        content={
            <div className="space-y-6 text-gray-300">
                <p className="text-sm text-gray-400">Last Updated: January 2025</p>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. General Disclaimer</h2>
                    <p>
                        The information contained on SchoolDesk is for general information purposes only. While we
                        endeavor to keep the information up to date and correct, we make no representations or
                        warranties of any kind, express or implied, about the completeness, accuracy, reliability,
                        suitability, or availability of the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. Educational Purpose</h2>
                    <p>
                        SchoolDesk is a school management platform designed to facilitate communication and
                        organization. It does not replace professional educational services, advice, or consultation.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibility</h2>
                    <p className="mb-3">Users are responsible for:</p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-300">
                        <li>Accuracy of data entered into the system</li>
                        <li>Proper use of the platform</li>
                        <li>Securing their login credentials</li>
                        <li>Compliance with applicable laws and regulations</li>
                        <li>Backing up important data</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Service Availability</h2>
                    <p>
                        While we strive for 99.9% uptime, we do not guarantee uninterrupted access to the Service.
                        Scheduled maintenance, updates, or unforeseen technical issues may temporarily affect availability.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Data Accuracy</h2>
                    <p>
                        SchoolDesk displays information as entered by users. We are not responsible for errors,
                        omissions, or inaccuracies in user-submitted content including student records, homework,
                        notices, fees, or attendance data.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Third-Party Links</h2>
                    <p>
                        Our Service may contain links to third-party websites or services. We have no control over
                        and assume no responsibility for the content, privacy policies, or practices of any third-party sites.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">7. Limitation of Liability</h2>
                    <p>
                        In no event shall SchoolDesk, its directors, employees, partners, or affiliates be liable
                        for any direct, indirect, incidental, special, or consequential damages arising from the
                        use or inability to use the Service.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">8. Changes to Disclaimer</h2>
                    <p>
                        We may update this Disclaimer from time to time. Continued use of the Service after changes
                        constitutes acceptance of the updated Disclaimer.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
                    <p>
                        For questions about this Disclaimer, please contact:
                    </p>
                    <p className="mt-2">
                        Email: <a href="mailto:schooldesk18@gmail.com" className="text-purple-400 hover:text-purple-300 hover:underline">schooldesk18@gmail.com</a><br />
                        Phone: <a href="tel:+916295801248" className="text-purple-400 hover:text-purple-300 hover:underline">+91 6295801248</a>
                    </p>
                </section>
            </div>
        }
    />
);

export default LegalPage;
