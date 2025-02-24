import React, { createContext, useContext, useState, useEffect } from 'react';
// Importing necessary React hooks and utilities
import { userAxiosInstance } from '../../config/axiosConfig';
// Importing a pre-configured Axios instance for making API requests
import Swal from 'sweetalert2';
// Importing SweetAlert2 for displaying alert pop-ups


const UserAuthContext = createContext();
// Creating a React Context for user authentication

export const useUserAuth = () => useContext(UserAuthContext);
// Custom hook to use the UserAuthContext in components

export const UserAuthProvider = ({ children }) => { // Creating a provider component that wraps the entire app and manages authentication state

    const [isAuthenticated, setIsAuthenticated] = useState(null); // State to track if the user is authenticated
    const [user, setUser] = useState(null); // State to store the user's information
    const login = (userData, token, navigate) => { // Function to log the user in and update state

        const nestedUserData = userData?.userData || userData; // Handle cases where user data might be nested inside another object

        const standardizedUser = {
            id: nestedUserData.id || nestedUserData._id || 'N/A',
            firstName: nestedUserData.firstName || 'Unknown',
            lastName: nestedUserData.lastName || 'User',
            email: nestedUserData.email || '',
            phone: nestedUserData.phone || '',
            preferredName: nestedUserData.preferredName || '',
            pronoun: nestedUserData.pronoun || '',
            city: nestedUserData.city || '',
            zipcode: nestedUserData.zipcode || '',
        };
        // Normalize the user data, providing default values if fields are missing

        setUser(standardizedUser); // Update state with user data
        setIsAuthenticated(true); // Set authentication status to true
        localStorage.setItem('user', JSON.stringify(standardizedUser));
        localStorage.setItem('userToken', token); // Save user token in local storage

        if (navigate && standardizedUser.id && standardizedUser.id !== 'N/A' && standardizedUser.id !== 'undefined') {
            navigate(`/user/${standardizedUser.id}`, { replace: true }); // Use replace to prevent history stack issue
        }        
    };

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // useEffect runs once when the component mounts (empty dependency array [])

        const storedUser = JSON.parse(localStorage.getItem('user'));
        // Retrieve the user data from localStorage and parse it (if available)

        if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
        }

        const token = localStorage.getItem('userToken');

        const validateSession = async () => {
            setLoading(true);
            const token = localStorage.getItem('userToken');
            if (!token) {
                setLoading(false);
                //logout(); // If no token exists, log out the user
                return;
            }

            try {
                const response = await userAxiosInstance.post('/validate-token', { token }); // Validate the token with the backend

                if (response.status === 404) {
                    return; // Do NOT log out
                }

                if (response.data.isValid) {
                    // If token is valid, extract user data
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

                    setUser(standardizedUser); // Update user state
                    setIsAuthenticated(true); // Mark user as authenticated
                }
            } catch (error) {
                logout();
            }
            setLoading(false); // Ensure loading state is always updated
        };

        setTimeout(() => {
            validateSession();
        }, 300); // Delay validation to ensure localStorage is ready
    }, []);

    // The handleSave method is responsible for updating the user's profile information
    const handleSave = async (userData, e) => {
        e.preventDefault(); // Ensures that the function does not trigger a page refresh when called inside a form submission, which is the default form submission behaviour
        try {
            const response = await fetch('api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            // Sends an API request to update the user's profile

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser); // Update state with the new user data

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Profile updated successfully!',
                }); // Show success alert
            } else {
                throw new Error('Failed to update profile.');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Something went wrong!',
                text: 'Failed to update profile. Please try again later.',
            }); // Show error alert
        }
    };

    const logout = (navigate) => {
        setIsAuthenticated(false); // Set authentication status to false
        setUser(null); // Clear user data
        localStorage.removeItem('user'); // Remove user data from local storage
        localStorage.removeItem('userToken'); // Remove authentication token
        if (navigate) navigate('/login'); // Redirect to login page if navigation function is provided
    };

    return (
        <>
            {loading ? ( // Prevent flickering login page before validation completes
                <div>Loading...</div> // You can replace this with a spinner or any UI component
            ) : (
                <UserAuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
                    {children}
                </UserAuthContext.Provider>
            )}
        </>
    );
    // Providing authentication state and functions to child components
};
