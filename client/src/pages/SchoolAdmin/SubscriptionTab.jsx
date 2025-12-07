import React, { useState, useEffect } from 'react';
import { CreditCard, Check, Zap, Shield, Star, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { getApiUrl } from '../../config/api';

const PLANS = {
    basic: {
        id: 'basic',
        name: "Basic Plan",
        price: 499,
        duration: "Monthly",
        features: ["Up to 100 Students", "8 Classes", "Basic Reports"]
    },
    standard: {
        id: 'standard',
        name: "Standard Plan",
        price: 799,
        duration: "Monthly",
        features: ["Up to 300 Students", "15 Classes", "Transport Module", "Advanced Reports"],
        popular: true
    },
    premium: {
        id: 'premium',
        name: "Premium Plan",
        price: 999,
        duration: "Monthly",
        features: ["Unlimited Students", "Unlimited Classes", "All Features", "Priority Support"]
    }
};

const SubscriptionTab = ({ user, token }) => {
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

    return (
        <div className="animate-fade-in p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-6 w-6" /> Subscription Plans
            </h2>

            {/* Status Messages */}
            {paymentStatus && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${paymentStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                        paymentStatus.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {paymentStatus.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
                        paymentStatus.type === 'error' ? <AlertCircle className="h-5 w-5" /> :
                            <Loader2 className="h-5 w-5 animate-spin" />}
                    {paymentStatus.message}
                </div>
            )}

            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg flex items-center gap-3">
                    <AlertCircle className="h-5 w-5" /> {error}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
                {Object.values(PLANS).map((plan) => {
                    const isCurrent = currentPlanKey === plan.id;
                    const isSelected = selectedPlan === plan.id;

                    return (
                        <div key={plan.id}
                            onClick={() => !isCurrent && setSelectedPlan(plan.id)}
                            className={`border rounded-2xl p-6 relative bg-white transition-all cursor-pointer hover:shadow-xl
                                ${isCurrent ? 'border-green-500 ring-1 ring-green-500 bg-green-50' :
                                    isSelected ? 'border-indigo-600 ring-2 ring-indigo-600' : 'border-gray-200'}
                            `}
                        >
                            {plan.popular && <span className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</span>}
                            {isCurrent && <span className="absolute top-0 left-0 bg-green-600 text-white text-xs px-2 py-1 rounded-br-lg rounded-tl-lg">CURRENT</span>}

                            <h3 className="text-xl font-bold">{plan.name}</h3>
                            <div className="my-4">
                                <span className="text-3xl font-bold">₹{plan.price}</span>
                                <span className="text-gray-500 text-sm"> / {plan.duration}</span>
                            </div>

                            <ul className="space-y-2 mb-6 text-sm text-gray-600">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex gap-2">
                                        <Check className="h-4 w-4 text-green-500" /> {f}
                                    </li>
                                ))}
                            </ul>

                            {!isCurrent && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPlan(plan.id);
                                        if (selectedPlan === plan.id) handleSubscribe();
                                    }}
                                    disabled={isProcessing}
                                    className={`w-full py-2 rounded-lg font-bold transition-colors
                                        ${isSelected
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                        }
                                    `}
                                >
                                    {isSelected ? (isProcessing ? 'Processing (Redirecting...)' : 'Pay Now') : 'Select Plan'}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SubscriptionTab;