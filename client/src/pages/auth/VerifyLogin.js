import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUserAuth } from '../../components/User/UserAuthContext';
import { userAxiosInstance } from '../../config/axiosConfig';
import Swal from 'sweetalert2';

function VerifyLogin() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useUserAuth(); // Access the login function from context
    const alertShown = useRef(false); // Prevent multiple alerts

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token'); // Extract token from URL query params

        const verifyLogin = async () => {
            try {
                const response = await userAxiosInstance.get('/verify-login', {
                    params: { token: tokenFromUrl },
                });

                const { user, token } = response.data;

                if (user && token) {
                    const userId = user.id || user._id; // Ensure we get the correct user Id

                    if (!userId) {
                        console.error("VerifyLogin: User ID is STILL undefined before login!", user);
                    } else {
                        console.log("VerifyLogin: Extracted User ID before login:", userId);
                    }

                    login({ userData: user, id: userId }, token, () => {
                        setTimeout(() => {
                            navigate(`/user/${userId}`, { replace: true }); // Ensures state is updated before navigation
                        }, 500);
                    });

                    // Save the token and user to localStorage
                    localStorage.setItem('userToken', token);
                    localStorage.setItem('user', JSON.stringify(user));

                    // Redirect user to their dashboard
                    if (!alertShown.current) {
                        alertShown.current = true;
                        Swal.fire({
                            icon: 'success',
                            title: 'Login Successful',
                            text: 'You have been logged in successfully.',
                            confirmButtonText: 'OK'
                        }).then(() => {
                            navigate(`/user/${userId}`);
                        });
                    }
                } else {
                    throw new Error('Invalid response: Missing token or user.');
                }
            } catch (error) {
                if (!alertShown.current) {
                    alertShown.current = true;
                    
                    // Extract error message from server response
                    const errorMessage = error.response?.data?.message || 'Your login link is invalid or has expired. Please request a new link and try again.';
                    
                    console.error('Login verification error:', error);
                    
                    Swal.fire({
                        icon: 'error',
                        title: 'Login Failed',
                        text: errorMessage,
                        confirmButtonText: 'OK'
                    }).then(() => {
                        navigate('/login');
                    });
                }
            }
        };

        if (tokenFromUrl) {
            verifyLogin();
        } else {
            if (!alertShown.current) {
                alertShown.current = true;
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: 'Your login link is invalid or may have expired. Please request a new link and try again.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate('/login');
                });
            }
        }
    }, [searchParams, navigate, login]);

    return <div>Verifying login...</div>;
}

export default VerifyLogin;