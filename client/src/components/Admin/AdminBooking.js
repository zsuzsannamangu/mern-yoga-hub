import React, { useState, useEffect, useCallback } from 'react';
import { adminAxiosInstance } from '../../config/axiosConfig'; //using named exports ({}), not default export
import AdminLayout from './AdminLayout';
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
    const [upcomingSlots, setUpcomingSlots] = useState([]);
    const [passedSlots, setPassedSlots] = useState([]);
    const [newSlot, setNewSlot] = useState({ date: '', time: '' }); // New slot form state
    const [loading, setLoading] = useState(false); // Loading state for API calls
    const [searchEmail, setSearchEmail] = useState(''); // Search email state
    const [searchResults, setSearchResults] = useState(null); // Search results state
    const [searching, setSearching] = useState(false); // Searching state

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
     * Formats a date string into a human-readable format without timezone conversion.
     * @param {string} dateString - Date in YYYY-MM-DD format
     * @returns {string} - Formatted date (e.g., "Fri, Sep 26, 2024")
     */
    const formatDate = (dateString) => {
        if (!dateString) return '';
        // Parse the date string directly to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    /**
     * Fetches slots (available and booked) from the API, categorizes them into different states.
     * Uses `useCallback` to ensure consistency in `useEffect`.
     */
    const fetchSlots = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminAxiosInstance.get('/api/bookings');
            let { availableSlots, bookedSlots: fetchedBookedSlots } = res.data;

            const now = new Date();

            // Filter out passed available slots
            availableSlots = availableSlots.filter((slot) => {
                const slotDateTime = new Date(`${slot.date}T${slot.time}`);
                return slotDateTime > now;
            });

            // Sort slots by date
            const sortedAvailableSlots = availableSlots.sort((a, b) => new Date(a.date) - new Date(b.date));
            const sortedBookedSlots = fetchedBookedSlots.sort((a, b) => new Date(a.date) - new Date(b.date));

            setAvailableSlots(sortedAvailableSlots);

            // Categorize booked slots
            const { upcoming, passed } = categorizeBookedSlots(sortedBookedSlots); // Ensure slots are categorized after sorting

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

    /**
     * Search for bookings by email using the diagnostic endpoint
     */
    const searchBookingsByEmail = async () => {
        if (!searchEmail.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Email Required',
                text: 'Please enter an email address to search.',
                confirmButtonText: 'OK'
            });
            return;
        }

        setSearching(true);
        try {
            const response = await adminAxiosInstance.get(`/api/admin/diagnostics/bookings-by-email?email=${encodeURIComponent(searchEmail.trim())}`);
            setSearchResults(response.data);
            
            if (response.data.bookingsByEmail.length === 0 && 
                (!response.data.user || response.data.bookingsByUserId.length === 0)) {
                Swal.fire({
                    icon: 'info',
                    title: 'No Bookings Found',
                    html: `
                        <p>No bookings found for: <strong>${searchEmail}</strong></p>
                        ${response.data.userFound ? '<p>User account exists but has no bookings.</p>' : '<p>No user account found with this email.</p>'}
                        ${response.data.allYahooBookings.length > 0 ? 
                            `<p>Found ${response.data.allYahooBookings.length} other yahoo.com bookings. Check if there's a typo.</p>` : ''}
                    `,
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Search error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Search Failed',
                text: error.response?.data?.message || 'Failed to search bookings. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            setSearching(false);
        }
    };

    return (
        <AdminLayout>
            <div className="admin-booking">
            <div className="admin-booking-container">
                <h3 className="section-title">Manage Bookable Slots</h3>
                
                {/* Search by Email Section */}
                <div className="search-booking-section">
                    <h3>Search Bookings by Email</h3>
                    <div className="search-form">
                        <input
                            type="email"
                            placeholder="Enter email address (e.g., mistymansolilli@yahoo.com)"
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && searchBookingsByEmail()}
                            className="search-email-input"
                        />
                        <button 
                            onClick={searchBookingsByEmail} 
                            disabled={searching}
                            className="search-button"
                        >
                            {searching ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                    
                    {searchResults && (
                        <div className="search-results">
                            <h4>Search Results for: {searchResults.email}</h4>
                            
                            {searchResults.userFound && (
                                <div className="user-info">
                                    <p><strong>User Account Found:</strong></p>
                                    <p>Name: {searchResults.user.firstName} {searchResults.user.lastName}</p>
                                    <p>Email: {searchResults.user.email}</p>
                                    <p>Verified: {searchResults.user.isVerified ? 'Yes' : 'No'}</p>
                                    <p>User ID: {searchResults.user.id}</p>
                                </div>
                            )}
                            
                            {searchResults.bookingsByEmail.length > 0 && (
                                <div className="bookings-list">
                                    <h5>Bookings Found by Email ({searchResults.bookingsByEmail.length}):</h5>
                                    <ul>
                                        {searchResults.bookingsByEmail.map((booking) => (
                                            <li key={booking.id} className="booking-result-item">
                                                <p><strong>Date:</strong> {booking.date} at {booking.time}</p>
                                                <p><strong>Name:</strong> {booking.firstName} {booking.lastName}</p>
                                                <p><strong>Email:</strong> {booking.email}</p>
                                                <p><strong>Session Type:</strong> {booking.sessionType}</p>
                                                <p><strong>Booking ID:</strong> {booking.id}</p>
                                                {booking.message && <p><strong>Message:</strong> {booking.message}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {searchResults.bookingsByUserId.length > 0 && (
                                <div className="bookings-list">
                                    <h5>Bookings Found by User ID ({searchResults.bookingsByUserId.length}):</h5>
                                    <ul>
                                        {searchResults.bookingsByUserId.map((booking) => (
                                            <li key={booking.id} className="booking-result-item">
                                                <p><strong>Date:</strong> {booking.date} at {booking.time}</p>
                                                <p><strong>Name:</strong> {booking.firstName} {booking.lastName}</p>
                                                <p><strong>Email:</strong> {booking.email}</p>
                                                <p><strong>Session Type:</strong> {booking.sessionType}</p>
                                                <p><strong>Booking ID:</strong> {booking.id}</p>
                                                {booking.message && <p><strong>Message:</strong> {booking.message}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {searchResults.allYahooBookings.length > 0 && (
                                <div className="similar-bookings">
                                    <h5>Other Yahoo.com Bookings (for typo checking):</h5>
                                    <ul>
                                        {searchResults.allYahooBookings.slice(0, 10).map((booking, index) => (
                                            <li key={index}>
                                                {booking.email} - {booking.date} {booking.time} - {booking.firstName} {booking.lastName}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {searchResults.bookingsByEmail.length === 0 && 
                             searchResults.bookingsByUserId.length === 0 && (
                                <p className="no-results">No bookings found for this email address.</p>
                            )}
                        </div>
                    )}
                </div>
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
                                                <td>{formatDate(slot.date)}</td>
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
                        <ul>
                            {upcomingSlots.map((slot) => (
                                <li key={slot._id} className="slot-item">
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
                        <ul>
                            {passedSlots.map((slot) => (
                                <li key={slot._id} className="slot-item">
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
        </AdminLayout>
    );
};

export default AdminBooking;
