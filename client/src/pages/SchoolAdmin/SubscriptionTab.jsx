import React from 'react';
import { CreditCard, Calendar, Users, Building2, Clock } from 'lucide-react';

const PLANS = {
    trial: { name: "Trial Plan", max_students: 20, max_classes: 2 },
    basic: { name: "Basic Plan", max_students: 100, max_classes: 8 },
    standard: { name: "Standard Plan", max_students: 300, max_classes: 15 },
    premium: { name: "Premium Plan", max_students: 9999, max_classes: 9999 }
};

const SubscriptionTab = ({ user }) => {
    if (!user) {
        return (
            <div className="flex items-center justify-center p-10 text-gray-500">
                Loading subscription details...
            </div>
        );
    }

    const currentPlanKey = (user.plan_type && PLANS[user.plan_type.toLowerCase()])
        ? user.plan_type.toLowerCase()
        : 'trial';
    const currentPlan = PLANS[currentPlanKey];

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">💳</span> Subscription
            </h2>

            {/* Current Plan Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white p-6 rounded-xl shadow-xl mb-6">
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

            {/* Plan Details */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4">Your Plan Includes</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            ✅
                        </div>
                        <span className="text-gray-700">Homework Management</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            ✅
                        </div>
                        <span className="text-gray-700">Notice Board</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            ✅
                        </div>
                        <span className="text-gray-700">Fee Management</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            ✅
                        </div>
                        <span className="text-gray-700">Parent App Access</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            ✅
                        </div>
                        <span className="text-gray-700">Teacher App Access</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            ✅
                        </div>
                        <span className="text-gray-700">Events Management</span>
                    </div>
                </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-amber-800 mb-1">Online Payment Upgrade Coming Soon</h3>
                        <p className="text-amber-700 text-sm">
                            We're integrating a secure payment gateway to make plan upgrades seamless.
                            For now, contact support to upgrade your plan.
                        </p>
                        <a
                            href="mailto:schooldesk18@gmail.com"
                            className="inline-flex items-center gap-2 mt-3 text-sm font-medium text-amber-800 hover:text-amber-900"
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