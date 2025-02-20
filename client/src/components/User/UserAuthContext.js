// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { userAxiosInstance } from '../../config/axiosConfig';
// import Swal from 'sweetalert2';

// const UserAuthContext = createContext();

// export const useUserAuth = () => useContext(UserAuthContext);

// export const UserAuthProvider = ({ children }) => {
//     const [isAuthenticated, setIsAuthenticated] = useState(false);
//     const [user, setUser] = useState(null);

//     useEffect(() => {
//         const storedUser = JSON.parse(localStorage.getItem('user'));
//         const token = localStorage.getItem('userToken');

//         const handleSave = async (userData, e) => {
//             e.preventDefault();
//             try {
//                 const response = await fetch('/api/user/update', {
//                     method: 'PUT',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(userData),
//                 });

//                 if (response.ok) {
//                     const updatedUser = await response.json();
//                     // Update context with new user data
//                     setUser(updatedUser); // Assuming setUser is available from context

//                     Swal.fire({
//                         icon: 'success',
//                         title: 'Success!',
//                         text: 'Profile updated successfully!',
//                     });
//                 } else {
//                     throw new Error('Failed to update profile.');
//                 }
//             } catch (error) {
//                 console.error('Error updating profile:', error);
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Something went wrong!',
//                     text: 'Failed to update profile. Please try again later.',
//                 });
//             }
//         };

//         const validateSession = async () => {
//             const token = localStorage.getItem('userToken');
//             if (!token) {
//                 console.warn("No token found in storage. Logging out...");
//                 logout();
//                 return;
//             }

//             try {
//                 const response = await userAxiosInstance.post('/api/user/validate-token', { token });

//                 if (response.data.isValid) {
//                     const userFromBackend = response.data.user;
//                     const standardizedUser = {
//                         id: userFromBackend.id,
//                         firstName: userFromBackend.firstName || "Unknown",
//                         lastName: userFromBackend.lastName || "Unknown",
//                         email: userFromBackend.email || "Unknown",
//                         image: userFromBackend.image || null,
//                         phone: userFromBackend.phone || "Unknown",
//                         preferredName: userFromBackend.preferredName || "Unknown",
//                         pronoun: userFromBackend.pronoun || "Unknown",
//                         city: userFromBackend.city || "Unknown",
//                         zipcode: userFromBackend.zipcode || "Unknown",
//                     };

//                     setUser(standardizedUser);
//                     setIsAuthenticated(true);
//                 } else {
//                     console.warn("Session validation failed. Logging out...");
//                     logout();
//                 }
//             } catch (error) {
//                 console.error('Error during session validation:', error);
//                 logout();
//             }
//         };

//         validateSession();
//     }, []);

//     const login = (userData, token, navigate) => {
//         // Handle nested or direct user data
//         const nestedUserData = userData?.userData || userData;

//         // Standardize the user object with fallbacks
//         const standardizedUser = {
//             id: nestedUserData.id || nestedUserData._id || 'N/A', // Handle both `id` and `_id` fields
//             firstName: nestedUserData.firstName || 'Unknown', // Default to 'Unknown' if not provided
//             lastName: nestedUserData.lastName || 'User', // Default to 'User' if not provided
//             email: nestedUserData.email || '', // Default to empty string
//             phone: nestedUserData.phone || '',
//             preferredName: nestedUserData.preferredName || '',
//             pronoun: nestedUserData.pronoun || '',
//             city: nestedUserData.city || '',
//             zipcode: nestedUserData.zipcode || '',
//         };

//         // Update context and local storage
//         setUser(standardizedUser);
//         setIsAuthenticated(true);
//         localStorage.setItem('user', JSON.stringify(standardizedUser));
//         localStorage.setItem('userToken', token);

//         // Navigate to user-specific route after login
//         if (navigate && standardizedUser.id) {
//             navigate(`/user/${standardizedUser.id}`);
//         } else {
//             console.warn("Navigate function not provided or user ID is invalid.");
//         }
//     };

//     const logout = (navigate) => {
//         console.log("UserAuthContext: Logging out...");
//         setIsAuthenticated(false);
//         setUser(null);
//         localStorage.removeItem('user');
//         localStorage.removeItem('userToken');
//         if (navigate) navigate('/login'); // Only navigate if the function is passed
//     };

//     return (
//         <UserAuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
//             {children}
//         </UserAuthContext.Provider>
//     );
// };


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

    const [isAuthenticated, setIsAuthenticated] = useState(null);
    // State to track if the user is authenticated

    const [user, setUser] = useState(null);
    // State to store the user's information

    const login = (userData, token, navigate) => {
        // Function to log the user in and update state

        const nestedUserData = userData?.userData || userData;
        // Handle cases where user data might be nested inside another object

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

        console.log("🚀 Navigating to:", `/user/${standardizedUser.id}`);

        if (navigate && standardizedUser.id && standardizedUser.id !== 'N/A' && standardizedUser.id !== 'undefined') {
            console.log("🚀 Navigating to:", `/user/${standardizedUser.id}`);
            navigate(`/user/${standardizedUser.id}`, { replace: true }); // Use replace to prevent history stack issue
        } else {
            console.warn("❌ Prevented navigation due to invalid user ID:", standardizedUser.id);
        }
    };

    useEffect(() => {
        // useEffect runs once when the component mounts (empty dependency array [])

        const storedUser = JSON.parse(localStorage.getItem('user'));
        // Retrieve the user data from localStorage and parse it (if available)

        if (storedUser) {
            console.log("✅ Restoring user from localStorage:", storedUser);
            setUser(storedUser);
            setIsAuthenticated(true);
        }

        const token = localStorage.getItem('userToken');
        // Retrieve the authentication token from localStorage

        const login = (userData, token, navigate) => {
            // Function to log the user in and update state

            const nestedUserData = userData?.userData || userData;
            // Handle cases where user data might be nested inside another object

            console.log("✅ Login function: Received userData:", nestedUserData);

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

            console.log("🚀 Navigating to:", `/user/${standardizedUser.id}`);

            setUser(standardizedUser); // Update state with user data
            setIsAuthenticated(true); // Set authentication status to true
            localStorage.setItem('user', JSON.stringify(standardizedUser));
            localStorage.setItem('userToken', token); // Save user token in local storage

            // Wait until state updates before navigating
            setTimeout(() => {
                if (navigate && standardizedUser.id !== 'N/A') {
                    navigate(`/user/${standardizedUser.id}`, { replace: true });
                } else {
                    console.warn("❌ Prevented navigation due to invalid user ID.");
                }
            }, 300);
        };

        const validateSession = async () => {
            const token = localStorage.getItem('userToken');
            console.log("🔍 Checking localStorage token on refresh:", token);
            if (!token) {
                console.warn("No token found in storage. Logging out...");
                //logout(); // If no token exists, log out the user
                return;
            }

            try {
                console.log("🚀 Sending request to validate token:", token);
                const response = await userAxiosInstance.post('/api/user/validate-token', { token });
                // Validate the token with the backend

                console.log("✅ Server response:", response.data);

                if (response.status === 404) {
                    console.error("Backend endpoint not found! Keeping user logged in.");
                    return; // Do NOT log out
                }

                if (response.data.isValid) {
                    console.log("✅ Session is valid. Keeping user logged in.");
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
                } else {
                    console.warn("Session validation failed. Logging out...");
                    logout(); // If validation fails, log out the user
                }
            } catch (error) {
                if (error.response?.status === 404) {
                    console.error("Backend validation endpoint missing. Keeping user logged in.");
                    return; // Prevent logout due to missing endpoint
                }
                console.error("Error validating session:", error);
                logout();
            }
        };

        setTimeout(() => {
            validateSession();
        }, 300); // Delay validation to ensure localStorage is ready
    }, []);

    // The handleSave method is responsible for updating the user's profile information
    const handleSave = async (userData, e) => {
        e.preventDefault(); // Ensures that the function does not trigger a page refresh when called inside a form submission, which is the default form submission behaviour
        try {
            const response = await fetch('/api/user/update', {
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
            console.error('Error updating profile:', error);
            Swal.fire({
                icon: 'error',
                title: 'Something went wrong!',
                text: 'Failed to update profile. Please try again later.',
            }); // Show error alert
        }
    };

    const logout = (navigate) => {
        console.log("UserAuthContext: Logging out...");
        setIsAuthenticated(false); // Set authentication status to false
        setUser(null); // Clear user data
        localStorage.removeItem('user'); // Remove user data from local storage
        localStorage.removeItem('userToken'); // Remove authentication token
        if (navigate) navigate('/login'); // Redirect to login page if navigation function is provided
    };

    return (
        <UserAuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </UserAuthContext.Provider>
    );
    // Providing authentication state and functions to child components
};
