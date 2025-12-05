import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PerformanceTab = ({ token, userId }) => {
    const [performance, setPerformance] = useState({ marks: [], homework: { total: 0 } });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) fetchPerformance();
    }, [userId]);

    const fetchPerformance = async () => {
        try {
            const res = await fetch(`/api/parent/performance/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setPerformance(data);
        } catch (err) {
            console.error('Fetch performance error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Prepare data for charts
    const marksData = performance.marks?.map(m => ({
        name: `${m.subject} - ${m.test_name || 'Test'}`,
        score: ((m.marks / m.max_marks) * 100).toFixed(1),
        marks: m.marks,
        total: m.max_marks,
        date: new Date(m.test_date).toLocaleDateString()
    })) || [];

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
                <span className="mr-3">📊</span> Student Performance
            </h2>

            {performance.marks?.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-xl border border-indigo-100 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-gray-500 text-lg">No performance data available yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Marks will appear here once teachers add them.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white">
                            <div className="text-3xl mb-2">📝</div>
                            <p className="text-sm opacity-90">Total Tests</p>
                            <p className="text-3xl font-bold">{performance.marks?.length || 0}</p>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
                            <div className="text-3xl mb-2">✅</div>
                            <p className="text-sm opacity-90">Average Score</p>
                            <p className="text-3xl font-bold">
                                {performance.marks?.length > 0
                                    ? (performance.marks.reduce((sum, m) => sum + (m.marks / m.max_marks * 100), 0) / performance.marks.length).toFixed(1)
                                    : 0}%
                            </p>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white">
                            <div className="text-3xl mb-2">📚</div>
                            <p className="text-sm opacity-90">Homework Count</p>
                            <p className="text-3xl font-bold">{performance.homework?.total || 0}</p>
                        </div>
                    </div>

                    {/* Marks Chart */}
                    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-indigo-100">
                        <h3 className="font-bold text-xl mb-4 text-indigo-900">Test Scores (%)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={marksData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                                <YAxis domain={[0, 100]} />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload[0]) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
                                                    <p className="font-bold">{data.name}</p>
                                                    <p className="text-sm">Score: {data.marks}/{data.total}</p>
                                                    <p className="text-sm text-green-600">Percentage: {data.score}%</p>
                                                    <p className="text-xs text-gray-500">{data.date}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="score" fill="#4f46e5" name="Score %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Detailed Marks Table */}
                    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-indigo-100 overflow-x-auto">
                        <h3 className="font-bold text-xl mb-4 text-indigo-900">Detailed Marks</h3>
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                <tr>
                                    <th className="p-3 text-left">Subject</th>
                                    <th className="p-3 text-left">Test</th>
                                    <th className="p-3 text-center">Marks</th>
                                    <th className="p-3 text-center">Percentage</th>
                                    <th className="p-3 text-left">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {performance.marks?.map((mark, idx) => (
                                    <tr key={idx} className={`border-b ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                        <td className="p-3 font-semibold">{mark.subject}</td>
                                        <td className="p-3">{mark.test_name || 'Test'}</td>
                                        <td className="p-3 text-center font-bold text-indigo-900">
                                            {mark.marks}/{mark.max_marks}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${(mark.marks / mark.max_marks * 100) >= 75 ? 'bg-green-100 text-green-700' :
                                                    (mark.marks / mark.max_marks * 100) >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {((mark.marks / mark.max_marks) * 100).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="p-3 text-sm text-gray-600">
                                            {new Date(mark.test_date).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PerformanceTab;
