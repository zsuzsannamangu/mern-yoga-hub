import React, { useState, useEffect, useCallback } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig'; //using named exports ({}), not default export
import AdminNavbar from './AdminNavbar';
import './AdminBooking.scss';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

/**
 * AdminBooking Component:
 * - Manages bookable slots (available, booked, upcoming, passed)
 * - Fetches slots from backend
 * - Allows admin to add, delete, and categorize slots
 */

const AdminBooking = () => {
    // State to store different types of slots
    const [availableSlots, setAvailableSlots] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [upcomingSlots, setUpcomingSlots] = useState([]);
    const [passedSlots, setPassedSlots] = useState([]);
    const [newSlot, setNewSlot] = useState({ date: '', time: '' }); // New slot form state
    const [loading, setLoading] = useState(false); // Loading state for API calls

    /**
     * Formats a time string into a human-readable format.
     * @param {string} time - Time in HH:mm format
     * @returns {string} - Formatted time (e.g., "10:30 AM")
     */

    const formatTime = (time) => {
        const [hour, minute] = time.split(':');
        const date = new Date();
        date.setHours(hour, minute);
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    };

    /**
     * Fetches slots (available and booked) from the API, categorizes them into different states.
     * Uses `useCallback` to ensure consistency in `useEffect`.
     */
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

            // Sort slots by date
            const sortedAvailableSlots = availableSlots.sort((a, b) => new Date(a.date) - new Date(b.date));
            const sortedBookedSlots = bookedSlots.sort((a, b) => new Date(a.date) - new Date(b.date));

            setAvailableSlots(sortedAvailableSlots);
            setBookedSlots(sortedBookedSlots); // This will trigger useEffect for categorization

            // Categorize booked slots
            let { upcoming, passed } = categorizeBookedSlots(sortedBookedSlots); // Ensure slots are categorized after sorting

            // Update state
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
        return { upcoming, passed }
    };

    // Re-categorize slots periodically, every minute
    useEffect(() => {
        const interval = setInterval(() => {
            fetchSlots(); // Refresh the slots periodically, which already categorizes them
        }, 60000); // Re-fetch every 1 minute
        return () => clearInterval(interval);
    }, [fetchSlots]);

    /**
     * Handles adding a new slot.
     * - Validates input fields
     * - Allows repeating slots (daily/weekly)
     * - Sends request to backend
     */
    const addSlot = async (e) => {
        e.preventDefault();
        if (!newSlot.date || !newSlot.time) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please fill out all the fields!',
                confirmButtonText: 'OK'
            });
            return;
        }

        const slots = [];
        const startDate = new Date(newSlot.date);
        const { repeat, occurrences } = newSlot;

        // Handle repeating slots
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

        // Send request to add slots
        try {
            const token = localStorage.getItem('adminToken');
            await adminAxiosInstance.post('/api/bookings', { slots }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Slots added successfully.',
                confirmButtonText: 'OK'
            });
            setNewSlot({ date: '', time: '', repeat: '', occurrences: '' });
            fetchSlots(); // Refresh slots list
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to add slot.',
                text: 'Please try again later.',
                confirmButtonText: 'OK'
            });
        }
    };

    /**
     * Deletes a specific slot.
     * - Prompts confirmation
     * - Sends delete request to backend
     */
    const deleteSlot = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete the slot.',
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
                await adminAxiosInstance.delete(`/api/bookings/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Slot deleted successfully.',
                    confirmButtonText: 'OK'
                });

                fetchSlots(); // Refresh slot list after deletion
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error Deleting Slot',
                    text: error.response?.data?.message || 'Something went wrong. Please try again later.',
                    confirmButtonText: 'OK'
                });
            }
        });
    };

    /**
     * Deletes a booked session.
     * - Prompts confirmation
     * - Sends delete request to backend
     */
    const deleteSession = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'This will permanently delete this session.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b6b',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            customClass: {
                confirmButton: 'swal-confirm-button',
            }
        }).then(async (result) => {
            if (!result.isConfirmed) return; // Exit if user cancels

            try {
                const token = localStorage.getItem('adminToken');
                await adminAxiosInstance.delete(`/api/bookings/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Session deleted successfully',
                    confirmButtonText: 'OK'
                });
                fetchSlots(); // Refresh the slots after deletion
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Failed to delete session.',
                    text: error.message,
                    confirmButtonText: 'OK'
                });
            }
        });
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

                <div className="slots-table-container">
                    <h3>Available Slots</h3>

                    {loading ? (
                        <p>Loading...</p>
                    ) : availableSlots.length > 0 ? (
                        <div className="available-slots-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableSlots
                                        .sort((a, b) => {
                                            const dateTimeA = new Date(`${a.date} ${a.time}`);
                                            const dateTimeB = new Date(`${b.date} ${b.time}`);
                                            return dateTimeA - dateTimeB;
                                        })
                                        .map((slot) => (
                                            <tr key={slot._id}>
                                                <td>{new Date(slot.date).toLocaleDateString('en-US', { 
                                                    weekday: 'short', 
                                                    year: 'numeric', 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })}</td>
                                                <td>{formatTime(slot.time)}</td>
                                                <td>
                                                    <button
                                                        onClick={() => deleteSlot(slot._id)}
                                                        className="delete-slot-button"
                                                        title="Delete slot"
                                                    >
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
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
