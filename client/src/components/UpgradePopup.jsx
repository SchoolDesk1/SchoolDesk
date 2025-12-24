import React from 'react';
import { useNavigate } from 'react-router-dom';

const UpgradePopup = ({ isOpen, onClose, message, type = 'limit' }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                        <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {type === 'expired' ? 'Plan Expired' : 'Limit Reached'}
                    </h3>

                    <p className="text-gray-600 mb-8">
                        {message || "You've reached the limit for your current plan. Upgrade now to unlock more features and limits!"}
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                onClose();
                                navigate('/school-admin/subscription'); // Adjust route if needed, usually it's in a tab
                                // If it's a tab based dashboard, we might need to pass a valid prop to switch tab
                                // But navigation to a URL is safest if routes are set up. 
                                // Based on file structure, it's 'SubscriptionTab.jsx', likely rendered in Dashboard.
                                // We might need to handle this differently if it's SPA with state-based tabs.
                                // Let's assume there is a route or we force it.
                                // If the user is on /school/dashboard, checking logic might be needed.
                                // For now, we'll try to navigate to ?tab=subscription query param if dashboard supports it
                                // or just dispatch a custom event.
                                window.location.href = '/school/dashboard?tab=subscription';
                            }}
                            className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-base font-medium text-white hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:text-sm"
                        >
                            Upgrade Plan 🚀
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-3 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradePopup;
