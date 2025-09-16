import React, { useState, useEffect, useRef } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import './AdminDashboard.scss';
import '../../App.scss';
import { FaTrash } from 'react-icons/fa'; //Trash icon for delete button
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

const AdminDashboard = () => {
    const navigate = useNavigate(); // Navigation function
    const [events, setEvents] = useState([]); // State to store events
    const [selectedEvents, setSelectedEvents] = useState([]); // State for selected events for bulk delete
    const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', signUpLink: '' }); // State for new event form
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [signups, setSignups] = useState([]); // State for storing event signups
    const alertShown = useRef(false);

    const toDateTime = (e) => {
        // ensure time is always "HH:MM"
        const time = (e.time || "00:00").padStart(5, "0");
        // build an ISO-ish string so Date parses reliably
        return new Date(`${e.date}T${time}:00`);
    };

    const sortEvents = (list) =>
        [...list].sort((a, b) => toDateTime(a) - toDateTime(b));

    const orderedEvents = sortEvents(events);

    // Fetch events from the backend
    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await adminAxiosInstance.get('/api/events');
            const sortedEvents = res.data.sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.time}`);
                const dateTimeB = new Date(`${b.date}T${b.time}`);
                return dateTimeA - dateTimeB;
            });
            setEvents(sortedEvents);
        } catch (error) {
            if (!alertShown.current) {
                alertShown.current = true;
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to fetch events.',
                    text: error.message,
                    confirmButtonText: 'OK'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Add a new event
    const addEvent = async (e) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.date || !newEvent.time) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please fill out all fields',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const token = localStorage.getItem('adminToken');

            // Generate recurring events weekly or monthly
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

            // Send each event to the backend
            for (const event of eventsToAdd) {
                await adminAxiosInstance.post('/api/admin/events', event, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Event(s) added successfully',
                confirmButtonText: 'OK'
            });
            // Reset event form fields
            setNewEvent({ title: '', date: '', time: '', location: '', signUpLink: '', repeat: '' });
            fetchEvents();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error adding event.',
                text: error.message,
                confirmButtonText: 'OK'
            });
        }
    };

    // Delete a single event
    const deleteEvent = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete this event.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b6b',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'swal-confirm-button', // Ensures correct text color
            }
        }).then(async (result) => {
            if (!result.isConfirmed) return; // Exit if user cancels

            try {
                const token = localStorage.getItem('adminToken');
                await adminAxiosInstance.delete(`/api/events/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Event deleted successfully',
                    confirmButtonText: 'OK'
                });
                fetchEvents();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to delete event.',
                    text: error.message,
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    // Select/deselect events for bulk delete
    const handleSelect = (id, isChecked) => {
        setSelectedEvents((prevSelected) =>
            isChecked ? [...prevSelected, id] : prevSelected.filter((eventId) => eventId !== id)
        );
    };

    // Bulk delete selected events
    const handleBulkDelete = async () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete this event.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b6b',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'swal-confirm-button', // Ensures correct text color
            }
        }).then(async (result) => {
            if (!result.isConfirmed) return; // Exit if user cancels

            try {
                const token = localStorage.getItem('adminToken');
                await adminAxiosInstance.delete('/api/events/bulk', {
                    headers: { Authorization: `Bearer ${token}` },
                    data: { eventIds: selectedEvents },
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Selected event(s) deleted successfully',
                    confirmButtonText: 'OK'
                });
                setSelectedEvents([]);
                fetchEvents();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to delete selected events.',
                    text: error.message,
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    const updateEvent = async (id, updatedEvent) => {
        try {
            const token = localStorage.getItem('adminToken');
            await adminAxiosInstance.put(`/api/events/${id}`, updatedEvent, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Event updated successfully',
                confirmButtonText: 'OK'
            });
            fetchEvents();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to update event.',
                text: error.message,
                confirmButtonText: 'OK'
            });
        }
    };

    // Fetch event signups
    const fetchSignups = async () => {
        setLoading(true);
        try {
            const res = await adminAxiosInstance.get('/api/admin/signups');
            setSignups(res.data);
        } catch (error) {
            if (!alertShown.current) {
                alertShown.current = true;
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to fetch signups.',
                    text: error.message,
                    confirmButtonText: 'OK'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                if (!token) throw new Error('No token found');

                await adminAxiosInstance.get('/api/admin/verify', {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } catch (error) {
                if (!alertShown.current) {
                    alertShown.current = true;
                    Swal.fire({
                        icon: 'error',
                        title: 'You are not authorized to access this page. Redirecting to login.',
                        text: error.message,
                        confirmButtonText: 'OK'
                    }).then(() => {
                        navigate('/admin'); // navigate after alert closes
                    });
                }
            }
        };

        checkAuth();
        fetchEvents();
        fetchSignups();

        // Cleanup function: component unmounting or route change
        return () => {
            isMounted = false;
        };
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
                            {orderedEvents.map((event) => (
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
