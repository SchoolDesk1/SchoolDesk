import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Calendar, Users, Building2, Clock, Check, Zap, Shield, Star, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

// Plan configuration matching backend
const PLANS = {
    trial: {
        id: 'trial',
        name: "Trial Plan",
        price: 0,
        priceDisplay: "FREE",
        duration: "14 Days Trial",
        max_students: 20,
        max_classes: 2,
        popular: false,
        features: [
            "2 Classes",
            "20 Students",
            "Homework",
            "Notices",
            "Fee Status (View Only)",
            "Parent Access"
        ]
    },
    basic: {
        id: 'basic',
        name: "Basic Plan",
        price: 499,
        priceDisplay: "₹499",
        duration: "/month",
        max_students: 100,
        max_classes: 8,
        popular: false,
        tagline: "Perfect for small schools",
        features: [
            "Up to 8 Classes",
            "Up to 100 Students",
            "Homework",
            "Notices",
            "Fee Management",
            "Events",
            "Parent App",
            "Teacher App"
        ]
    },
    standard: {
        id: 'standard',
        name: "Standard Plan",
        price: 799,
        priceDisplay: "₹799",
        duration: "/month",
        max_students: 300,
        max_classes: 15,
        popular: true,
        tagline: "For growing institutions",
        features: [
            "Up to 15 Classes",
            "Up to 300 Students",
            "Transport Module",
            "Fee Management",
            "Marks",
            "Events",
            "Homework",
            "Notices"
        ]
    },
    premium: {
        id: 'premium',
        name: "Premium Plan",
        price: 999,
        priceDisplay: "₹999",
        duration: "/month",
        max_students: 9999,
        max_classes: 9999,
        popular: false,
        tagline: "Complete solution",
        features: [
            "Unlimited Classes",
            "Unlimited Students",
            "All Admin Features",
            "All Teacher Features",
            "All Parent Features",
            "Transport",
            "Marks & Performance",
            "Priority Support"
        ]
    }
};

const API_URL = '/api';

// Safe JSON parsing helper to prevent crashes
const safeJsonParse = async (response, context = 'API') => {
    if (!response.ok) {
        console.error(`${context} Error: HTTP ${response.status}`);
        return { error: true, message: `Server error (${response.status})` };
    }

    const text = await response.text();
    if (!text || text.trim() === '') {
        console.error(`${context} Error: Empty response body`);
        return { error: true, message: 'Empty response from server' };
    }

    try {
        return JSON.parse(text);
    } catch (parseError) {
        console.error(`${context} JSON Parse Error:`, parseError, 'Response:', text.substring(0, 200));
        return { error: true, message: 'Invalid response from server' };
    }
};

