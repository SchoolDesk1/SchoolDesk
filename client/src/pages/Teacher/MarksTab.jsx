import React, { useState } from 'react';

const MarksTab = ({ token }) => {
    const [newMark, setNewMark] = useState({
        student_name: '',
        student_phone: '',
        subject: '',
        marks: '',
        max_marks: '100',
        test_name: '',
        test_date: ''
    });
    const [message, setMessage] = useState('');

    const handleAddMarks = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            // First, find the student by phone number
            const usersRes = await fetch('/api/teacher/students', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!usersRes.ok) {
                setMessage('❌ Error fetching students');
                return;
            }

            const users = await usersRes.json();
            const student = (Array.isArray(users) ? users : []).find(u =>
                u.phone === newMark.student_phone && u.role === 'parent'
            );

            if (!student) {
                setMessage(`❌ No student found with phone number ${newMark.student_phone}`);
                return;
            }

            // Add marks for this student
            const res = await fetch('/api/teacher/marks/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    student_id: student.id,
                    subject: newMark.subject,
                    marks: parseFloat(newMark.marks),
                    max_marks: parseFloat(newMark.max_marks),
                    test_name: newMark.test_name,
                    test_date: newMark.test_date
                })
            });

            if (res.ok) {
                setMessage(`✅ Marks added successfully for ${student.name || newMark.student_name}!`);
                setNewMark({
                    student_name: '',
                    student_phone: '',
                    subject: '',
                    marks: '',
                    max_marks: '100',
                    test_name: '',
                    test_date: ''
                });
            } else {
                const error = await res.json();
                setMessage('❌ Error: ' + (error.message || 'Failed to add marks'));
            }
        } catch (err) {
            console.error(err);
            setMessage('❌ Error adding marks');
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">📝</span> Add Student Marks
            </h2>

            <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-indigo-100">
                <h3 className="font-bold text-xl mb-4 text-indigo-900">Enter Marks</h3>

                <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm text-blue-700">
                        <strong>💡 Tip:</strong> Enter the student's name and phone number.
                        The system will automatically find their profile and add marks to their record.
                    </p>
                </div>

                <form onSubmit={handleAddMarks} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Student Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={newMark.student_name}
                                onChange={e => setNewMark({ ...newMark, student_name: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Student Phone Number *
                                <span className="text-xs text-gray-500 ml-2">(Parent's phone)</span>
                            </label>
                            <input
                                type="tel"
                                required
                                value={newMark.student_phone}
                                onChange={e => setNewMark({ ...newMark, student_phone: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="9876543210"
                                maxLength="10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                            <input
                                type="text"
                                required
                                value={newMark.subject}
                                onChange={e => setNewMark({ ...newMark, subject: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="Mathematics"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Test Name</label>
                            <input
                                type="text"
                                value={newMark.test_name}
                                onChange={e => setNewMark({ ...newMark, test_name: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="Unit Test 1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Test Date</label>
                            <input
                                type="date"
                                value={newMark.test_date}
                                onChange={e => setNewMark({ ...newMark, test_date: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Marks Obtained *</label>
                            <input
                                type="number"
                                required
                                value={newMark.marks}
                                onChange={e => setNewMark({ ...newMark, marks: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="85"
                                min="0"
                                step="0.5"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Marks *</label>
                            <input
                                type="number"
                                required
                                value={newMark.max_marks}
                                onChange={e => setNewMark({ ...newMark, max_marks: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="100"
                                min="1"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg"
                    >
                        Add Marks
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-4 rounded-lg ${message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarksTab;
