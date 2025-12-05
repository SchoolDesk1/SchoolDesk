import React, { useState, useEffect } from 'react';

const TimetableTab = ({ token, classId }) => {
    const [timetable, setTimetable] = useState([]);
    const [selectedDay, setSelectedDay] = useState('Monday');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    useEffect(() => {
        // Default to current day if it's a school day, otherwise Monday
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        if (days.includes(today)) setSelectedDay(today);
        else setSelectedDay('Monday');

        if (classId) fetchTimetable();
    }, [classId]);

    const fetchTimetable = async () => {
        try {
            const res = await fetch(`/api/parent/timetable/${classId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setTimetable(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch timetable error:', err);
        }
    };

    const getEntry = (day, period) => {
        return timetable.find(e => e.day === day && e.period_number === period);
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">📅</span> Weekly Timetable
            </h2>

            {!classId ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-xl shadow-sm">
                    <p className="text-yellow-700 font-medium">No class assigned to this student.</p>
                </div>
            ) : (
                <>
                    {/* Mobile View: Day Selector + Vertical List */}
                    <div className="lg:hidden">
                        {/* Day Selector */}
                        <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
                            {days.map(day => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`px-5 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all shadow-sm ${selectedDay === day
                                        ? 'bg-indigo-600 text-white shadow-indigo-200'
                                        : 'bg-white text-gray-500 border border-gray-100'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>

                        {/* Schedule List for Selected Day */}
                        <div className="space-y-3">
                            {periods.map(period => {
                                const entry = getEntry(selectedDay, period);
                                return (
                                    <div key={period} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-50 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg shadow-inner">
                                            {period}
                                        </div>
                                        <div className="flex-1">
                                            {entry ? (
                                                <>
                                                    <h4 className="font-bold text-gray-900 text-lg">{entry.subject}</h4>
                                                    <p className="text-sm text-gray-500 font-medium">⏰ {entry.timing || 'No timing'}</p>
                                                    {entry.teacher && <p className="text-xs text-indigo-500 mt-1">👨‍🏫 {entry.teacher}</p>}
                                                </>
                                            ) : (
                                                <p className="text-gray-400 italic">Free Period</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desktop View: Full Table */}
                    <div className="hidden lg:block bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                        <th className="p-4 text-left rounded-tl-xl font-bold">Period</th>
                                        {days.map((day, index) => (
                                            <th key={day} className={`p-4 text-left font-bold ${index === days.length - 1 ? 'rounded-tr-xl' : ''}`}>{day}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {periods.map((period, idx) => (
                                        <tr key={period} className={`group hover:bg-indigo-50/30 transition-colors ${idx !== periods.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                            <td className="p-4 font-bold text-indigo-900 bg-indigo-50/50 w-20 text-center">{period}</td>
                                            {days.map(day => {
                                                const entry = getEntry(day, period);
                                                return (
                                                    <td key={day} className="p-3">
                                                        {entry ? (
                                                            <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm group-hover:shadow-md transition-all hover:-translate-y-1">
                                                                <div className="font-bold text-indigo-900 mb-1">{entry.subject}</div>
                                                                <div className="text-xs text-gray-500 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded-md">
                                                                    {entry.timing || 'N/A'}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="h-full flex items-center justify-center">
                                                                <span className="w-2 h-2 rounded-full bg-gray-200"></span>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {timetable.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4 opacity-30">📅</div>
                            <p className="text-gray-400 text-lg">No timetable data available yet.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default TimetableTab;
