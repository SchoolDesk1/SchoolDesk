import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Shield, Star, Loader2, AlertCircle, CheckCircle, Crown, Sparkles } from 'lucide-react';
import { getApiUrl } from '../../config/api';
import { motion, AnimatePresence } from 'framer-motion';

const PLANS = {
    basic: {
        id: 'basic',
        name: "Basic Plan",
        price: 499,
        duration: "Monthly",
        color: "from-blue-400 to-cyan-500",
        shadow: "shadow-blue-500/20",
        features: ["Up to 100 Students", "8 Classes", "Basic Reports"]
    },
    standard: {
        id: 'standard',
        name: "Standard Plan",
        price: 799,
        duration: "Monthly",
        color: "from-violet-500 to-fuchsia-500",
        shadow: "shadow-violet-500/30",
        features: ["Up to 300 Students", "15 Classes", "Transport Module", "Advanced Reports"],
        popular: true
    },
    premium: {
        id: 'premium',
        name: "Premium Plan",
        price: 999,
        duration: "Monthly",
        color: "from-amber-400 to-orange-500",
        shadow: "shadow-amber-500/20",
        features: ["Unlimited Students", "Unlimited Classes", "All Features", "Priority Support"]
    }
};

const SubscriptionTab = ({ user, token, stats }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [error, setError] = useState(null);
    const [cashfreeLoaded, setCashfreeLoaded] = useState(false);

    // 1. Load Cashfree SDK
    useEffect(() => {
        if (window.Cashfree) {
            setCashfreeLoaded(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.async = true;
        script.onload = () => setCashfreeLoaded(true);
        script.onerror = () => setError("Failed to load payment gateway");
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    // 2. Handle Payment Verification on Return
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');
        if (orderId && token) {
            verifyPayment(orderId);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [token]);

    const verifyPayment = async (orderId) => {
        setIsProcessing(true);
        setPaymentStatus({ type: 'verifying', message: 'Verifying payment...' });

        try {
            const res = await fetch(getApiUrl(`/api/payment/verify/${orderId}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();

            if (data.success && data.status === 'PAID') {
                setPaymentStatus({
                    type: 'success',
                    message: `Payment successful! Plan updated to ${data.planName}.`
                });
                setTimeout(() => window.location.reload(), 2000);
            } else if (data.status === 'PENDING') {
                setPaymentStatus({ type: 'pending', message: 'Payment processing...' });
                setTimeout(() => verifyPayment(orderId), 3000);
            } else {
                setPaymentStatus({ type: 'error', message: data.message || 'Payment failed' });
            }
        } catch (err) {
            console.error(err);
            setPaymentStatus({ type: 'error', message: 'Verification failed' });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubscribe = async () => {
        if (!selectedPlan || !cashfreeLoaded) return;
        setIsProcessing(true);
        setError(null);

        try {
            // 1. Create Order
            const res = await fetch(getApiUrl('/api/payment/create-order'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ planId: selectedPlan })
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to create order');
            }

            // 2. Initialize Cashfree
            const cashfree = window.Cashfree({ mode: 'production' });

            // 3. Open Checkout
            cashfree.checkout({
                paymentSessionId: data.payment_session_id,
                redirectTarget: "_self"
            });

        } catch (err) {
            console.error(err);
            setError(err.message || 'Payment initialization failed');
            setIsProcessing(false);
        }
    };

    const currentPlanKey = user?.plan_type?.toLowerCase() || 'trial';

    // Limits Calculation
    const currentStudents = stats?.studentsCount || 0;
    const currentClasses = stats?.classesCount || 0;

    const maxStudents = currentPlanKey === 'premium' ? 'Unlimited' : (PLANS[currentPlanKey]?.features[0].match(/\d+/) || 100);
    const maxClasses = currentPlanKey === 'premium' ? 'Unlimited' : (PLANS[currentPlanKey]?.features[1].match(/\d+/) || 8);

    // Days Left
    const calculateDaysLeft = () => {
        if (!user?.plan_expiry_date) return 0;
        const expiry = new Date(user.plan_expiry_date);
        const now = new Date();
        const diffTime = Math.abs(expiry - now);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return now > expiry ? 0 : diffDays;
    };
    const daysLeft = calculateDaysLeft();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
    };

    return (
        <motion.div
            className="space-y-12 pb-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >

            {/* 1. Dashboard / Usage Stats Section */}
            <motion.div variants={itemVariants} className="bg-surface-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-l from-primary-600/30 to-transparent rounded-full blur-[100px] -mr-32 -mt-32 mix-blend-screen group-hover:bg-primary-500/40 transition-colors duration-700"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-r from-secondary-600/30 to-transparent rounded-full blur-[80px] -ml-32 -mb-32 mix-blend-screen group-hover:bg-secondary-500/40 transition-colors duration-700"></div>

                {/* Floating Particles/Grid - Optional visual noise */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 mb-6"
                            >
                                <span className={`w-2.5 h-2.5 rounded-full ${daysLeft > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                                <span className="text-sm font-semibold tracking-wide uppercase text-white/90">Current Plan Status</span>
                            </motion.div>

                            <h2 className="text-5xl md:text-7xl font-display font-bold text-white mb-4 tracking-tight flex items-center gap-4">
                                {PLANS[currentPlanKey]?.name || 'Trial Plan'}
                                {daysLeft < 7 && (
                                    <span className="text-3xl animate-bounce">⚠️</span>
                                )}
                            </h2>
                            <p className="text-xl text-indigo-100/70 max-w-lg font-light">
                                You are currently on the <span className="text-white font-medium">{PLANS[currentPlanKey]?.name || 'Trial'}</span> tier. Upgrade to unlock more power.
                            </p>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="text-right bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-xl"
                            >
                                <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Renews In</p>
                                <div className="text-5xl font-mono font-bold text-white tracking-tighter leading-none mb-1">
                                    {daysLeft}
                                    <span className="text-lg font-sans font-medium text-indigo-300 ml-2">Days</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-3">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (daysLeft / 30) * 100)}%` }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        className={`h-full ${daysLeft < 7 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Student Usage */}
                        <UsageCard
                            title="Student Capacity"
                            current={currentStudents}
                            max={maxStudents}
                            icon="👨‍🎓"
                            color="bg-gradient-to-r from-blue-500 to-cyan-500"
                        />
                        {/* Class Usage */}
                        <UsageCard
                            title="Classrooms"
                            current={currentClasses}
                            max={maxClasses}
                            icon="📚"
                            color="bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        />
                    </div>
                </div>
            </motion.div>

            {/* 2. Upgrade Plans Section */}
            <div>
                <motion.div variants={itemVariants} className="text-center space-y-4 mb-16">
                    <span className="text-primary-600 font-bold tracking-wider text-sm uppercase bg-primary-50 px-4 py-2 rounded-full">Upgrade Your Experience</span>
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-surface-900 tracking-tight">
                        Choose Your Power
                    </h2>
                    <p className="text-xl text-surface-500 max-w-2xl mx-auto font-light">
                        Scale your institute with plans designed for growth. No hidden fees. Cancel anytime.
                    </p>
                </motion.div>

                {/* Status Messages */}
                <AnimatePresence>
                    {paymentStatus && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`p-6 rounded-2xl flex items-center gap-4 border mb-12 max-w-3xl mx-auto shadow-lg ${paymentStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                                    paymentStatus.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-blue-50 border-blue-200 text-blue-900'
                                }`}
                        >
                            <div className={`p-3 rounded-full ${paymentStatus.type === 'success' ? 'bg-emerald-100' :
                                    paymentStatus.type === 'error' ? 'bg-rose-100' : 'bg-blue-100'
                                }`}>
                                {paymentStatus.type === 'success' ? <CheckCircle className="h-6 w-6" /> :
                                    paymentStatus.type === 'error' ? <AlertCircle className="h-6 w-6" /> :
                                        <Loader2 className="h-6 w-6 animate-spin" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{paymentStatus.type === 'success' ? 'Success!' : paymentStatus.type === 'error' ? 'Error' : 'Processing'}</h4>
                                <p>{paymentStatus.message}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
                    {Object.values(PLANS).map((plan, idx) => {
                        const isCurrent = currentPlanKey === plan.id;
                        const isSelected = selectedPlan === plan.id;
                        const isPopular = plan.popular;

                        return (
                            <motion.div
                                key={plan.id}
                                variants={itemVariants}
                                whileHover={{ y: -10, scale: 1.02 }}
                                onClick={() => !isCurrent && setSelectedPlan(plan.id)}
                                className={`
                                    relative rounded-[2rem] p-8 flex flex-col cursor-pointer transition-all duration-300 isolate overflow-hidden
                                    ${isPopular
                                        ? 'bg-surface-900 text-white shadow-2xl shadow-primary-900/40 ring-4 ring-primary-500/20'
                                        : 'bg-white text-surface-900 shadow-xl shadow-surface-200/50 border border-surface-100 hover:shadow-2xl'
                                    }
                                    ${isSelected && !isPopular ? 'ring-2 ring-primary-500 scale-[1.02]' : ''}
                                    ${isCurrent ? 'opacity-80 grayscale-[0.5]' : ''}
                                `}
                            >
                                {/* Background Gradients for Popular Card */}
                                {isPopular && (
                                    <>
                                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-500/30 rounded-full blur-[60px] mix-blend-screen"></div>
                                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-secondary-500/30 rounded-full blur-[60px] mix-blend-screen"></div>
                                    </>
                                )}

                                {/* Header */}
                                <div className="relative z-10 mb-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl ${isPopular ? 'bg-white/10 text-white' : 'bg-surface-100 text-surface-900'}`}>
                                            {plan.id === 'premium' ? <Crown className="w-6 h-6" /> :
                                                plan.id === 'standard' ? <Zap className="w-6 h-6" /> :
                                                    <Star className="w-6 h-6" />}
                                        </div>
                                        {isPopular && (
                                            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                                                Most Popular
                                            </span>
                                        )}
                                        {isCurrent && (
                                            <span className="bg-surface-200 text-surface-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <h3 className={`text-xl font-bold uppercase tracking-widest mb-2 ${isPopular ? 'text-surface-300' : 'text-surface-400'}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-display font-bold">₹{plan.price}</span>
                                        <span className={`text-sm font-medium ${isPopular ? 'text-surface-400' : 'text-surface-500'}`}>/ month</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className={`h-px w-full mb-8 ${isPopular ? 'bg-white/10' : 'bg-surface-100'}`}></div>

                                {/* Features */}
                                <ul className="space-y-4 mb-10 flex-1 relative z-10">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm font-medium">
                                            <div className={`mt-0.5 rounded-full p-0.5 ${isPopular ? 'bg-primary-500 text-white' : 'bg-green-100 text-green-600'}`}>
                                                <Check className="h-3 w-3" strokeWidth={3} />
                                            </div>
                                            <span className={isPopular ? 'text-surface-200' : 'text-surface-600'}>{f}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Action Button */}
                                <div className="relative z-10 mt-auto">
                                    {!isCurrent ? (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedPlan(plan.id);
                                                if (selectedPlan === plan.id) handleSubscribe();
                                            }}
                                            disabled={isProcessing}
                                            className={`
                                                w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase transition-all duration-300
                                                flex items-center justify-center gap-2 group
                                                ${isPopular
                                                    ? 'bg-white text-primary-600 hover:bg-surface-50'
                                                    : 'bg-surface-900 text-white hover:bg-surface-800'
                                                }
                                                ${isSelected ? 'ring-4 ring-primary-500/30' : ''}
                                            `}
                                        >
                                            {isProcessing && isSelected ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Processing
                                                </>
                                            ) : (
                                                <>
                                                    {isSelected ? 'Proceed to Pay' : 'Select Plan'}
                                                    {(isPopular || isSelected) && <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />}
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button disabled className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase cursor-not-allowed border ${isPopular ? 'border-white/20 text-white/50' : 'border-surface-200 text-surface-400'}`}>
                                            Current Plan
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Footer Trust Section */}
            <motion.div variants={itemVariants} className="mt-16 text-center">
                <div className="bg-white/50 backdrop-blur-lg border border-white/60 rounded-3xl p-8 max-w-4xl mx-auto shadow-xl">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                                <Shield className="h-8 w-8" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-lg text-surface-900">Secure Payments</h3>
                                <p className="text-sm text-surface-500">256-bit SSL Encrypted</p>
                            </div>
                        </div>
                        <div className="w-px h-12 bg-surface-200 hidden md:block"></div>
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-green-50 text-green-600 rounded-2xl shadow-sm">
                                <Zap className="h-8 w-8" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-lg text-surface-900">Instant Activation</h3>
                                <p className="text-sm text-surface-500">Access features immediately</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Helper Component for Usage Cards
const UsageCard = ({ title, current, max, icon, color }) => {
    // Calculate percentage carefully
    const percentage = max === 'Unlimited' ? 10 : Math.min(((current || 0) / (max || 1)) * 100, 100);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/5 hover:bg-white/15 transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-indigo-200 font-medium mb-1">{title}</h3>
                    <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                        {current}
                        <span className="text-lg text-white/40 font-normal">/ {max}</span>
                    </div>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl shadow-inner">
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>

            <div className="w-full bg-black/20 rounded-full h-4 overflow-hidden shadow-inner">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className={`h-full rounded-full relative ${color}`}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SubscriptionTab;
