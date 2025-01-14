import React, { useState } from 'react';
import './AdminLogin.scss';
import '../../App.scss';
import { adminAxiosInstance } from '../../config/axiosConfig';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAdminAuth } from './AdminAuthContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAdminAuth(); // Use admin auth context

    const checkTokenRedirect = () => {
        const token = localStorage.getItem('adminToken');
        if (token !== undefined) {
            navigate('/admin/dashboard');
        }
    }
    checkTokenRedirect();

    const handleLogin = async (e) => {
        e.preventDefault();
    
        try {
            const res = await adminAxiosInstance.post('/api/admin/login', { email, password });
            const { admin, accessToken } = res.data;
    
            login(admin, accessToken); // Call admin login function
    
            Swal.fire({
                title: 'Login Successful!',
                text: 'Welcome to the admin dashboard.',
                icon: 'success',
                confirmButtonText: 'Continue',
            }).then(() => {
                navigate('/admin/dashboard');
            });
        } catch (error) {
            console.error('Admin Login Error:', error.response?.data); // Log error details
    
            const errorMessage =
                error.response?.data?.message || 'Invalid email or password. Please try again.';
            Swal.fire({
                title: 'Login Failed',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK',
            });
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
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default AdminLogin;
