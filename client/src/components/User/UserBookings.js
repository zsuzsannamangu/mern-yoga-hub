import React, { useEffect, useState } from 'react';
import { useUserAuth } from './UserAuthContext';
import axios from 'axios';
import { FaClock, FaCalendarAlt, FaLink, FaLocationArrow, FaEnvelope, FaEdit } from 'react-icons/fa';
import CalendarDays from '../Calendar/CalendarDays';
import Swal from 'sweetalert2';
import io from 'socket.io-client';
import './UserBookings.scss';

function UserBookings() {
    const { user } = useUserAuth();
    const [bookings, setBookings] = useState([]);
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [reschedulingBooking, setReschedulingBooking] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        if (!user) return;
        
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/api/bookings`, {
                    params: { userId: user.id },
                });

                console.log('User bookings raw response:', response.data);

                const now = new Date();

                // Filter out past sessions and cancelled appointments, then sort upcoming bookings
                const sortedBookings = (response.data.bookedSlots || [])
                    .filter((slot) => {
                        const slotDateTime = new Date(`${slot.date}T${slot.time}`);
                        const isFuture = slotDateTime >= now;
                        const notCancelled = slot.status !== 'cancelled';
                        console.log('User slot:', slot.date, slot.time, 'isFuture:', isFuture, 'notCancelled:', notCancelled, 'status:', slot.status);
                        return isFuture && notCancelled; // Only show future/current sessions that aren't cancelled
                    })
                    .sort((a, b) => {
                        const dateA = new Date(`${a.date}T${a.time}`);
                        const dateB = new Date(`${b.date}T${b.time}`);
                        return dateA - dateB;
                    });
                
                console.log('User filtered bookings:', sortedBookings);
                setBookings(sortedBookings);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }
        };

        fetchBookings();

        // Initialize Socket.IO connection for real-time updates
        const socket = io(`${process.env.REACT_APP_API}`);
        
        socket.on('slotBooked', ({ slotId }) => {
            // Remove the booked slot from available slots
            setAvailableSlots((prevSlots) =>
                prevSlots.filter((slot) => slot._id !== slotId)
            );
        });

        socket.on('slotRescheduled', ({ oldSlotId, newSlotId }) => {
            // Remove the old slot and add the new slot
            setAvailableSlots((prevSlots) => {
                const filtered = prevSlots.filter((slot) => slot._id !== oldSlotId);
                // Note: The new slot will be added when the reschedule is complete
                return filtered;
            });
        });

        return () => {
            if (socket && typeof socket.disconnect === 'function') {
                socket.disconnect();
            }
        };
    }, [user]);

    if (!user) {
        return <div>Loading your bookings...</div>; // ✅ moved below the hook
    }

    const formatTime = (date, time) => {
        if (!time || !date) return '';
        const [hour, minute] = time.split(':').map(Number);
        const [year, month, day] = date.split('-').map(Number);
        const dateTime = new Date(year, month - 1, day, hour, minute);

        return dateTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
        });
    };

    // Format date consistently
    const formatDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-');
        return `${month}/${day}`;
    };

    // Normalize session type to match admin terminology
    const normalizeSessionType = (sessionType) => {
        if (!sessionType) return 'General Session';
        
        // Convert user booking terminology to admin terminology
        if (sessionType.includes('Individual Yoga Session')) {
            return 'Private Yoga';
        }
        if (sessionType.includes('Yoga Therapy Session')) {
            return 'Yoga Therapy';
        }
        
        // Return as-is if it's already in admin format or unknown
        return sessionType;
    };

    // Handle reschedule button click
    const handleReschedule = (booking) => {
        setReschedulingBooking(booking);
        setShowRescheduleModal(true);
        setSelectedDate(null);
        setSelectedSlot(null);
        fetchAvailableSlots();
    };

    // Fetch available slots for rescheduling
    const fetchAvailableSlots = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/bookings`);
            const { availableSlots } = response.data;
            const now = new Date();

            console.log('Raw available slots:', availableSlots);

            // Filter out past slots, same as UserBookNew
            const filteredSlots = availableSlots.filter((slot) => {
                const slotDateTime = new Date(`${slot.date}T${slot.time}`);
                return slotDateTime > now;
            });

            console.log('Filtered available slots:', filteredSlots);
            setAvailableSlots(filteredSlots);
        } catch (error) {
            console.error('Error fetching available slots:', error);
        }
    };

    // Handle month navigation
    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    // Handle reschedule submission
    const handleRescheduleSubmit = async () => {
        if (!selectedSlot || !reschedulingBooking) {
            Swal.fire({
                icon: 'warning',
                title: 'Selection Required',
                text: 'Please select a new date and time for your appointment.',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            console.log('Rescheduling with data:', {
                bookingId: reschedulingBooking._id,
                newSlotId: selectedSlot._id,
                newDate: selectedSlot.date,
                newTime: selectedSlot.time
            });

            const response = await axios.put(`${process.env.REACT_APP_API}/api/bookings/${reschedulingBooking._id}/reschedule`, {
                newSlotId: selectedSlot._id,
                newDate: selectedSlot.date,
                newTime: selectedSlot.time
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Appointment Rescheduled',
                    text: 'Your appointment has been successfully rescheduled. You will receive a confirmation email shortly.',
                    confirmButtonText: 'OK'
                });

                // Refresh bookings
                const bookingsResponse = await axios.get(`${process.env.REACT_APP_API}/api/bookings`, {
                    params: { userId: user.id },
                });

                const now = new Date();
                const sortedBookings = (bookingsResponse.data.bookedSlots || [])
                    .filter((slot) => {
                        const slotDateTime = new Date(`${slot.date}T${slot.time}`);
                        const isFuture = slotDateTime >= now;
                        const notCancelled = slot.status !== 'cancelled';
                        return isFuture && notCancelled;
                    })
                    .sort((a, b) => {
                        const dateA = new Date(`${a.date}T${a.time}`);
                        const dateB = new Date(`${b.date}T${b.time}`);
                        return dateA - dateB;
                    });
                
                setBookings(sortedBookings);
                
                // Refresh available slots
                await fetchAvailableSlots();
                
                setShowRescheduleModal(false);
                setReschedulingBooking(null);
            }
        } catch (error) {
            console.error('Error rescheduling appointment:', error);
            console.error('Error response:', error.response?.data);
            Swal.fire({
                icon: 'error',
                title: 'Reschedule Failed',
                text: error.response?.data?.message || error.message || 'Failed to reschedule appointment. Please try again.',
                confirmButtonText: 'OK'
            });
        }
    };

    // Close reschedule modal
    const closeRescheduleModal = () => {
        setShowRescheduleModal(false);
        setReschedulingBooking(null);
        setSelectedDate(null);
        setSelectedSlot(null);
    };

    return (
        <div className="user-bookings">
            <h3 className="section-title">Booked Sessions</h3>
            <div className="title-line"></div>
            {bookings.length > 0 ? (
                bookings.map((booking) => (
                    <div
                        key={booking._id}
                        className="booking-card"
                    >
                        <div className="booking-header">
                            <div className="session-type">
                                <strong>{normalizeSessionType(booking.title || booking.sessionType)}</strong>
                            </div>
                            <button 
                                className="reschedule-btn"
                                onClick={() => handleReschedule(booking)}
                                title="Reschedule Appointment"
                            >
                                <FaEdit className="icon" /> Reschedule
                            </button>
                        </div>
                        <div className="booking-details">
                            <div className="booking-info">
                                <FaCalendarAlt className="icon" />
                                <span>{`${formatDate(booking.date)} at ${formatTime(booking.time, booking.date)}`}</span>
                            </div>
                            <div className="booking-info">
                                <FaClock className="icon" />
                                <span>{booking.length || booking.duration || '60 mins'}</span>
                            </div>
                        </div>
                        <div className="booking-footer">
                            {booking.link ? (
                                <a
                                    href={booking.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="meeting-link"
                                >
                                    <FaLocationArrow className="icon" /> Join Meeting
                                </a>
                            ) : booking.location ? (
                                <div className="location-info">
                                    <FaLocationArrow className="icon" /> {booking.location}
                                </div>
                            ) : (
                                <div className="location-info">
                                    <FaLocationArrow className="icon" /> Location/link TBD
                                </div>
                            )}
                            <a href="/contact">
                                <FaEnvelope className="icon" /> Need to cancel? Email me!
                            </a>
                        </div>
                    </div>
                ))
            ) : (
                <p>No bookings yet.</p>
            )}

            {/* Reschedule Modal */}
            {showRescheduleModal && (
                <div className="reschedule-modal-overlay">
                    <div className="reschedule-modal">
                        <div className="reschedule-modal-header">
                            <h3>Reschedule Appointment</h3>
                            <button className="close-btn" onClick={closeRescheduleModal}>
                                ×
                            </button>
                        </div>
                        <div className="reschedule-modal-content">
                            <div className="current-appointment">
                                <h4>Current Appointment:</h4>
                                <p><strong>{normalizeSessionType(reschedulingBooking?.title || reschedulingBooking?.sessionType)}</strong></p>
                                <p>{formatDate(reschedulingBooking?.date)} at {formatTime(reschedulingBooking?.time, reschedulingBooking?.date)}</p>
                            </div>
                            
                            <div className="calendar-section">
                                <div className="section-header">
                                    <h4>Select New Date & Time:</h4>
                                </div>
                                
                                <div className="calendar-container">
                                    <div className="calendar-header">
                                        <button className="month-nav-button" onClick={handlePrevMonth}>
                                            {'<'}
                                        </button>
                                        <h2>
                                            {new Date(currentYear, currentMonth).toLocaleString('default', {
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </h2>
                                        <button className="month-nav-button" onClick={handleNextMonth}>
                                            {'>'}
                                        </button>
                                    </div>
                                    <CalendarDays
                                        day={new Date(currentYear, currentMonth, 1)}
                                        month={currentMonth}
                                        year={currentYear}
                                        changeCurrentDay={(day) =>
                                            setSelectedDate(new Date(day.year, day.month, day.number))
                                        }
                                        highlightedSlots={availableSlots.map((slot) => slot.date)}
                                    />
                                </div>

                                {selectedDate && (
                                    <div className="time-selection">
                                        <h4>Available Times for {selectedDate.toLocaleDateString()}:</h4>
                                        <div className="time-slots">
                                        {(() => {
                                            const selectedDateStr = selectedDate.toISOString().split('T')[0];
                                            const slotsForDate = availableSlots.filter(slot => slot.date === selectedDateStr);
                                            
                                            console.log('Selected date string:', selectedDateStr);
                                            console.log('Slots for date:', slotsForDate);
                                            
                                            return slotsForDate.length > 0 ? (
                                                slotsForDate
                                                    .sort((a, b) => a.time.localeCompare(b.time))
                                                    .map((slot) => {
                                                        console.log('Rendering slot:', slot);
                                                        const formattedTime = formatTime(slot.date, slot.time);
                                                        console.log('Formatted time:', formattedTime);
                                                        return (
                                                            <button
                                                                key={slot._id}
                                                                className={`time-slot ${selectedSlot?._id === slot._id ? 'selected' : ''}`}
                                                                onClick={() => setSelectedSlot(slot)}
                                                            >
                                                                {formattedTime}
                                                            </button>
                                                        );
                                                    })
                                            ) : (
                                                <p className="no-slots-message">No available slots this day.</p>
                                            );
                                        })()}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="reschedule-actions">
                                <button className="cancel-btn" onClick={closeRescheduleModal}>
                                    Cancel
                                </button>
                                <button 
                                    className="reschedule-submit-btn" 
                                    onClick={handleRescheduleSubmit}
                                    disabled={!selectedSlot}
                                >
                                    Reschedule Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserBookings;
