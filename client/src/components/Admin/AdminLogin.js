import React, { useState, useEffect, useRef } from 'react';
import './AdminLogin.scss'; //Styling import - component specific style
import '../../App.scss'; //Styling import - global style
import { adminAxiosInstance } from '../../config/axiosConfig';
import { useNavigate } from 'react-router-dom'; //React Router hook for programmatic navigation
import Swal from 'sweetalert2'; //SweetAlert2 is used for user-friendly popup notifications
import { useAdminAuth } from './AdminAuthContext'; //Custom context hook for accessing admin authentication functions and state

const AdminLogin = () => {
    const [email, setEmail] = useState(''); //State variables to store form inputs for login credentials - email
    const [password, setPassword] = useState(''); //State variables to store form inputs for login credentials - password
    const navigate = useNavigate(); //A function to navigate programmatically between routes
    const { login, isAuthenticated } = useAdminAuth(); //Extracted from the AdminAuthContext for managing login and checking if the admin is logged in.
    const alertShown = useRef(false); // Prevent duplicate SweetAlerts
    const [loading, setLoading] = useState(false);

    // Check token on mount and redirect if already logged in
    useEffect(() => { //useEffect() is used here to prevent the redirection logic from interfering with React's rendering process

        // Load reCAPTCHA v3 script
        const siteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY;
        if (siteKey) {
            const script = document.createElement('script');
            script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);

            script.onload = () => {
                if (!window.grecaptcha) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Security Check Failed',
                        text: 'reCAPTCHA could not load. Please refresh and try again.',
                        confirmButtonText: 'OK'
                    });
                }
            };

            return () => {
                document.body.removeChild(script);
            };
        }

        alertShown.current = false;
        const token = localStorage.getItem('adminToken'); //Fetches adminToken from localStorage (browser storage)
        if (token) { //If the token exists it assumes the admin is logged in and redirects to admin/dashboard
            navigate('/admin/dashboard');
        } else { //If no token exists, remain on login page
        }
    }, [navigate]);

    //Submit admin's email and password to server and retrieve admin details and token from response
    const handleLogin = async (e) => {
        e.preventDefault();

        const siteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY;
        if (!window.grecaptcha || !siteKey) {
            Swal.fire({
                icon: 'warning',
                title: 'Verification Not Ready',
                text: 'reCAPTCHA is still loading. Please wait and try again.',
                confirmButtonText: 'Got it'
            });
            return;
        }

        setLoading(true); // Start loading spinner

        try {
            const recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'admin_login' });
            const res = await adminAxiosInstance.post('/api/admin/login', { email, password, recaptchaToken });
            const { admin, accessToken } = res.data;

            // Save token via context and localStorage
            login(admin, accessToken); //Call to login to update the global state using AdminAuthContext
            localStorage.setItem('adminToken', accessToken); //Stores token in localStorage and ensures the token persists across page refreshes

            if (!alertShown.current) {
                alertShown.current = true;
                Swal.fire({ //Displays success message
                    title: 'Login Successful!',
                    text: 'Welcome to the admin dashboard.',
                    icon: 'success',
                    confirmButtonText: 'Continue',
                }).then(() => {
                    navigate('/admin/dashboard'); //Redirects to dashboard
                });
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message || 'Invalid email or password. Please try again.';
            if (!alertShown.current) {
                alertShown.current = true;
                Swal.fire({
                    title: 'Login Failed',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        } finally {
            setLoading(false); // Stop spinner regardless of outcome
        }
    };
    //Rendering the login form:
    return (
        <div className="admin-login-page">
            <h2 className="section-title">Admin Log In</h2>
            <div className="title-line"></div>
            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
