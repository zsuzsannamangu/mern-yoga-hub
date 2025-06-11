import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CalendarDays from '../Calendar/CalendarDays';
import './UserBookNew.scss';
import '../../App.scss';
import io from 'socket.io-client';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

function UserBookNew() {
    const { userId } = useParams(); // Get user ID from URL parameters
    const [user, setUser] = useState(null); // Store user data
    const [currentDay, setCurrentDay] = useState(new Date()); // Track the current day
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // Track the current month
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Track the current year
    const [selectedDate, setSelectedDate] = useState(null); // Store the selected date
    const [availableSlots, setAvailableSlots] = useState([]); // Store available booking slots
    const [selectedSlot, setSelectedSlot] = useState(null); // Store the selected booking slot
    const [sessionType, setSessionType] = useState(''); // Store the selected session type
    const [message, setMessage] = useState(''); // Store user message
    const [paymentAmount, setPaymentAmount] = useState(null); // // User-entered sliding scale payment amount (set manually or via coupon)
    const [showPayPal, setShowPayPal] = useState(false); // Show or hide PayPal buttons
    const [paypalError, setPaypalError] = useState(false); // Track PayPal errors
    const [paymentSuccess, setPaymentSuccess] = useState(false); // Track if payment was successful
    const [couponCode, setCouponCode] = useState('');
    const navigate = useNavigate();

    const clearPayPalButtons = () => {
        const container = document.getElementById('paypal-button-container');
        if (container) container.innerHTML = '';
    };

    const sessionTypes = [
        "Individual Yoga Session (60 min)",
        "Yoga Therapy Session (60 min)",
    ];

    // Fetch user data and available slots when component mounts
    useEffect(() => {
        if (!userId) {
            Swal.fire({
                icon: 'error',
                title: 'User ID Required',
                text: 'We couldn’t find your User ID. Please log in again or contact me if the issue persists.',
                confirmButtonText: 'OK'
            });
            return;
        }

        fetchUser();
        fetchSlots();

        //Initialize Socket.IO connection
        const socket = io(`${process.env.REACT_APP_API}`);
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

    useEffect(() => {
        const code = couponCode.trim().toUpperCase();
        if (code === 'YOURJOURNEY') {
            setPaymentAmount(0);
        }
    }, [couponCode]);

    useEffect(() => {
        if (selectedDate) {
            // Reset all form values when the user selects a new date
            setSelectedSlot(null);
            setSessionType('');
            setMessage('');
            setCouponCode('');
            setPaymentAmount(null);
            setShowPayPal(false);
            setPaymentSuccess(false);
            clearPayPalButtons();
        }
    }, [selectedDate]);

    // Fetch user details
    const fetchUser = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API}/api/user/${userId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const userData = await response.json();
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    // Fetch available booking slots
    const fetchSlots = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API}/api/bookings`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const { availableSlots } = await response.json();
            const now = new Date();

            const filteredSlots = availableSlots.filter((slot) => {
                const slotDateTime = new Date(`${slot.date}T${slot.time}`);
                return slotDateTime > now;
            });

            setAvailableSlots(filteredSlots);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        }
    };

    // Handle navigation to the previous month
    const handlePreviousMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear((prevYear) => prevYear - 1);
        } else {
            setCurrentMonth((prevMonth) => prevMonth - 1);
        }
        setSelectedDate(null);
    };

    // Handle navigation to the next month
    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear((prevYear) => prevYear + 1);
        } else {
            setCurrentMonth((prevMonth) => prevMonth + 1);
        }
        setSelectedDate(null);
    };

    // Trigger PayPal payment flow
    const handlePaymentClick = () => {
        const trimmedCode = couponCode.trim().toUpperCase();
        const isFree = trimmedCode === 'YOURJOURNEY';
        const amount = Number(paymentAmount);

        // Skip all checks if coupon is valid
        if (isFree) {
            setPaymentSuccess(true);
            setShowPayPal(false);
            clearPayPalButtons();
            Swal.fire({
                icon: 'success',
                title: 'Coupon Applied',
                text: 'Please finalize your booking!',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Only validate if not free
        if (!isFree && (isNaN(amount) || amount < 35 || amount > 130)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Payment Amount',
                text: 'The amount must be between $35 and $130. Please adjust your entry and try again.',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Load PayPal buttons
        setShowPayPal(true);

        if (!document.querySelector('#paypal-sdk')) {
            fetch(`${process.env.REACT_APP_API}/config/paypal`)
                .then((res) => res.json())
                .then((data) => {
                    const script = document.createElement('script');
                    script.src = `https://www.paypal.com/sdk/js?client-id=${data.clientId}&currency=USD`;
                    script.id = 'paypal-sdk';
                    script.onload = renderPayPalButtons;
                    script.onerror = () => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Payment Service Unavailable',
                            text: 'We couldn’t load PayPal. Please try again later.',
                        });
                        setPaypalError(true);
                        setShowPayPal(false);
                    };
                    document.body.appendChild(script);
                })
                .catch(() => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Payment Service Unavailable',
                        text: 'We couldn’t load PayPal. Please try again later.',
                    });
                    setPaypalError(true);
                    setShowPayPal(false);
                });
        } else {
            renderPayPalButtons();
        }
    };

    // Render PayPal buttons
    const renderPayPalButtons = () => {
        const container = document.getElementById('paypal-button-container');
        if (!container) {
            Swal.fire({
                icon: 'error',
                title: 'Payment Button Not Found',
                text: 'We couldn’t load the PayPal button. Please refresh the page and try again.',
                confirmButtonText: 'OK'
            });
            setShowPayPal(false);
            return;
        }

        window.paypal
            .Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    value: paymentAmount, // Use sliding scale payment amount
                                },
                            },
                        ],
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then((details) => {
                        Swal.fire({
                            icon: 'success',
                            title: 'Payment Successful',
                            text: `Transaction completed by ${details.payer.name.given_name}`,
                        });
                        setPaymentSuccess(true);
                    });
                },
                onError: (err) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Payment Unsuccessful',
                        text: 'Your payment could not be processed. Please check your payment details and try again.',
                        confirmButtonText: 'OK'
                    });
                    setPaypalError(true);
                    setShowPayPal(false);
                },
            })
            .render('#paypal-button-container')
            .catch((err) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Button Error',
                    text: 'We couldn’t display the PayPal buttons. Please refresh the page and try again.',
                    confirmButtonText: 'OK'
                });
                setPaypalError(true);
                setShowPayPal(false);
            });
    };

    // Handle booking after payment success
    const handleSlotBooking = async () => {
        if (!selectedSlot) {
            Swal.fire({
                icon: 'warning',
                title: 'Time Slot Required',
                text: 'Please select a time slot before proceeding with your booking.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (!paymentSuccess) {
            Swal.fire({
                icon: 'info',
                title: 'Payment Needed',
                text: 'Please complete your payment before finalizing your appointment.',
                confirmButtonText: 'OK'
            });
            return;
        }

        try {
            const response = await fetch(
                `${process.env.REACT_APP_API}/api/bookings/${selectedSlot._id}/book`,
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

            const result = await response.json();

            if (response.ok && result.success) {
                // Exit early if successful
                Swal.fire({
                    icon: 'success',
                    title: 'Booking Confirmed!',
                    text: 'Booking successful. Check your email for confirmation and details.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate(`/user/${userId}`);
                });

                setAvailableSlots((prevSlots) =>
                    prevSlots.filter((slot) => slot._id !== selectedSlot._id)
                );
                setSelectedSlot(null);
                setSessionType('');
                setMessage('');
                setCouponCode('');
                setPaymentAmount(null);
                setShowPayPal(false);
                setPaymentSuccess(false);
                clearPayPalButtons();
                return; // IMPORTANT: prevent falling through to catch
            }

            // Only throws if failed
            throw new Error(result?.message || 'Unknown error');

        } catch (error) {
            // Only shows if the fetch OR the result fails
            console.error('Booking error caught:', error);
            Swal.fire({
                icon: 'error',
                title: 'Booking Failed',
                text: 'We couldn’t confirm your booking. Please try again or contact support if the issue persists.',
                confirmButtonText: 'OK'
            });
        }
    };

    //function to check if all required fields are filled
    const isFormValid = () => {
        const isFree = couponCode.trim().toUpperCase() === 'YOURJOURNEY';
        const validAmount = paymentAmount >= 50 && paymentAmount <= 140;
        return (
            sessionType.trim() !== '' &&
            selectedSlot !== null &&
            (isFree || validAmount)
        );
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

    //convert the time to a 12-hour format with AM/PM
    const formatTime = (date, time) => {
        if (!date || !time) return '';
        const localTime = new Date(`${date}T${time}`);
        return localTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short', // 👈 adds PDT, EDT, etc.
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
                        <p>**Individual yoga sessions are $50-$110/hr sliding scale. Yoga therapy sessions are $50-$130/hr sliding scale.</p>
                        <p> Your investment is a personal choice, aligning with your current financial circumstances.**</p>
                    </div>

                    {selectedDate && (
                        <div className="availability-section">
                            <h4>Available Slots</h4>
                            <p>{selectedDate ? `${formatDate(selectedDate)}` : ''}</p>
                            <div className="availability-times">
                                <label>Choose Time:*
                                    {availableSlots.filter(
                                        (slot) => slot.date === selectedDate?.toISOString().split('T')[0]
                                    ).length > 0 ? (
                                        availableSlots
                                            .filter((slot) => slot.date === selectedDate?.toISOString().split('T')[0])
                                            .map((slot) => (
                                                <button
                                                    key={slot._id}
                                                    className={`availability-time ${selectedSlot?._id === slot._id ? 'selected' : ''}`}
                                                    onClick={() => setSelectedSlot(slot)}
                                                >
                                                    {formatTime(slot.date, slot.time)}
                                                </button>
                                            ))
                                    ) : (
                                        <p className="no-slots-message">No available slots this day.</p>
                                    )}
                                </label>
                            </div>
                            <div className="availability-inputs">
                                <label>
                                    Session Type:*
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
                                <label>
                                    Coupon Code:
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Enter code"
                                    />
                                </label>
                                {couponCode.trim() && couponCode.trim().toUpperCase() === 'YOURJOURNEY' && (
                                    <p style={{ color: 'green', marginTop: '0.3rem' }}>
                                        Coupon valid. Click Continue to apply.
                                    </p>
                                )}
                                {couponCode.trim() && couponCode.trim().toUpperCase() !== 'YOURJOURNEY' && (
                                    <p style={{ color: 'red', fontSize: '0.9rem' }}>
                                        Invalid code. Double-check or continue without one.
                                    </p>
                                )}

                                {couponCode.trim().toUpperCase() !== 'YOURJOURNEY' && (
                                    <label>
                                        Payment Amount (sliding scale: $50–$130):
                                        <input
                                            type="number"
                                            value={paymentAmount || ''}
                                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                            min="50"
                                            max="130"
                                            step="1"
                                            placeholder="Enter amount without $ sign"
                                        />
                                    </label>
                                )}
                                {!showPayPal ? (
                                    <button className="continue-button"
                                        onClick={handlePaymentClick}
                                        disabled={!isFormValid()} // Disable the button based on validation
                                    >
                                        Continue
                                    </button>
                                ) : (
                                    <div id="paypal-button-container"></div>
                                )}
                                {paypalError && (
                                    <p className="error-message">
                                        Failed to load PayPal. Please try again later.
                                    </p>
                                )}
                                {(paymentSuccess || couponCode.trim().toUpperCase() === 'YOURJOURNEY') && (
                                    <button className="book-slot-button" onClick={handleSlotBooking}>
                                        Finalize Booking
                                    </button>
                                )}

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserBookNew;
