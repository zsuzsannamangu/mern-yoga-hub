import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { userAxiosInstance } from '../../config/axiosConfig';
import Swal from 'sweetalert2';
import './UserLogin.scss';

function UserLogin() {
    const [form, setForm] = useState({ email: '' });
    const [needsVerification, setNeedsVerification] = useState(false);
    const [isResending, setIsResending] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
        setNeedsVerification(false); // Reset when user changes email
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            //Send email to request a login link
            await userAxiosInstance.post('/login', { email: form.email });

            Swal.fire({
                title: 'Login Email Sent!',
                text: `A login link has been sent to ${form.email}. Please check your inbox.`,
                icon: 'success',
                confirmButtonText: 'OK',
            });

            // Clear the email field and reset state
            setForm({ email: '' });
            setNeedsVerification(false);
        } catch (error) {
            const errorData = error.response?.data || {};
            const errorMessage = errorData.message || 'Could not send login email. Please try again.';
            const needsVerificationFlag = errorData.needsVerification || false;

            setNeedsVerification(needsVerificationFlag);

            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: errorMessage,
                confirmButtonText: 'OK'
            });
        }
    };

    const handleResendVerification = async () => {
        if (!form.email) {
            Swal.fire({
                icon: 'warning',
                title: 'Email Required',
                text: 'Please enter your email address first.',
                confirmButtonText: 'OK'
            });
            return;
        }

        setIsResending(true);
        try {
            await userAxiosInstance.post('/resend-verification', { email: form.email });

            Swal.fire({
                title: 'Verification Email Sent!',
                text: `A new verification email has been sent to ${form.email}. Please check your inbox and spam folder.`,
                icon: 'success',
                confirmButtonText: 'OK',
            });

            setNeedsVerification(false);
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Could not send verification email. Please try again.';
            
            Swal.fire({
                icon: 'error',
                title: 'Failed to Send',
                text: errorMessage,
                confirmButtonText: 'OK'
            });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2 className="section-title">Log in to your account</h2>
                <div className="title-line"></div>
                <div className="oauth-buttons">
                    <a href={`${process.env.REACT_APP_API}/api/user/auth/google`} className="oauth-btn google">
                        <div className="google-icon">
                            <img src="../images/sign-in-google.svg" alt="Google Icon" />
                        </div>
                    </a>
                </div>
                <div className="divider">Or receive a link to your email</div>
                <form onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />
                    <button type="submit">Send Login Link</button>
                </form>
                {needsVerification && (
                    <div className="verification-prompt">
                        <p className="verification-text">
                            Your email hasn't been verified yet. Please check your inbox for the verification email.
                        </p>
                        <button 
                            type="button" 
                            className="resend-verification-btn"
                            onClick={handleResendVerification}
                            disabled={isResending}
                        >
                            {isResending ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                    </div>
                )}
                <p className="register-link">
                    Don't have an account yet? <Link to="/register">Register!</Link>
                </p>
            </div>
        </div>
    );
}

export default UserLogin;
