import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../components/User/UserAuthContext';
import { userAxiosInstance } from '../../config/axiosConfig';
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
                const response = await userAxiosInstance.get('/verify-email', {
                    params: { token: tokenFromUrl },
                });

                // Destructure response data
                const { message, token, userId } = response.data; // Use 'token' instead of 'authToken'

                // Update state with message
                setMessage(message);

                if (token && userId) {
                    // Fetch user data
                    const userResponse = await userAxiosInstance.get(`/${userId}`);
                    const userData = userResponse.data;

                    // Call login function to update context
                    login({ userData, id: userData._id }, token);

                    // Save the token and user to localStorage
                    localStorage.setItem('userToken', token);
                    localStorage.setItem('user', JSON.stringify(userData));

                    // Redirect user to their dashboard
                    Swal.fire({
                        icon: 'success',
                        title: 'Email Verified!',
                        text: 'Your email has been successfully verified, and you are now logged in.',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        navigate(`/user/${userId}`);
                    });
                } else {
                    throw new Error('Invalid response: Missing token or userId.');
                }
            } catch (error) {
                const errorData = error.response?.data || {};
                const errorMessage = errorData.message || 'Verification failed.';
                const isExpired = errorData.expired || false;
                const isInvalid = errorData.invalid || false;
                
                setMessage(errorMessage);
                
                // Show helpful error message with action
                if (isExpired || isInvalid) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Verification Link Invalid',
                        text: errorMessage,
                        confirmButtonText: 'Go to Login',
                        showCancelButton: true,
                        cancelButtonText: 'Stay Here'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            navigate('/login');
                        }
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Verification Failed',
                        text: errorMessage,
                        confirmButtonText: 'OK'
                    });
                }
            }
        };

        if (tokenFromUrl) {
            verifyEmail();
        } else {
            setMessage('Invalid verification link. No token provided.');
            Swal.fire({
                icon: 'error',
                title: 'Invalid Link',
                text: 'This verification link is invalid. Please request a new verification email from the login page.',
                confirmButtonText: 'Go to Login'
            }).then(() => {
                navigate('/login');
            });
        }
    }, [searchParams, navigate, login]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>{message}</h2>
        </div>
    );
}

export default VerifyEmail;
