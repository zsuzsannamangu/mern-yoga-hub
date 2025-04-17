import React, { useEffect, useState } from 'react';
import { useParams, Routes, Route, useLocation } from 'react-router-dom';
import UserBookings from './UserBookings';
import UserBookNew from './UserBookNew';
import UserAccount from './UserAccount';
import './UserPage.scss';
import '../../App.scss';
import { useUserAuth } from '../User/UserAuthContext';
import { userAxiosInstance } from '../../config/axiosConfig';
import { useSearchParams } from 'react-router-dom';

function UserPage() {
    const { user } = useUserAuth(); // Access user from context
    const { userId: paramUserId } = useParams(); // Get userId from the URL
    const [userData, setUserData] = useState(null);
    const location = useLocation();

    // Determine the current userId: prioritize context, fallback to param
    const userId = user?.id || paramUserId;

    const [searchParams] = useSearchParams(); // Get search params (e.g., ?token=xyz)

    // Store token if coming from OAuth login
    useEffect(() => {
        const token = searchParams.get('token');
        const userId = searchParams.get('userId') || paramUserId;

        if (token && userId) {
            // validate token
            const validateToken = async () => {
                try {
                    const response = await userAxiosInstance.post('/validate-token', { token });
                    if (response.data.isValid) {
                        login(response.data.user, token); // use your context login function
                    }
                } catch (err) {
                    console.error('OAuth login failed:', err);
                }
            };
            validateToken();
        }
    }, [searchParams]);

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
