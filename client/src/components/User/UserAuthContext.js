import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAxiosInstance } from '../../config/axiosConfig';
import Swal from 'sweetalert2';

const UserAuthContext = createContext();

export const useUserAuth = () => useContext(UserAuthContext);

export const UserAuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('userToken');

        const handleSave = async (userData, e) => {
            e.preventDefault();
            try {
                const response = await fetch('/api/user/update', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userData),
                });

                if (response.ok) {
                    const updatedUser = await response.json();
                    // Update context with new user data
                    setUser(updatedUser); // Assuming setUser is available from context

                    Swal.fire({
                        icon: 'success',
                        title: 'Success!',
                        text: 'Profile updated successfully!',
                    });
                } else {
                    throw new Error('Failed to update profile.');
                }
            } catch (error) {
                console.error('Error updating profile:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Something went wrong!',
                    text: 'Failed to update profile. Please try again later.',
                });
            }
        };

        const validateSession = async () => {
            const token = localStorage.getItem('userToken');
            if (!token) {
                console.warn("No token found in storage. Logging out...");
                logout();
                return;
            }

            try {
                const response = await userAxiosInstance.post('/api/user/validate-token', { token });

                if (response.data.isValid) {
                    const userFromBackend = response.data.user;
                    const standardizedUser = {
                        id: userFromBackend.id,
                        firstName: userFromBackend.firstName || "Unknown",
                        lastName: userFromBackend.lastName || "Unknown",
                        email: userFromBackend.email || "Unknown",
                        image: userFromBackend.image || null,
                        phone: userFromBackend.phone || "Unknown",
                        preferredName: userFromBackend.preferredName || "Unknown",
                        pronoun: userFromBackend.pronoun || "Unknown",
                        city: userFromBackend.city || "Unknown",
                        zipcode: userFromBackend.zipcode || "Unknown",
                    };

                    setUser(standardizedUser);
                    setIsAuthenticated(true);
                } else {
                    console.warn("Session validation failed. Logging out...");
                    logout();
                }
            } catch (error) {
                console.error('Error during session validation:', error);
                logout();
            }
        };

        validateSession();
    }, []);

    const login = (userData, token, navigate) => {
        // Handle nested or direct user data
        const nestedUserData = userData?.userData || userData;

        // Standardize the user object with fallbacks
        const standardizedUser = {
            id: nestedUserData.id || nestedUserData._id || 'N/A', // Handle both `id` and `_id` fields
            firstName: nestedUserData.firstName || 'Unknown', // Default to 'Unknown' if not provided
            lastName: nestedUserData.lastName || 'User', // Default to 'User' if not provided
            email: nestedUserData.email || '', // Default to empty string
            phone: nestedUserData.phone || '',
            preferredName: nestedUserData.preferredName || '',
            pronoun: nestedUserData.pronoun || '',
            city: nestedUserData.city || '',
            zipcode: nestedUserData.zipcode || '',
        };

        // Update context and local storage
        setUser(standardizedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(standardizedUser));
        localStorage.setItem('userToken', token);

        // Navigate to user-specific route after login
        if (navigate && standardizedUser.id !== 'N/A') {
            navigate(`/user/${standardizedUser.id}`);
        } else {
            console.warn("Navigate function not provided or user ID is invalid.");
        }
    };

    const logout = (navigate) => {
        console.log("UserAuthContext: Logging out...");
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('userToken');
        if (navigate) navigate('/login'); // Only navigate if the function is passed
    };

    return (
        <UserAuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </UserAuthContext.Provider>
    );
};



