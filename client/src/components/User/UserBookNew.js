import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CalendarDays from '../Calendar/CalendarDays';
import './UserBookNew.scss';
import '../../App.scss';
import io from 'socket.io-client';
import Swal from 'sweetalert2';

function UserBookNew() {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [currentDay, setCurrentDay] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [sessionType, setSessionType] = useState('');
    const [message, setMessage] = useState('');

    const sessionTypes = [
        "Individual Yoga Session (60 min)",
        "Partner Yoga Session (60 min)",
        "Yoga Therapy Session (60 min)",
    ];

    useEffect(() => {
        if (!userId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'User ID is missing.',
            });
            return;
        }

        fetchUser();
        fetchSlots();

        // Initialize Socket.IO connection
        const socket = io('http://localhost:5001');
        socket.on('slotBooked', ({ slotId }) => {
            setAvailableSlots((prevSlots) =>
                prevSlots.filter((slot) => slot._id !== slotId)
            );
        });

        return () => {
            if (socket && typeof socket.disconnect === 'function') {
                socket.disconnect();
            }
        };
    }, [userId]);

    const fetchUser = async () => {
        try {
            const response = await fetch(`http://localhost:5001/api/user/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const fetchSlots = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/bookings');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { availableSlots } = await response.json();
            const now = new Date();

            // Filter out past slots
            const filteredSlots = availableSlots.filter((slot) => {
                const slotDateTime = new Date(`${slot.date}T${slot.time}`);
                return slotDateTime > now;
            });

            setAvailableSlots(filteredSlots);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        }
    };


    const handlePreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((prevYear) => prevYear - 1);
        } else {
            setCurrentMonth((prevMonth) => prevMonth - 1);
        }
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((prevYear) => prevYear + 1);
        } else {
            setCurrentMonth((prevMonth) => prevMonth + 1);
        }
        setSelectedDate(null);
    };

    const handleSlotBooking = async () => {
        if (!selectedSlot) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Please select a time slot before booking.',
            });
            return;
        }

        const slotDateTime = new Date(`${selectedSlot.date}T${selectedSlot.time}`);
        if (slotDateTime < new Date()) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Cannot book a slot in the past.',
            });
            return;
        }

        if (!sessionType || !message) {
            Swal.fire({
                icon: 'warning',
                title: 'Warning',
                text: 'Please fill out all required fields.',
            });
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5001/api/bookings/${selectedSlot._id}/book`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                        email: user?.email,
                        sessionType,
                        message,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to book the slot.');
            }

            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Slot booked successfully!',
            });

            setAvailableSlots((prevSlots) =>
                prevSlots.filter((slot) => slot._id !== selectedSlot._id)
            );
            setSelectedSlot(null);
            setSessionType('');
            setMessage('');
        } catch (error) {
            console.error('Error booking slot:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to book the slot. Please try again.',
            });
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [hour, minute] = time.split(':');
        const date = new Date();
        date.setHours(hour, minute);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    return (
        <div className="user-page">
            <div className="user-content">
                <h3 className="section-title">Book a New Session</h3>
                <div className="userbooknew-container">
                    <div className="userbooknew">
                        <header className="userbooknew-header">
                            <button className="month-nav-button" onClick={handlePreviousMonth}>
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
                        </header>
                        <CalendarDays
                            day={new Date(currentYear, currentMonth, currentDay.getDate())}
                            month={currentMonth}
                            year={currentYear}
                            changeCurrentDay={(day) =>
                                setSelectedDate(new Date(day.year, day.month, day.number))
                            }
                            highlightedSlots={availableSlots.map((slot) => slot.date)}
                        />
                    </div>

                    {selectedDate && (
                        <div className="availability-section">
                            <h4>
                                Available Slots
                            </h4>
                            <p>{selectedDate ? `${formatDate(selectedDate)}` : ''}</p>
                            <div className="availability-times">
                                {availableSlots
                                    .filter(
                                        (slot) =>
                                            slot.date ===
                                            selectedDate?.toISOString().split('T')[0]
                                    )
                                    .map((slot) => (
                                        <button
                                            key={slot._id}
                                            className={`availability-time ${selectedSlot?._id === slot._id ? 'selected' : ''
                                                }`}
                                            onClick={() => setSelectedSlot(slot)}
                                        >
                                            {formatTime(slot.time)}
                                        </button>
                                    ))}
                            </div>
                            <div className="availability-inputs">
                                <label>
                                    Session Type:
                                    <select
                                        value={sessionType}
                                        onChange={(e) => setSessionType(e.target.value)}
                                    >
                                        <option value="">Select Session Type</option>
                                        {sessionTypes.map((type, index) => (
                                            <option key={index} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label>
                                    Message:
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </label>
                                <button onClick={handleSlotBooking}>Book</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserBookNew;
