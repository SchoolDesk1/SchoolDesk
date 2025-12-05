import React, { useState, useEffect } from 'react';

const VehicleTab = ({ token }) => {
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicle();
    }, []);

    const fetchVehicle = async () => {
        try {
            const res = await fetch('/api/parent/vehicle', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.message) {
                setVehicle(null);
            } else {
                setVehicle(data);
            }
        } catch (err) {
            console.error('Fetch vehicle error:', err);
            setVehicle(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin text-4xl">🔄</div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">🚌</span> Vehicle Details
            </h2>

            {!vehicle ? (
                <div className="bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-xl border border-indigo-100 text-center">
                    <div className="text-6xl mb-4">🚌</div>
                    <p className="text-gray-500 text-lg">No vehicle assigned to your child yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Please contact the school admin.</p>
                </div>
            ) : (
                <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-indigo-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                            <div className="text-4xl mb-3">🚌</div>
                            <h3 className="font-bold text-xl text-indigo-900 mb-2">{vehicle.vehicle_name}</h3>
                            <p className="text-gray-700">
                                <strong>Route:</strong> {vehicle.route_details}
                            </p>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                            <div className="text-4xl mb-3">👤</div>
                            <h3 className="font-bold text-xl text-green-900 mb-2">Driver Details</h3>
                            <p className="text-gray-700 mb-1">
                                <strong>Name:</strong> {vehicle.driver_name}
                            </p>
                            <p className="text-gray-700">
                                <strong>Phone:</strong> <a href={`tel:${vehicle.driver_phone}`} className="text-blue-600 hover:underline">{vehicle.driver_phone}</a>
                            </p>
                        </div>

                        {(vehicle.pickup_time || vehicle.drop_time) && (
                            <div className="md:col-span-2 bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border border-yellow-200">
                                <div className="text-4xl mb-3">🕐</div>
                                <h3 className="font-bold text-xl text-amber-900 mb-3">Timings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {vehicle.pickup_time && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Pickup Time</p>
                                            <p className="text-2xl font-bold text-gray-800">{vehicle.pickup_time}</p>
                                        </div>
                                    )}
                                    {vehicle.drop_time && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Drop Time</p>
                                            <p className="text-2xl font-bold text-gray-800">{vehicle.drop_time}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-sm text-blue-700">
                            <strong>📞 Note:</strong> For any changes or issues, please contact the driver or school admin.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VehicleTab;
