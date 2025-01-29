import React, { useState, useEffect } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import './AdminDashboard.scss';
import '../../App.scss';
import { FaTrash } from 'react-icons/fa';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]); // State for selected events for bulk delete
    const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', signUpLink: '' });
    const [loading, setLoading] = useState(false);
    const [signups, setSignups] = useState([]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await adminAxiosInstance.get('/api/events');
            const sortedEvents = res.data.sort((a, b) => new Date(a.date) - new Date(b.date));
            setEvents(sortedEvents);
        } catch (error) {
            alert('Failed to fetch events. Please try again later.');
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const addEvent = async (e) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.date || !newEvent.time) {
            alert('Please fill out all fields');
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');

            // Generate recurring events if specified
            const eventsToAdd = [];
            let currentDate = new Date(newEvent.date);

            if (newEvent.repeat === 'weekly') {
                for (let i = 0; i < 12; i++) {
                    eventsToAdd.push({
                        ...newEvent,
                        date: currentDate.toISOString().split('T')[0],
                    });
                    currentDate.setDate(currentDate.getDate() + 7);
                }
            } else if (newEvent.repeat === 'monthly') {
                for (let i = 0; i < 6; i++) {
                    eventsToAdd.push({
                        ...newEvent,
                        date: currentDate.toISOString().split('T')[0],
                    });
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            } else {
                eventsToAdd.push(newEvent);
            }

            for (const event of eventsToAdd) {
                await adminAxiosInstance.post('/api/admin/events', event, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            alert('Event(s) added successfully');
            setNewEvent({ title: '', date: '', time: '', location: '', signUpLink: '', repeat: '' });
            fetchEvents();
        } catch (error) {
            alert('Error adding event');
            console.error(error.message);
        }
    };

    const deleteEvent = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) {
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');
            await adminAxiosInstance.delete(`/api/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Event deleted successfully');
            fetchEvents();
        } catch (error) {
            alert('Failed to delete event');
            console.error('Delete Event Error:', error.message);
        }
    };

    const handleSelect = (id, isChecked) => {
        setSelectedEvents((prevSelected) =>
            isChecked ? [...prevSelected, id] : prevSelected.filter((eventId) => eventId !== id)
        );
    };

    const handleBulkDelete = async () => {
        if (!window.confirm('Are you sure you want to delete the selected events?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            await adminAxiosInstance.delete('/api/events/bulk', {
                headers: { Authorization: `Bearer ${token}` },
                data: { eventIds: selectedEvents },
            });
            alert('Selected events deleted successfully!');
            setSelectedEvents([]);
            fetchEvents();
        } catch (error) {
            alert('Failed to delete selected events');
            console.error('Bulk Delete Error:', error.message);
        }
    };

    const updateEvent = async (id, updatedEvent) => {
        try {
            const token = localStorage.getItem('adminToken');
            await adminAxiosInstance.put(`/api/events/${id}`, updatedEvent, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Event updated successfully');
            fetchEvents();
        } catch (error) {
            alert('Failed to update event');
            console.error('Update Event Error:', error.message);
        }
    };

    const fetchSignups = async () => {
        setLoading(true);
        try {
            const res = await adminAxiosInstance.get('/api/admin/signups');
            setSignups(res.data);
        } catch (error) {
            alert('Failed to fetch signups. Please try again later.');
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) throw new Error('No token found');
                await adminAxiosInstance.get('/api/admin/verify', {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                console.error('Authorization failed:', error.message);
                alert('You are not authorized to access this page. Redirecting to login.');
                navigate('/admin');
            }
        };

        checkAuth();
        fetchEvents();
        fetchSignups();
    }, [navigate]);

    return (
        <div className="admin-dashboard">
            <AdminNavbar />
            <h3 className="section-title">Manage Classes and Events</h3>
            <form className="event-form" onSubmit={addEvent}>
                <h3>Add New Event</h3>
                <div className="form-group">
                    <label>Title</label>
                    <input
                        type="text"
                        placeholder=""
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Time</label>
                    <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Location</label>
                    <input
                        type="text"
                        placeholder=""
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Sign-Up Link</label>
                    <input
                        type="url"
                        placeholder=""
                        value={newEvent.signUpLink}
                        onChange={(e) => setNewEvent({ ...newEvent, signUpLink: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Repeat</label>
                    <select
                        value={newEvent.repeat}
                        onChange={(e) => setNewEvent({ ...newEvent, repeat: e.target.value })}
                    >
                        <option value="">None</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <button type="submit" className="add-event-button">Add Event</button>
            </form>

            <div className="upcoming-events-container">
                <h3>Upcoming Events</h3>
                {loading ? (
                    <p>Loading events...</p>
                ) : events.length > 0 ? (
                    <>
                        <button
                            onClick={handleBulkDelete}
                            disabled={selectedEvents.length === 0}
                            className="bulk-delete-button"
                        >
                            <FaTrash className="icon" />
                        </button>
                        <ul>
                            {events.map((event) => (
                                <li key={event._id} className="event-card">
                                    <div className="event-details">
                                        <input
                                            type="checkbox"
                                            onChange={(e) => handleSelect(event._id, e.target.checked)}
                                            checked={selectedEvents.includes(event._id)}
                                        />
                                        <p>
                                            <strong>{event.title}</strong> - {event.date} {event.time} at {event.location}
                                        </p>
                                    </div>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const updatedData = {
                                                title: e.target.title.value,
                                                date: e.target.date.value,
                                                time: e.target.time.value,
                                                location: e.target.location.value,
                                                signUpLink: e.target.signUpLink.value,
                                            };
                                            updateEvent(event._id, updatedData);
                                        }}
                                    >
                                        <input type="text" name="title" defaultValue={event.title} placeholder="Title" />
                                        <input type="date" name="date" defaultValue={event.date} />
                                        <input type="time" name="time" defaultValue={event.time} />
                                        <input type="text" name="location" defaultValue={event.location} placeholder="Location" />
                                        <input type="text" name="signUpLink" defaultValue={event.signUpLink} placeholder="Sign Up Link" />
                                        <button type="submit" className="update-event-button">Update</button>
                                    </form>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p>No events added yet.</p>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
