import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { userAxiosInstance } from '../../config/axiosConfig';
import Swal from 'sweetalert2';
import './UserLogin.scss';

function UserLogin() {
    const [form, setForm] = useState({ email: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Send email to request a login link
            await userAxiosInstance.post('/api/user/login', { email: form.email });

            Swal.fire({
                title: 'Login Email Sent!',
                text: `A login link has been sent to ${form.email}. Please check your inbox.`,
                icon: 'success',
                confirmButtonText: 'OK',
            });

            // Clear the email field
            setForm({ email: '' });
        } catch (error) {
            console.error('Login Error:', error.response?.data);

            const errorMessage =
                error.response?.data?.message || 'Could not send login email. Please try again.';

            Swal.fire({
                title: 'Login Failed',
                text: errorMessage,
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };    

    return (
        <div className="login-page">
            <h2 className="section-title">Log In</h2>
            <div className="title-line"></div>
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
            <p className="register-link">
                Don't have an account yet? <Link to="/register">Register!</Link>
            </p>
        </div>
    );
}

export default UserLogin;

