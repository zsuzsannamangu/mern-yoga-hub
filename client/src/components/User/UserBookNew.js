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
    const [currentDay] = useState(new Date()); // Track the current day
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
                text: 'We couldn\'t find your User ID. Please log in again or contact me if the issue persists.',
                confirmButtonText: 'OK'
            });
            return;
        }

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
            setPaymentSuccess(true);
            setShowPayPal(false);
            clearPayPalButtons();
        } else if (couponCode.trim() !== '') {
            // Reset payment success if coupon code is changed to invalid
            setPaymentSuccess(false);
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

        // Skip all checks if coupon is valid (should already be handled by useEffect, but keep as fallback)
        if (isFree) {
            setPaymentSuccess(true);
            setShowPayPal(false);
            clearPayPalButtons();
            return;
        }

        // Only validate if not free
        if (!isFree && (isNaN(amount) || amount < 10 || amount > 200)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Payment Amount',
                text: 'The amount must be between $10 and $200. Please adjust your entry and try again.',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Load PayPal buttons
        setShowPayPal(true);

        if (!document.querySelector('#paypal-sdk')) {
            fetch(`${process.env.REACT_APP_API}/config/paypal`)
                .then((res) => {
                    if (!res.ok) {
                        return res.json().then(err => {
                            throw new Error(err.error || 'Failed to get PayPal configuration');
                        });
                    }
                    return res.json();
                })
                .then((data) => {
                    if (!data.clientId) {
                        throw new Error('PayPal client ID is missing');
                    }
                    
                    const script = document.createElement('script');
                    // Add intent=CAPTURE for immediate payment capture
                    script.src = `https://www.paypal.com/sdk/js?client-id=${data.clientId}&currency=USD&intent=capture`;
                    script.id = 'paypal-sdk';
                    script.onload = () => {
                        console.log('PayPal SDK script loaded, waiting for initialization...');
                        console.log('window.paypal available:', !!window.paypal);
                        // Wait a moment for PayPal SDK to fully initialize
                        setTimeout(() => {
                            renderPayPalButtons();
                        }, 500);
                    };
                    script.onerror = (error) => {
                        console.error('PayPal SDK script failed to load:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Payment Service Unavailable',
                            text: 'We couldn\'t load PayPal. Please check your internet connection, refresh the page, or try again later.',
                        });
                        setPaypalError(true);
                        setShowPayPal(false);
                    };
                    document.body.appendChild(script);
                })
                .catch((error) => {
                    console.error('PayPal configuration error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Payment Service Unavailable',
                        text: error.message || 'We couldn\'t load PayPal. Please try again later.',
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
                text: 'We couldn\'t load the PayPal button. Please refresh the page and try again.',
                confirmButtonText: 'OK'
            });
            setShowPayPal(false);
            return;
        }

        // Check if PayPal SDK is loaded - try multiple times with increasing delays
        const checkPayPalReady = (attempts = 0, maxAttempts = 15) => {
            console.log(`Checking PayPal SDK readiness (attempt ${attempts + 1}/${maxAttempts})...`);
            console.log('window.paypal:', window.paypal);
            console.log('window.paypal.Buttons:', window.paypal?.Buttons);
            
            if (window.paypal && typeof window.paypal.Buttons === 'function') {
                console.log('PayPal SDK is ready');
                // Continue with rendering buttons
                return true;
            }
            
            if (attempts >= maxAttempts) {
                console.error('PayPal SDK failed to initialize after multiple attempts');
                console.error('Final check - window.paypal:', window.paypal);
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Service Unavailable',
                    text: 'PayPal is taking longer than expected to load. Please refresh the page and try again.',
                    confirmButtonText: 'OK'
                });
                setPaypalError(true);
                setShowPayPal(false);
                return false;
            }
            
            // Retry with increasing delays
            const delay = Math.min(300 * (attempts + 1), 2000); // Cap at 2 seconds
            setTimeout(() => {
                if (checkPayPalReady(attempts + 1, maxAttempts)) {
                    // If ready after retry, continue with rendering
                    renderPayPalButtons();
                }
            }, delay);
            return false;
        };

        if (!checkPayPalReady()) {
            return;
        }

        window.paypal
            .Buttons({
                createOrder: (data, actions) => {
                    const amount = Number(paymentAmount);
                    if (isNaN(amount) || amount <= 0) {
                        throw new Error('Invalid payment amount');
                    }
                    console.log("Creating PayPal order for:", amount.toFixed(2));
                    return actions.order.create({
                        purchase_units: [
                            {
                                amount: {
                                    value: amount.toFixed(2), // PayPal requires string with 2 decimal places
                                    currency_code: 'USD'
                                },
                            },
                        ],
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then((details) => {
                        console.log('PayPal payment approved:', details);
                        Swal.fire({
                            icon: 'success',
                            title: 'Payment Successful',
                            text: `Transaction completed by ${details.payer.name.given_name}`,
                        });
                        setPaymentSuccess(true);
                    }).catch((error) => {
                        console.error('PayPal capture error:', error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Payment Capture Failed',
                            text: 'Your payment was approved but could not be processed. Please contact support with your order ID.',
                            confirmButtonText: 'OK'
                        });
                        setPaypalError(true);
                        setShowPayPal(false);
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
                    text: 'We couldn\'t display the PayPal buttons. Please refresh the page and try again.',
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
                title: 'Missing Information or Payment',
                text: 'Please choose time, session type and/or complete payment before finalizing your appointment.',
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
                text: 'We couldn\'t confirm your booking. Please try again or contact support if the issue persists.',
                confirmButtonText: 'OK'
            });
        }
    };

    //function to check if all required fields are filled
    const isFormValid = () => {
        const isFree = couponCode.trim().toUpperCase() === 'YOURJOURNEY';
        const amount = Number(paymentAmount);
        const validAmount = !isNaN(amount) && amount >= 10 && amount <= 200;
        return (
            sessionType.trim() !== '' &&
            selectedSlot !== null &&
            (isFree || validAmount)
        );
    };

    const formatDate = (date) => {
        if (!date) return '';
        // Handle both Date objects and date strings
        const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        }).format(dateObj);
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
                            day={selectedDate ? (() => {
                                const [year, month, day] = selectedDate.split('-');
                                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                            })() : new Date(currentYear, currentMonth, currentDay.getDate())}
                            month={currentMonth}
                            year={currentYear}
                            changeCurrentDay={(day) => {
                                // Create date string in YYYY-MM-DD format to avoid timezone issues
                                const dateString = `${day.year}-${(day.month + 1).toString().padStart(2, '0')}-${day.number.toString().padStart(2, '0')}`;
                                setSelectedDate(dateString);
                            }}
                            highlightedSlots={availableSlots.map((slot) => slot.date)}
                        />
                    </div>

                    {selectedDate && (
                        <div className="availability-section">
                            <h4>Available Slots</h4>
                            <p>{selectedDate ? `${formatDate(selectedDate)}` : ''}</p>
                            <div className="availability-times">
                                {availableSlots.filter(
                                    (slot) => slot.date === selectedDate
                                ).length > 0 ? (
                                    availableSlots
                                        .filter((slot) => slot.date === selectedDate)
                                        .sort((a, b) => a.time.localeCompare(b.time)) // Sort by time string
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
                                        Coupon applied! You can finalize your booking.
                                    </p>
                                )}
                                {couponCode.trim() && couponCode.trim().toUpperCase() !== 'YOURJOURNEY' && (
                                    <p style={{ color: 'red', fontSize: '0.9rem' }}>
                                        Invalid code. Double-check or continue without one.
                                    </p>
                                )}

                                {couponCode.trim().toUpperCase() !== 'YOURJOURNEY' && (
                                    <label>
                                        Payment Amount (sliding scale: $10–$110):
                                        <input
                                            type="number"
                                            value={paymentAmount || ''}
                                            onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                            min="50"
                                            max="200"
                                            step="1"
                                            placeholder="Enter amount without $ sign"
                                        />
                                    </label>
                                )}
                                {couponCode.trim().toUpperCase() === 'YOURJOURNEY' ? (
                                    // Show Finalize Booking button immediately when coupon is valid
                                    <button className="book-slot-button" onClick={handleSlotBooking} disabled={!isFormValid()}>
                                        Finalize Booking
                                    </button>
                                ) : !showPayPal ? (
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
                                {paymentSuccess && couponCode.trim().toUpperCase() !== 'YOURJOURNEY' && (
                                    <button className="book-slot-button" onClick={handleSlotBooking} disabled={!isFormValid()}>
                                        Finalize Booking
                                    </button>
                                )}

                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Pricing Information - Outside main booking container */}
            <div className="pricing-info">
                <p>** Individual yoga sessions are $80-$110/hr sliding scale.</p> 
                <p> Individualized yoga therapy sessions: Online sessions are $10-$80/hr sliding scale, and in-person sessions in NW Portland are $20-$100/hr sliding scale through June 2026, while I'm in training.</p>
                <p> Your investment is a personal choice, aligning with your current financial circumstances.**</p>
                <p><strong> Committing to at least 8 weeks of yoga therapy gives us time to build trust, personalize your practice, and support meaningful, lasting change in body, mind, and nervous system. </strong></p>
            </div>
        </div>
    );
}

export default UserBookNew;
