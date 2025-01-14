import React, { useState, useEffect, useCallback } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig'; //using named exports ({}), not default export
import AdminNavbar from './AdminNavbar';
import './AdminBooking.scss';
import '../../App.scss';

const AdminBooking = () => {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [upcomingSlots, setUpcomingSlots] = useState([]);
    const [passedSlots, setPassedSlots] = useState([]);
    const [newSlot, setNewSlot] = useState({ date: '', time: '' });
    const [loading, setLoading] = useState(false);

    const formatTime = (time) => {
        const [hour, minute] = time.split(':');
        const date = new Date();
        date.setHours(hour, minute);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    // Fetch all slots (available and booked)
    const fetchSlots = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminAxiosInstance.get('/api/bookings');
            let { availableSlots, bookedSlots } = res.data;

            const now = new Date();

            // Filter out passed available slots
            availableSlots = availableSlots.filter((slot) => {
                const slotDateTime = new Date(`${slot.date}T${slot.time}`);
                return slotDateTime > now;
            });

            const sortedAvailableSlots = availableSlots.sort((a, b) => new Date(a.date) - new Date(b.date));
            const sortedBookedSlots = bookedSlots.sort((a, b) => new Date(a.date) - new Date(b.date));

            console.log("Sorted Available Slots:", sortedAvailableSlots);
            console.log("Sorted Booked Slots:", sortedBookedSlots);

            setAvailableSlots(sortedAvailableSlots);
            setBookedSlots(sortedBookedSlots); // This will trigger useEffect for categorization
            let {upcoming, passed} = categorizeBookedSlots(sortedBookedSlots); // Ensure slots are categorized after sorting
            setUpcomingSlots([...upcoming]); // Ensure immutability
            setPassedSlots([...passed]);    // Ensure immutability
        } catch (error) {
            console.error('Failed to fetch slots:', error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Categorize booked slots into upcoming and passed
    const categorizeBookedSlots = (slots) => {
        const now = new Date();
        const upcoming = [];
        const passed = [];

        slots.forEach((slot) => {
            const slotDate = new Date(`${slot.date}T${slot.time}`);
            if (slotDate > now) {
                upcoming.push(slot);
            } else {
                passed.push(slot);
            }
        });
        return {upcoming, passed}
    };

    // Re-categorize slots periodically
    useEffect(() => {
        const interval = setInterval(() => {
            fetchSlots(); // Refresh the slots periodically, which already categorizes them
        }, 60000); // Re-fetch every 1 minute
        return () => clearInterval(interval);
    }, [fetchSlots]);

    // Add a new slot
    const addSlot = async (e) => {
        e.preventDefault();
        if (!newSlot.date || !newSlot.time) {
            alert('Please fill out all fields');
            return;
        }

        const slots = [];
        const startDate = new Date(newSlot.date);
        const { repeat, occurrences } = newSlot;

        if (repeat && occurrences > 0) {
            const confirmation = window.confirm(`This will add ${occurrences} slots. Proceed?`);
            if (!confirmation) return;

            for (let i = 0; i < occurrences; i++) {
                const date = new Date(startDate);
                if (repeat === 'daily') {
                    date.setDate(startDate.getDate() + i);
                } else if (repeat === 'weekly') {
                    date.setDate(startDate.getDate() + i * 7);
                }
                slots.push({ date: date.toISOString().split('T')[0], time: newSlot.time });
            }
        } else {
            slots.push({ date: newSlot.date, time: newSlot.time });
        }

        try {
            const token = localStorage.getItem('adminToken');
            await adminAxiosInstance.post('/api/bookings', { slots }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Slots added successfully');
            setNewSlot({ date: '', time: '', repeat: '', occurrences: '' });
            fetchSlots();
        } catch (error) {
            console.error('Error adding slot:', error.message);
            alert('Failed to add slots. Please try again.');
        }
    };

    // Delete a slot
    const deleteSlot = async (id) => {
        if (!window.confirm('Are you sure you want to delete this slot?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            await adminAxiosInstance.delete(`/api/bookings/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Slot deleted successfully');
            fetchSlots();
        } catch (error) {
            console.error('Error deleting slot:', error.message);
        }
    };

    // Delete a session (upcoming or passed)
    const deleteSession = async (id) => {
        if (!window.confirm('Are you sure you want to delete this session?')) return;

        try {
            const token = localStorage.getItem('adminToken');
            await adminAxiosInstance.delete(`/api/bookings/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert('Session deleted successfully');
            fetchSlots(); // Refresh the slots after deletion
        } catch (error) {
            console.error('Error deleting session:', error.message);
            alert('Failed to delete session. Please try again.');
        }
    };

    // Load slots on component mount
    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    return (
        <div className="admin-booking">
            <AdminNavbar />
            <div className="admin-booking-container">
                <h3 className="section-title">Manage Bookable Slots</h3>
                <form className="admin-booking-form" onSubmit={addSlot}>
                    <h3>Add New Slot</h3>
                    <div className="form-group">
                        <label>Date</label>
                        <input
                            type="date"
                            value={newSlot.date}
                            onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Time</label>
                        <input
                            type="time"
                            value={newSlot.time}
                            onChange={(e) => setNewSlot({ ...newSlot, time: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>Repeat</label>
                        <select
                            value={newSlot.repeat || ''}
                            onChange={(e) => setNewSlot({ ...newSlot, repeat: e.target.value })}
                        >
                            <option value="">No Repeat</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Number of Occurrences</label>
                        <input
                            type="number"
                            min="1"
                            value={newSlot.occurrences || ''}
                            onChange={(e) => setNewSlot({ ...newSlot, occurrences: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="add-slot-button">Add Slot</button>
                </form>

                <div className="slots-list">
                    <h3>Available Slots</h3>

                    {loading ? (
                        <p>Loading...</p>
                    ) : availableSlots.length > 0 ? (
                        <ul>
                            {availableSlots.map((slot) => (
                                <li key={slot._id} className="slot-item">
                                    <p>{slot.date} at {formatTime(slot.time)}</p>
                                    <button
                                        onClick={() => deleteSlot(slot._id)}
                                        className="delete-slot-button"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No slots available</p>
                    )}
                </div>

                <div className="slots-list">
                    <h3>Booked Slots</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : upcomingSlots.length > 0 ? (
                        <ul role="list">
                            {upcomingSlots.map((slot) => (
                                <li key={slot._id} role="listitem" className="slot-item">
                                    <p>
                                        <strong>{slot.date}</strong> at {formatTime(slot.time)} - Booked by {slot.firstName} {slot.lastName} ({slot.email})
                                    </p>
                                    <p>Client's Message: {slot.message}</p>
                                    <button onClick={() => deleteSession(slot._id)} className="delete-slot-button">
                                        Delete session
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No booked slots</p>
                    )}
                </div>

                <div className="slots-list">
                    <h3>Passed Sessions</h3>
                    {loading ? (
                        <p>Loading...</p>
                    ) : passedSlots.length > 0 ? (
                        <ul role="list">
                            {passedSlots.map((slot) => (
                                <li key={slot._id} role="listitem" className="slot-item">
                                    <p>
                                        <strong>{slot.date}</strong> at {formatTime(slot.time)} - Booked by {slot.firstName} {slot.lastName} ({slot.email})
                                    </p>
                                    <p>Client's Message: {slot.message}</p>
                                    <div className="button-group">
                                        <button onClick={() => deleteSession(slot._id)} className="delete-slot-button">
                                            Delete session
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No passed sessions</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminBooking;
