import React, { useState, useEffect } from 'react';

const EventsTab = ({ token }) => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({
        title: '',
        event_date: '',
        description: '',
        category: 'General'
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/school/events', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setEvents(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Fetch events error:', err);
        }
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/school/events/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(newEvent)
            });
            if (res.ok) {
                setNewEvent({ title: '', event_date: '', description: '', category: 'General' });
                fetchEvents();
                alert('Event created successfully!');
            }
        } catch (err) {
            console.error(err);
            alert('Error creating event');
        }
    };

    const handleDeleteEvent = async (id, title) => {
        if (!window.confirm(`Delete event "${title}"?`)) return;
        try {
            const res = await fetch(`/api/school/events/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert('Event deleted');
                fetchEvents();
            }
        } catch (err) {
            console.error(err);
            alert('Error deleting event');
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

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="mr-3">📅</span> Events Calendar
            </h2>

            {/* Add Event Form */}
            <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-xl mb-6 border border-indigo-100">
                <h3 className="font-bold text-xl mb-4 text-indigo-900">Add New Event</h3>
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
                            <input
                                type="text"
                                required
                                value={newEvent.title}
                                onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="Annual Sports Day"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                            <input
                                type="date"
                                required
                                value={newEvent.event_date}
                                onChange={e => setNewEvent({ ...newEvent, event_date: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <select
                                value={newEvent.category}
                                onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                            >
                                <option value="General">General</option>
                                <option value="Holiday">Holiday</option>
                                <option value="Exam">Exam</option>
                                <option value="PTM">PTM (Parent-Teacher Meeting)</option>
                                <option value="Competition">Competition</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <input
                                type="text"
                                value={newEvent.description}
                                onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                                className="w-full p-3 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
                                placeholder="Optional details"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:scale-105 transition-all shadow-lg"
                    >
                        Add Event
                    </button>
                </form>
            </div>

            {/* Events List */}
            <div className="space-y-4">
                {events.map(event => (
                    <div key={event.id} className={`p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border-l-4 ${getCategoryColor(event.category)}`}>
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-bold text-xl text-gray-800">{event.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(event.category)}`}>
                                        {event.category}
                                    </span>
                                </div>
                                <div className="flex gap-4 text-sm text-gray-600 mb-2">
                                    <span>📅 {new Date(event.event_date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                {event.description && (
                                    <p className="text-gray-700 mt-2">{event.description}</p>
                                )}
                            </div>
                            <button
                                onClick={() => handleDeleteEvent(event.id, event.title)}
                                className="text-red-600 hover:text-red-800 transition-colors ml-4"
                                title="Delete Event"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {events.length === 0 && (
                <div className="text-center py-20">
                    <div className="text-6xl mb-4">📅</div>
                    <p className="text-gray-400 text-lg">No events scheduled yet.</p>
                </div>
            )}
        </div>
    );
};

export default EventsTab;
