import React, { useState, useEffect, useRef } from 'react';
import './AdminLogin.scss'; //Styling import - component specific style
import '../../App.scss'; //Styling import - global style
import { adminAxiosInstance } from '../../config/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { useAdminAuth } from './AdminAuthContext';
import { getRecaptchaToken } from '../../utils/recaptcha'; // Centralized reCAPTCHA

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAdminAuth();
    const alertShown = useRef(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        alertShown.current = false;
        const token = localStorage.getItem('adminToken');
        if (token) {
            navigate('/admin/dashboard');
        }
    }, [navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const recaptchaToken = await getRecaptchaToken('admin_login'); // Get token safely

            if (!recaptchaToken) {
                throw new Error('reCAPTCHA token not generated');
            }

            const res = await adminAxiosInstance.post('/api/admin/login', {
                email,
                password,
                recaptchaToken,
            });

            const { admin, accessToken } = res.data;

            login(admin, accessToken);
            localStorage.setItem('adminToken', accessToken);

            if (!alertShown.current) {
                alertShown.current = true;
                Swal.fire({
                    title: 'Login Successful!',
                    text: 'Welcome to the admin dashboard.',
                    icon: 'success',
                    confirmButtonText: 'Continue',
                }).then(() => {
                    navigate('/admin/dashboard');
                });
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Invalid email or password. Please try again.';
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
            setLoading(false);
        }
    };

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
