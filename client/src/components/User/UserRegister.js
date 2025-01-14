import React, { useState } from 'react';
import { userAxiosInstance } from '../../config/axiosConfig';
import Swal from 'sweetalert2';
import './UserRegister.scss';

function UserRegister() {
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await userAxiosInstance.post('/api/user/register', form);

            Swal.fire({
                title: 'Registration Successful!',
                text: response.data.message,
                icon: 'success',
            });

            // Automatically log the user in if the token is included in the response
            const { token } = response.data;
            if (token) {
                localStorage.setItem('authToken', token); // Save token in localStorage
                window.location.href = '/dashboard'; // Redirect to a logged-in page
            }

            // Clear the form fields
            setForm({ firstName: '', lastName: '', email: '' });
        } catch (error) {
            console.error('[User Response Error]', error);
            Swal.fire({
                title: 'Registration Failed',
                text: error.response?.data?.message || 'An error occurred. Please try again.',
                icon: 'error',
            });
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <h2 className="section-title">Create your Account</h2>
                <div className="title-line"></div>
                <p className="login-link">
                    Have an account? <a href="/login">Log in now</a>
                </p>
                <div className="oauth-buttons">
                    <a href="http://localhost:5001/user/auth/google" className="oauth-btn google">
                        <div className="google-icon">
                            <img src="../images/sign-in-google.svg" alt="Google Icon" />
                        </div>
                    </a>
                    <a href="http://localhost:5001/user/auth/microsoft" className="oauth-btn microsoft">
                        <div className="microsoft-icon">
                            <img src="../images/sign-in-microsoft.svg" alt="Microsoft Icon" />
                        </div>
                    </a>
                </div>
                <div className="divider">Or receive a link to your email</div>
                <form className="register-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        required
                    />
                    <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="First Name"
                        required
                    />
                    <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Last Name"
                        required
                    />
                    <button type="submit" className="register-btn">Register</button>
                </form>
            </div>
        </div>
    );
}

export default UserRegister;
