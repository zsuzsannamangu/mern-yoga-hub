import React, { useEffect, useState } from 'react';
import { useUserAuth } from './UserAuthContext';
import axios from 'axios';
import { FaClock, FaCalendarAlt, FaLink, FaLocationArrow, FaEnvelope } from 'react-icons/fa';
import './UserBookings.scss';

function UserBookings() {
    const { user } = useUserAuth();
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        if (!user) return;
        const fetchBookings = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API}/api/bookings`, {
                    params: { userId: user.id },
                });

                const now = new Date();

                // Add the isPast flag to each booking
                const sortedBookings = (response.data.bookedSlots || [])
                    .map((slot) => {
                        const slotDateTime = new Date(`${slot.date}T${slot.time}`);
                        return {
                            ...slot,
                            isPast: slotDateTime < now,
                        };
                    })
                    .sort((a, b) => {
                        const dateA = new Date(`${a.date}T${a.time}`);
                        const dateB = new Date(`${b.date}T${b.time}`);
                        return dateA - dateB;
                    });
                setBookings(sortedBookings);
            } catch (error) {
                console.error('Error fetching bookings:', error.message);
            }
        };

        fetchBookings();
    }, [user]);

    if (!user) {
        return <div>Loading your bookings...</div>; // ✅ moved below the hook
    }

    const formatTime = (time, date) => {
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

    return (
        <div className="user-bookings">
            <h3 className="section-title">Booked Sessions</h3>
            <div className="title-line"></div>
            {bookings.length > 0 ? (
                bookings.map((booking) => (
                    <div
                        key={booking._id}
                        className={`booking-card ${booking.isPast ? 'past-booking' : ''}`}
                    >
                        <div className="booking-details">
                            <div className="session-type">
                                <strong>{booking.title || booking.sessionType || 'General Session'}</strong>
                            </div>
                            <div className="booking-info">
                                <FaCalendarAlt className="icon" />
                                <span>{`${booking.date} at ${formatTime(booking.time, booking.date)}`}</span>
                            </div>
                            <div className="booking-info">
                                <FaClock className="icon" />
                                <span>{booking.length || booking.duration || '60 mins'}</span>
                            </div>
                        </div>
                        <div className="booking-footer">
                            {booking.location ? (
                                booking.location.startsWith('http') ? (
                                    <a
                                        href={booking.location}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={booking.isPast ? 'disabled-link' : 'meeting-link'}
                                    >
                                        <FaLocationArrow className="icon" /> Join Meeting
                                    </a>
                                ) : (
                                    <div className="location-info">
                                        <FaLocationArrow className="icon" /> {booking.location}
                                    </div>
                                )
                            ) : booking.link ? (
                                <a
                                    href={booking.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={booking.isPast ? 'disabled-link' : 'meeting-link'}
                                >
                                    <FaLocationArrow className="icon" /> Join Meeting
                                </a>
                            ) : (
                                <div className="location-info">
                                    <FaLocationArrow className="icon" /> Location TBD
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
        </div>
    );
}

export default UserBookings;
