import React, { useState, useEffect } from 'react';

const EventsTab = ({ token }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/parent/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch events error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Holiday': 'bg-green-100 border-green-500 text-green-700',
            'Exam': 'bg-red-100 border-red-500 text-red-700',
            'PTM': 'bg-blue-100 border-blue-500 text-blue-700',
            'Competition': 'bg-purple-100 border-purple-500 text-purple-700',
            'General': 'bg-gray-100 border-gray-500 text-gray-700'
        };
        return colors[category] || colors['General'];
    };

    const getCategoryIcon = (category) => {
        const icons = {
            'Holiday': '🏖️',
            'Exam': '📝',
            'PTM': '👥',
            'Competition': '🏆',
            'General': '📅'
        };
        return icons[category] || '📅';
    };

    // Separate upcoming and past events
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(e => new Date(e.event_date) >= today).sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
    const pastEvents = events.filter(e => new Date(e.event_date) < today).sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

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
                <span className="mr-3">📅</span> School Events
            </h2>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                        <span className="mr-2">⏰</span> Upcoming Events
                    </h3>
                    <div className="space-y-4">
                        {upcomingEvents.map(event => (
                            <div key={event.id} className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-l-4 ${getCategoryColor(event.category)}`}>
                                <div className="flex items-start gap-4">
                                    <div className="text-5xl">{getCategoryIcon(event.category)}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-xl text-gray-800">{event.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
                                                {event.category}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-2">
                                            📅 {new Date(event.event_date).toLocaleDateString('en-IN', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        {event.description && (
                                            <p className="text-gray-700 mt-2">{event.description}</p>
                                        )}
                                        {/* Days until event */}
                                        {(() => {
                                            const daysUntil = Math.ceil((new Date(event.event_date) - today) / (1000 * 60 * 60 * 24));
                                            return daysUntil >= 0 && (
                                                <div className="mt-3 inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
                                                    {daysUntil === 0 ? '📍 Today!' : daysUntil === 1 ? '⏰ Tomorrow' : `⏰ ${daysUntil} days away`}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Past Events */}
            {pastEvents.length > 0 && (
                <div>
                    <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center">
                        <span className="mr-2">📜</span> Past Events
                    </h3>
                    <div className="space-y-3">
                        {pastEvents.slice(0, 5).map(event => (
                            <div key={event.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200 opacity-75">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-2xl">{getCategoryIcon(event.category)}</span>
                                    <h4 className="font-semibold text-gray-800">{event.title}</h4>
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
                                        {event.category}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 ml-11">
                                    {new Date(event.event_date).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Events */}
            {events.length === 0 && (
                <div className="bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-xl border border-indigo-100 text-center">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-gray-500 text-lg">No events scheduled yet.</p>
                </div>
            )}
        </div>
    );
};

export default EventsTab;