const SubscriptionTab = ({ user, token }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [promoCode, setPromoCode] = useState('');
    const [promoResult, setPromoResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [error, setError] = useState(null);
    const [cashfreeLoaded, setCashfreeLoaded] = useState(false);

    // Load Cashfree SDK
    useEffect(() => {
        if (window.Cashfree) {
            setCashfreeLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.async = true;
        script.onload = () => {
            setCashfreeLoaded(true);
        };
        script.onerror = () => {
            setError('Failed to load payment gateway. Please refresh and try again.');
        };
        document.body.appendChild(script);

        return () => {
            // Cleanup if needed
        };
    }, []);

    // Check for payment verification on return
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');

        if (orderId && token) {
            verifyPayment(orderId);
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [token]);

    const verifyPayment = async (orderId) => {
        setIsProcessing(true);
        setPaymentStatus({ type: 'verifying', message: 'Verifying payment...' });

        try {
            const response = await fetch(`${API_URL}/payment/verify/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await safeJsonParse(response, 'verifyPayment');

            if (data.error) {
                setPaymentStatus({
                    type: 'error',
                    message: data.message || 'Failed to verify payment.'
                });
                return;
            }

            if (data.success && data.status === 'PAID') {
                setPaymentStatus({
                    type: 'success',
                    message: `Payment successful! You are now on ${data.planName}. Refreshing...`
                });
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else if (data.status === 'PENDING') {
                setPaymentStatus({
                    type: 'pending',
                    message: 'Payment is being processed. Please wait...'
                });
                setTimeout(() => verifyPayment(orderId), 3000);
            } else {
                setPaymentStatus({
                    type: 'error',
                    message: data.message || 'Payment failed. Please try again.'
                });
            }
        } catch (err) {
            console.error('verifyPayment error:', err);
            setPaymentStatus({
                type: 'error',
                message: 'Failed to verify payment. Please contact support.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const validatePromoCode = async () => {
        if (!promoCode.trim() || !selectedPlan) return;

        try {
            const response = await fetch(`${API_URL}/payment/validate-promo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    promoCode: promoCode.trim(),
                    planId: selectedPlan
                })
            });

            const data = await safeJsonParse(response, 'validatePromoCode');
            if (data.error) {
                setPromoResult({ success: false, message: data.message || 'Failed to validate promo code' });
            } else {
                setPromoResult(data);
            }
        } catch (err) {
            console.error('validatePromoCode error:', err);
            setPromoResult({ success: false, message: 'Failed to validate promo code' });
        }
    };

    const initiatePayment = async () => {
        if (!selectedPlan || !cashfreeLoaded) return;

        setIsProcessing(true);
        setError(null);

        try {
            // Create order on backend
            const response = await fetch(`${API_URL}/payment/create-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    planId: selectedPlan,
                    promoCode: promoCode.trim() || null
                })
            });

            const data = await safeJsonParse(response, 'initiatePayment');

            if (data.error || !data.success) {
                throw new Error(data.message || 'Failed to create payment order');
            }

            // Initialize Cashfree checkout
            const cashfree = window.Cashfree({
                mode: 'production'
            });

            // Open checkout
            const checkoutOptions = {
                paymentSessionId: data.paymentSessionId,
                redirectTarget: '_modal'
            };

            cashfree.checkout(checkoutOptions).then((result) => {
                if (result.error) {
                    setError(result.error.message || 'Payment failed');
                } else if (result.paymentDetails) {
                    verifyPayment(data.orderId);
                }
            }).catch((err) => {
                setError('Payment was cancelled or failed');
            });

        } catch (err) {
            console.error('initiatePayment error:', err);
            setError(err.message || 'Failed to initiate payment');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center p-10 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Loading subscription details...
            </div>
        );
    }

    const currentPlanKey = (user.plan_type && PLANS[user.plan_type.toLowerCase()])
        ? user.plan_type.toLowerCase()
        : 'trial';
    const currentPlan = PLANS[currentPlanKey];

    // Calculate final price
    const selectedPlanData = selectedPlan ? PLANS[selectedPlan] : null;
    const discount = promoResult?.success ? promoResult.discount : 0;
    const finalPrice = selectedPlanData ? Math.max(selectedPlanData.price - discount, 1) : 0;

    // Get all paid plans (show all plans except trial)
    const allPaidPlans = Object.entries(PLANS).filter(([key]) =>
        key !== 'trial'
    );

    // Check if user can upgrade (not on premium)
    const canUpgrade = currentPlanKey !== 'premium';

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">💳</span> Subscription
            </h2>

            {/* Payment Status Banner */}
            {paymentStatus && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${paymentStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                    paymentStatus.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                        'bg-blue-50 border border-blue-200 text-blue-800'
                    }`}>
                    {paymentStatus.type === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
                    {paymentStatus.type === 'error' && <AlertCircle className="h-6 w-6 text-red-600" />}
                    {paymentStatus.type === 'verifying' && <Loader2 className="h-6 w-6 animate-spin" />}
                    {paymentStatus.type === 'pending' && <Loader2 className="h-6 w-6 animate-spin" />}
                    <span className="font-medium">{paymentStatus.message}</span>
                </div>
            )}

            {/* Error Banner */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
                    <AlertCircle className="h-6 w-6" />
                    <span>{error}</span>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-600 hover:text-red-800"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Current Plan Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-xl mb-8">
                <div className="flex justify-between mb-4">
                    <div>
                        <p className="text-sm opacity-90">Current Plan</p>
                        <h3 className="text-2xl font-bold">
                            {currentPlan.name}
                        </h3>
                    </div>
                    <CreditCard className="h-12 w-12 opacity-50" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-white/10 p-3 rounded-lg">
                        <div className="flex items-center gap-2 opacity-75 mb-1">
                            <Users className="h-4 w-4" />
                            <span>Student Limit</span>
                        </div>
                        <p className="font-semibold text-lg">
                            {currentPlan.max_students === 9999 ? 'Unlimited' : currentPlan.max_students}
                        </p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                        <div className="flex items-center gap-2 opacity-75 mb-1">
                            <Building2 className="h-4 w-4" />
                            <span>Class Limit</span>
                        </div>
                        <p className="font-semibold text-lg">
                            {currentPlan.max_classes === 9999 ? 'Unlimited' : currentPlan.max_classes}
                        </p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg col-span-2">
                        <div className="flex items-center gap-2 opacity-75 mb-1">
                            <Calendar className="h-4 w-4" />
                            <span>Expires On</span>
                        </div>
                        <p className="font-semibold text-lg">
                            {user.plan_expiry_date
                                ? new Date(user.plan_expiry_date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })
                                : "No Expiry (Trial)"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Plans Section - Show all paid plans */}
            {allPaidPlans.length > 0 && (
                <>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        {canUpgrade ? 'Choose a Plan' : 'Available Plans'}
                    </h3>

                    {/* Plan Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {allPaidPlans.map(([key, plan]) => {
                            const isCurrentPlan = key === currentPlanKey;
                            return (
                                <div
                                    key={key}
                                    onClick={() => {
                                        if (!isCurrentPlan) {
                                            setSelectedPlan(key);
                                            setPromoResult(null);
                                        }
                                    }}
                                    className={`relative bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 ${isCurrentPlan
                                        ? 'ring-2 ring-green-500 border-green-500 cursor-default'
                                        : selectedPlan === key
                                            ? 'ring-2 ring-indigo-500 border-indigo-500 cursor-pointer hover:shadow-xl hover:-translate-y-1'
                                            : 'border border-gray-200 cursor-pointer hover:shadow-xl hover:-translate-y-1'
                                        }`}
                                >
                                    {/* Current Plan Badge */}
                                    {isCurrentPlan && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                                                CURRENT PLAN
                                            </span>
                                        </div>
                                    )}

                                    {/* Popular Badge (only if not current) */}
                                    {plan.popular && !isCurrentPlan && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                                                POPULAR
                                            </span>
                                        </div>
                                    )}

                                    {/* Selection Indicator */}
                                    {selectedPlan === key && !isCurrentPlan && (
                                        <div className="absolute top-4 right-4">
                                            <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                    )}

                                    <h4 className="text-lg font-bold text-gray-800 mb-1">{plan.name}</h4>
                                    {plan.tagline && (
                                        <p className="text-sm text-gray-500 mb-4">{plan.tagline}</p>
                                    )}

                                    <div className="mb-4">
                                        <span className="text-3xl font-bold text-gray-900">{plan.priceDisplay}</span>
                                        <span className="text-gray-500">{plan.duration}</span>
                                    </div>

                                    <ul className="space-y-2">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })}
                    </div>

                    {/* Payment Section */}
                    {selectedPlan && (
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 mb-8">
                            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-500" />
                                Secure Payment
                            </h4>

                            {/* Promo Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Have a promo code?
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => {
                                            setPromoCode(e.target.value.toUpperCase());
                                            setPromoResult(null);
                                        }}
                                        placeholder="Enter promo code"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase"
                                    />
                                    <button
                                        onClick={validatePromoCode}
                                        disabled={!promoCode.trim()}
                                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                                {promoResult && (
                                    <p className={`mt-2 text-sm ${promoResult.success ? 'text-green-600' : 'text-red-600'}`}>
                                        {promoResult.message}
                                    </p>
                                )}
                            </div>

                            {/* Price Summary */}
                            <div className="bg-white rounded-xl p-4 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">{PLANS[selectedPlan].name}</span>
                                    <span className="text-gray-800">₹{PLANS[selectedPlan].price}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center mb-2 text-green-600">
                                        <span>Discount</span>
                                        <span>-₹{discount}</span>
                                    </div>
                                )}
                                <hr className="my-2" />
                                <div className="flex justify-between items-center font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-indigo-600">₹{finalPrice}</span>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={initiatePayment}
                                disabled={isProcessing || !cashfreeLoaded}
                                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : !cashfreeLoaded ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Loading payment gateway...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-5 w-5" />
                                        Pay ₹{finalPrice} Securely
                                    </>
                                )}
                            </button>

                            {/* Security Badge */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                                <Shield className="h-4 w-4" />
                                <span>Secured by Cashfree • 256-bit SSL Encrypted</span>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Already on Premium */}
            {!canUpgrade && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 text-center mb-8">
                    <Star className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-green-800 mb-2">You're on the Premium Plan!</h3>
                    <p className="text-green-700">
                        You have access to all features. Enjoy unlimited classes, students, and priority support.
                    </p>
                </div>
            )}

            {/* Plan Features */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
                <h3 className="text-lg font-bold mb-4">Your Plan Includes</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {currentPlan.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                ✅
                            </div>
                            <span className="text-gray-700">{feature}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Support Contact */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mt-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        💬
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800 mb-1">Need Help?</h3>
                        <p className="text-gray-600 text-sm">
                            Have questions about our plans or need assistance with payment?
                        </p>
                        <a
                            href="mailto:schooldesk18@gmail.com"
                            className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                            📧 Contact: schooldesk18@gmail.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionTab;