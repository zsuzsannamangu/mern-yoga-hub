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
                    console.log("✅ VerifyLogin: Full user object before login:", JSON.stringify(user, null, 2));

                    const userId = user.id || user._id; // Ensure we get the correct user ID

                    console.log("✅ VerifyLogin: Extracted User ID before login:", userId);

                    if (!userId) {
                        console.error("❌ VerifyLogin: User ID is STILL undefined before login!", user);
                    } else {
                        console.log("✅ VerifyLogin: Extracted User ID before login:", userId);
                    }

                    login({ userData: user, id: userId }, token, () => {
                        console.log("✅ Navigating after login state is updated...");
                        setTimeout(() => {
                            navigate(`/user/${userId}`, { replace: true }); // Ensures state is updated before navigation
                        }, 500);
                    });

                    // Save the token and user to localStorage
                    localStorage.setItem('userToken', token);
                    localStorage.setItem('user', JSON.stringify(user));

                    // Redirect user to their dashboard
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful',
                        text: 'You have been logged in successfully.',
                        icon: 'success',
                    }).then(() => {
                        console.log("✅ Navigating again after SweetAlert...");
                        navigate(`/user/${userId}`);
                    });
                } else {
                    throw new Error('Invalid response: Missing token or user.');
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: 'Your login link is invalid or has expired. Please request a new link and try again.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate('/login');
                });
            }
        };

        if (tokenFromUrl) {
            verifyLogin();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                text: 'Your login link is invalid or may have expired. Please request a new link and try again.',
                confirmButtonText: 'OK'
            }).then(() => {
                navigate('/login');
            });
        }
    }, [searchParams, navigate, login]);

    return <div>Verifying login...</div>;
}

export default VerifyLogin;