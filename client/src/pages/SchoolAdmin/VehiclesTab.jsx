import React, { useState, useEffect } from 'react';

const VehiclesTab = ({ token }) => {
    const [vehicles, setVehicles] = useState([]);
    const [newVehicle, setNewVehicle] = useState({
        vehicle_name: '',
        route_details: '',
        driver_name: '',
        driver_phone: '',
        pickup_time: '',
        drop_time: ''
    });
    const [assignPhone, setAssignPhone] = useState('');
    const [assignVehicleId, setAssignVehicleId] = useState('');
    const [assignmentMessage, setAssignmentMessage] = useState('');

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const res = await fetch('/api/school/vehicles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                console.error('Failed to fetch vehicles');
                return;
            }
            const data = await res.json();
            setVehicles(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch vehicles error:', err);
        }
    };

    const handleCreateVehicle = async (e) => {
        e.preventDefault();
        try {
            const isUpdate = newVehicle.id;
            const url = isUpdate ? `/api/school/vehicles/${newVehicle.id}` : '/api/school/vehicles/create';
            const method = isUpdate ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newVehicle)
            });
            if (res.ok) {
                setNewVehicle({ vehicle_name: '', route_details: '', driver_name: '', driver_phone: '', pickup_time: '', drop_time: '' });
                fetchVehicles();
                alert(isUpdate ? 'Vehicle updated!' : 'Vehicle added successfully!');
            } else {
                const error = await res.json();
                alert('Error: ' + (error.message || 'Failed to save vehicle'));
            }
        } catch (err) {
            console.error(err);
            alert('Error saving vehicle');
        }
    };

    const handleDeleteVehicle = async (id, name) => {
        if (!window.confirm(`Delete vehicle "${name}"?`)) return;
        try {
            const res = await fetch(`/api/school/vehicles/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Vehicle deleted');
                fetchVehicles();
            } else {
                alert('Error deleting vehicle');
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting vehicle');
        }
    };

    const handleAssignByPhone = async (e) => {
        e.preventDefault();
        setAssignmentMessage('');

        if (!assignPhone || !assignVehicleId) {
            setAssignmentMessage('Please enter phone number and select a vehicle');
            return;
        }

        try {
            // First, find the student by phone number
            const usersRes = await fetch('/api/school/users', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!usersRes.ok) {
                setAssignmentMessage('Error fetching users');
                return;
            }

            const users = await usersRes.json();
            const student = (Array.isArray(users) ? users : []).find(u =>
                u.phone === assignPhone && u.role === 'parent'
            );

            if (!student) {
                setAssignmentMessage(`❌ No student found with phone number ${assignPhone}`);
                return;
            }

            // Assign vehicle to student
            const res = await fetch('/api/school/vehicles/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ student_id: student.id, vehicle_id: assignVehicleId })
            });

            if (res.ok) {
                const vehicleName = vehicles.find(v => v.id == assignVehicleId)?.vehicle_name || 'Vehicle';
                setAssignmentMessage(`✅ ${vehicleName} assigned to ${student.name || student.phone} successfully!`);
                setAssignPhone('');
                setAssignVehicleId('');
            } else {
                const error = await res.json();
                setAssignmentMessage('❌ Error: ' + (error.message || 'Failed to assign vehicle'));
            }
        } catch (err) {
            console.error(err);
            setAssignmentMessage('❌ Error assigning vehicle');
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">🚌</span> Vehicle Management
            </h2>

            {/* Add Vehicle Form */}
            <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl mb-6 border border-indigo-100">
                <h3 className="font-bold text-xl mb-4 text-indigo-900">
                    {newVehicle.id ? 'Edit Vehicle' : 'Add New Vehicle'}
                </h3>
                <form onSubmit={handleCreateVehicle} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Name *</label>
                            <input
                                type="text"
                                required
                                value={newVehicle.vehicle_name}
                                onChange={e => setNewVehicle({ ...newVehicle, vehicle_name: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="Bus 1, Van 2, Auto A"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Route Details *</label>
                            <input
                                type="text"
                                required
                                value={newVehicle.route_details}
                                onChange={e => setNewVehicle({ ...newVehicle, route_details: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="Village → Town → School"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Driver Name *</label>
                            <input
                                type="text"
                                required
                                value={newVehicle.driver_name}
                                onChange={e => setNewVehicle({ ...newVehicle, driver_name: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="Driver name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Driver Phone *</label>
                            <input
                                type="tel"
                                required
                                value={newVehicle.driver_phone}
                                onChange={e => setNewVehicle({ ...newVehicle, driver_phone: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="9876543210"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Time</label>
                            <input
                                type="time"
                                value={newVehicle.pickup_time}
                                onChange={e => setNewVehicle({ ...newVehicle, pickup_time: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Drop Time</label>
                            <input
                                type="time"
                                value={newVehicle.drop_time}
                                onChange={e => setNewVehicle({ ...newVehicle, drop_time: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg"
                        >
                            {newVehicle.id ? 'Update Vehicle' : 'Add Vehicle'}
                        </button>
                        {newVehicle.id && (
                            <button
                                type="button"
                                onClick={() => setNewVehicle({ vehicle_name: '', route_details: '', driver_name: '', driver_phone: '', pickup_time: '', drop_time: '' })}
                                className="bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Vehicles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {vehicles.map(vehicle => (
                    <div key={vehicle.id} className="bg-white/80 backdrop-blur-lg p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-indigo-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl text-indigo-900">{vehicle.vehicle_name}</h3>
                                <p className="text-sm text-gray-600">📍 {vehicle.route_details}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setNewVehicle(vehicle)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDeleteVehicle(vehicle.id, vehicle.vehicle_name)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p><strong>👤 Driver:</strong> {vehicle.driver_name}</p>
                            <p><strong>📞 Phone:</strong> {vehicle.driver_phone}</p>
                            {vehicle.pickup_time && <p><strong>🕐 Pickup:</strong> {vehicle.pickup_time}</p>}
                            {vehicle.drop_time && <p><strong>🕐 Drop:</strong> {vehicle.drop_time}</p>}
                        </div>
                    </div>
                ))}
            </div>
            {vehicles.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <div className="text-6xl mb-4">🚌</div>
                    <p className="text-gray-400 text-lg">No vehicles added yet.</p>
                </div>
            )}

            {/* Assign Vehicle by Phone Number */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl shadow-xl border border-blue-200">
                <h3 className="font-bold text-xl mb-4 text-indigo-900">📱 Assign Vehicle to Student</h3>
                <p className="text-sm text-gray-600 mb-4">Enter the student's phone number to assign a vehicle</p>

                <form onSubmit={handleAssignByPhone} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Student Phone Number *</label>
                            <input
                                type="tel"
                                required
                                value={assignPhone}
                                onChange={(e) => setAssignPhone(e.target.value)}
                                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                placeholder="Enter 10-digit phone"
                                maxLength="10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Vehicle *</label>
                            <select
                                required
                                value={assignVehicleId}
                                onChange={(e) => setAssignVehicleId(e.target.value)}
                                className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                            >
                                <option value="">Choose Vehicle</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.vehicle_name} - {v.route_details}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg"
                    >
                        Assign Vehicle
                    </button>
                </form>

                {assignmentMessage && (
                    <div className={`mt-4 p-4 rounded-lg ${assignmentMessage.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {assignmentMessage}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VehiclesTab;
