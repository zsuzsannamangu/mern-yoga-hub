import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../components/User/UserAuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';

function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useUserAuth(); // Access the login function from context
    const [message, setMessage] = useState('');

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token'); // Extract token from URL query params

        const verifyEmail = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/user/verify-email', {
                    params: { token: tokenFromUrl },
                });

                // Destructure response data
                const { message, token, userId } = response.data; // Use 'token' instead of 'authToken'

                // Update state with message
                setMessage(message);

                if (token && userId) {
                    // Fetch user data
                    const userResponse = await axios.get(`http://localhost:5001/api/user/${userId}`);
                    const userData = userResponse.data;

                    // Call login function to update context
                    login({userData, id: userData._id}, token);

                    // Save the token and user to localStorage
                    localStorage.setItem('userToken', token);
                    localStorage.setItem('user', JSON.stringify(userData));

                    // Redirect user to their dashboard
                    Swal.fire({
                        title: 'Email Verified',
                        text: 'You have been logged in successfully.',
                        icon: 'success',
                    }).then(() => {
                        navigate(`/user/${userId}`);
                    });
                } else {
                    throw new Error('Invalid response: Missing token or userId.');
                }
            } catch (error) {
                console.error('Verification failed:', error.response?.data || error.message);
                setMessage(error.response?.data?.message || 'Verification failed.');
            }
        };

        if (tokenFromUrl) {
            verifyEmail();
        } else {
            setMessage('Invalid verification link.');
        }
    }, [searchParams, navigate, login]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>{message}</h2>
        </div>
    );
}

export default VerifyEmail;
