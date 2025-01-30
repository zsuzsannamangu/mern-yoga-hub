import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import "./SignUpSelection.scss";
import { FaCalendarAlt, FaLocationArrow } from 'react-icons/fa';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';

const SignUpSelection = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const eventTitle = queryParams.get('title'); // Extract the title
    const eventDate = queryParams.get('date');
    const eventLocation = queryParams.get('location');

    const handleReturningStudent = async () => {
        if (!email) {
            setError('Please enter your email address.');
            return;
        }
        setIsChecking(true); // Starts loading state, prevents multiple clicks while checking

        try {
            const response = await fetch('http://localhost:5001/api/check-student', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    classTitle: eventTitle,
                    date: eventDate
                }),
            });

            const data = await response.json();
            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Registration confirmed!',
                    text: 'Check your email for details.',
                });
                setEmail('');
                setError('');
            } else if (response.status === 400) {
                setError(data.error); // "You have already signed up for this class."
            } else if (response.status === 404) {
                setError(data.message); // "Email not found. Please sign up as a new student!"
            } else {
                setError('Unexpected error. Please try again.');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        }
        setIsChecking(false); // Stops loading state, frontend should prevent multiple clicks while checking
    };

    const handleNewStudent = () => {
        navigate(`/signup?date=${eventDate}&title=${encodeURIComponent(eventTitle)}&location=${encodeURIComponent(eventLocation)}`);

    };

    return (
        <div className="signup-selection-container">
            <h2>Sign Up for {eventTitle}</h2>
            <p><FaCalendarAlt className="icon" /> {eventDate}</p>
            <p> <FaLocationArrow className="icon" /> {eventLocation}</p>
            <div className="signup-options">
                {/* Returning Student Section */}
                <div className="returning-student">
                    <h3>I'm a Returning Student</h3>
                    <p>If you’ve attended a class with me before, enter your email to receive registration confirmation.</p>
                    <div className="returning-student-container">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <button onClick={handleReturningStudent}>Sign up</button>
                    </div>
                    {error && <p className="error-text">{error}</p>}
                </div>

                {/* New Student Section */}
                <div className="new-student">
                    <h3>I'm a New Student</h3>
                    <p>If this is your first class with me, complete the sign up form and sign the waiver.</p>
                    <button onClick={handleNewStudent}>New student sign up</button>
                </div>
            </div>
        </div>
    );
};

export default SignUpSelection;
