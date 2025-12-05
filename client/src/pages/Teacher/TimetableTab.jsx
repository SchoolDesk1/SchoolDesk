import React, { useState, useEffect } from 'react';

const TimetableTab = ({ token, classId }) => {
    const [timetable, setTimetable] = useState([]);
    const [editEntry, setEditEntry] = useState(null);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    useEffect(() => {
        if (classId) fetchTimetable();
    }, [classId]);

    const fetchTimetable = async () => {
        try {
            const res = await fetch(`/api/teacher/timetable/${classId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setTimetable(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch timetable error:', err);
        }
    };

    const handleSave = async (day, period) => {
        if (!editEntry?.subject || !editEntry?.timing) {
            alert('Please enter subject and timing');
            return;
        }

        try {
            const res = await fetch('/api/teacher/timetable/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    class_id: classId,
                    day: day,
                    period_number: period,
                    subject: editEntry.subject,
                    timing: editEntry.timing,
                    teacher_name: editEntry.teacher_name || ''
                })
            });
            if (res.ok) {
                fetchTimetable();
                setEditEntry(null);
                alert('✅ Timetable saved successfully!');
            } else {
                alert('❌ Error saving timetable');
            }
        } catch (err) {
            console.error(err);
            alert('❌ Error saving timetable');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this entry?')) return;

        try {
            const res = await fetch(`/api/teacher/timetable/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchTimetable();
                alert('✅ Entry deleted successfully!');
            } else {
                alert('❌ Error deleting entry');
            }
        } catch (err) {
            console.error(err);
            alert('❌ Error deleting entry');
        }
    };

    const getEntry = (day, period) => {
        return timetable.find(e => e.day === day && e.period_number === period);
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">📚</span> Weekly Timetable
            </h2>

            {!classId ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-yellow-700">You need to be assigned to a class to manage timetable.</p>
                </div>
            ) : (
                <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-indigo-100 overflow-x-auto">
                    <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-sm text-blue-800">
                            <strong>💡 Tip:</strong> Click <strong>"Edit"</strong> to modify an entry, or <strong>"Delete"</strong> to remove it. Click <strong>"➕ Add Subject"</strong> to add new entries.
                        </p>
                    </div>

                    <table className="min-w-full border-collapse">
                        <thead>
                            <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                <th className="border p-3 text-white font-bold">Period</th>
                                {days.map(day => (
                                    <th key={day} className="border p-3 text-white font-bold">{day}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map(period => (
                                <tr key={period} className="hover:bg-indigo-50/50">
                                    <td className="border p-3 font-bold text-gray-700 bg-gray-50">{period}</td>
                                    {days.map(day => {
                                        const entry = getEntry(day, period);
                                        const isEditing = editEntry?.day === day && editEntry?.period === period;

                                        return (
                                            <td key={day} className="border p-2">
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Subject (e.g., Mathematics)"
                                                            value={editEntry.subject || ''}
                                                            onChange={e => setEditEntry({ ...editEntry, subject: e.target.value })}
                                                            className="w-full p-2 border border-indigo-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Time (e.g., 9:00-10:00)"
                                                            value={editEntry.timing || ''}
                                                            onChange={e => setEditEntry({ ...editEntry, timing: e.target.value })}
                                                            className="w-full p-2 border border-indigo-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder="Teacher Name (optional)"
                                                            value={editEntry.teacher_name || ''}
                                                            onChange={e => setEditEntry({ ...editEntry, teacher_name: e.target.value })}
                                                            className="w-full p-2 border border-indigo-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleSave(day, period)}
                                                                className="flex-1 bg-green-500 text-white px-3 py-2 rounded text-sm hover:bg-green-600 transition-colors font-semibold"
                                                            >
                                                                ✅ Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditEntry(null)}
                                                                className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors font-semibold"
                                                            >
                                                                ❌ Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : entry ? (
                                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-lg border border-indigo-200 hover:shadow-md transition-all">
                                                        <div className="font-semibold text-indigo-900 mb-1">{entry.subject}</div>
                                                        <div className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                                                            <span>⏰</span> {entry.timing}
                                                        </div>
                                                        {entry.teacher_name && (
                                                            <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                                                <span>👨‍🏫</span> {entry.teacher_name}
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => setEditEntry({ ...entry, day, period })}
                                                                className="flex-1 bg-blue-500 text-white px-2 py-1.5 rounded text-xs hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 font-semibold"
                                                            >
                                                                ✏️ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(entry.id)}
                                                                className="flex-1 bg-red-500 text-white px-2 py-1.5 rounded text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-1 font-semibold"
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setEditEntry({ day, period, subject: '', timing: '', teacher_name: '' })}
                                                        className="w-full p-4 text-gray-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:text-blue-600 rounded-lg text-sm border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all font-semibold"
                                                    >
                                                        ➕ Add Subject
                                                    </button>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TimetableTab;
