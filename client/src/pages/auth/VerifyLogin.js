import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserAuth } from '../../components/User/UserAuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';

function VerifyLogin() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useUserAuth(); // Access the login function from context

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token'); // Extract token from URL query params

        const verifyLogin = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/user/verify-login', {
                    params: { token: tokenFromUrl },
                });

                const { user, token } = response.data;

                if (user && token) {
                    // Update context with user data
                    login({ userData: user, id: user._id }, token);

                    // Save the token and user to localStorage
                    localStorage.setItem('userToken', token);
                    localStorage.setItem('user', JSON.stringify(user));

                    // Redirect user to their dashboard
                    Swal.fire({
                        title: 'Login Successful',
                        text: 'You have been logged in successfully.',
                        icon: 'success',
                    }).then(() => {
                        navigate(`/user/${user._id}`);
                    });
                } else {
                    throw new Error('Invalid response: Missing token or user.');
                }
            } catch (error) {
                console.error('Login Verification Error:', error.response?.data || error.message);
                Swal.fire({
                    title: 'Login Failed',
                    text: 'Invalid or expired login link.',
                    icon: 'error',
                }).then(() => {
                    navigate('/login');
                });
            }
        };

        if (tokenFromUrl) {
            verifyLogin();
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Invalid login link.',
                icon: 'error',
            }).then(() => {
                navigate('/login');
            });
        }
    }, [searchParams, navigate, login]);

    return <div>Verifying login...</div>;
}

export default VerifyLogin;
