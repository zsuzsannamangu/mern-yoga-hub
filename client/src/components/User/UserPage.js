import React, { useEffect, useState } from 'react';
import { useParams, Routes, Route, useLocation, useSearchParams } from 'react-router-dom';
import UserBookings from './UserBookings';
import UserBookNew from './UserBookNew';
import UserAccount from './UserAccount';
import './UserPage.scss';
import '../../App.scss';
import { useUserAuth } from './UserAuthContext';
import { userAxiosInstance } from '../../config/axiosConfig';

function UserPage() {
    const { user, login } = useUserAuth(); // Access user from context
    const { userId: paramUserId } = useParams(); // Get userId from the URL
    const [userData, setUserData] = useState(null);
    const location = useLocation();

    // Determine the current userId: prioritize context, fallback to param
    const userId = user?.id || paramUserId;

    const [searchParams] = useSearchParams(); // Get search params (e.g., ?token=xyz)

    const token = searchParams.get('token');
    const queryUserId = searchParams.get('userId');
    const finalUserId = user?.id || queryUserId || paramUserId;

    // Store token if coming from OAuth login
    // useEffect(() => {
    //     const token = searchParams.get('token');
    //     const userId = searchParams.get('userId') || paramUserId;

    //     console.log("🌐 UserPage token from URL:", token);
    //     console.log("🌐 userId from URL or context:", userId);

    //     if (token && userId) {
    //         // validate token
    //         const validateToken = async () => {
    //             console.log('Validating token...');
    //             try {
    //                 const response = await userAxiosInstance.post('/validate-token', { token });
    //                 console.log("Validation response:", response.data);
    //                 if (response.data.isValid) {
    //                     login(response.data.user, token); // use context login function
    //                     console.log("Login successful, user:", response.data.user);
    //                 }
    //             } catch (err) {
    //                 console.error('OAuth login failed:', err);
    //             }
    //         };
    //         validateToken();
    //     }
    // }, [searchParams]);

    useEffect(() => {
        if (token && !user) {
            const validateToken = async () => {
                console.log('🌐 Validating token from query...');
                try {
                    const res = await userAxiosInstance.post('/validate-token', { token });
                    if (res.data.isValid) {
                        login(res.data.user, token);
                        console.log('✅ User logged in via token');
                    }
                } catch (err) {
                    console.error('❌ Token validation failed', err);
                }
            };
            validateToken();
        }
    }, [token, user, login]);

    useEffect(() => {
        if (!userId) {
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await userAxiosInstance.get(`/${userId}`);
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        fetchUser();
    }, [userId]); // <-- This runs whenever the userId becomes available

    // This prevents premature rendering before user is ready
    if (!user && token) {
        return <div>Signing you in...</div>;
    }

    return (
        <div className="user-page">
            <div className="user-content">
                {location.pathname !== `/user/${userId}/account` && (
                    <header className="user-header">
                        <h1>Hi, {userData?.firstName || user?.firstName || 'Loading...'}!</h1>
                    </header>
                )}
                <Routes>
                    <Route path="/" element={<UserBookings userId={userId} />} />
                    <Route path="book" element={<UserBookNew userId={userId} user={userData} />} />
                    <Route path="account" element={<UserAccount userId={userId} />} />
                </Routes>
            </div>
        </div>
    );
}

export default UserPage;
