import React, { useState } from 'react';

const StudentDetailModal = ({ student, onClose, onEdit, onDelete, token }) => {
    if (!student) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{student.name || 'Unnamed Student'}</h2>
                        <p className="text-sm text-gray-500 mt-1">ID: {student.id}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Role</p>
                        <p className="text-lg text-gray-800 capitalize">{student.role}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Class</p>
                        <p className="text-lg text-gray-800">{student.class_name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Phone Number</p>
                        <p className="text-lg text-gray-800">📞 {student.phone}</p>
                    </div>
                    {student.contact_phone && (
                        <div>
                            <p className="text-sm font-semibold text-gray-500 mb-1">Contact Phone</p>
                            <p className="text-lg text-gray-800">📱 {student.contact_phone}</p>
                        </div>
                    )}
                </div>

                {student.address && (
                    <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-500 mb-2">Address</p>
                        <p className="text-gray-800 bg-gray-50 p-4 rounded-lg">📍 {student.address}</p>
                    </div>
                )}

                <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-500 mb-1">Registration Date</p>
                    <p className="text-gray-800">{new Date(student.created_at).toLocaleString()}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            onEdit(student);
                            onClose();
                        }}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                        ✏️ Edit Student
                    </button>
                    <button
                        onClick={async () => {
                            if (window.confirm(`Delete ${student.name || student.phone}?`)) {
                                await onDelete(student.id);
                                onClose();
                            }
                        }}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                        🗑️ Delete Student
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailModal;
