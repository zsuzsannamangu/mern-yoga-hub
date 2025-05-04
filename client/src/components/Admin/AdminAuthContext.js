import React, { createContext, useContext, useState, useEffect } from 'react';

// Create Admin Authentication Context
const AdminAuthContext = createContext();

// Custom hook for using the admin authentication context
export const useAdminAuth = () => useContext(AdminAuthContext);

// Admin Authentication Provider Component
export const AdminAuthProvider = ({ children }) => {
    // State for authentication status and admin data
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState(null);

    // Function to initialize authentication state from localStorage
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedAdmin = JSON.parse(localStorage.getItem('admin')) || null;
                const token = localStorage.getItem('adminToken');

                if (storedAdmin && token) {
                    setAdmin(storedAdmin);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                localStorage.removeItem('admin');
                localStorage.removeItem('adminToken');
            }
        };

        // Function to validate admin token with the backend
        const checkTokenValidity = async () => {
            const token = localStorage.getItem('adminToken');
            if (token) { // If no token, skip validation
                try {
                    const response = await fetch('/api/admin/verify', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!response.ok) throw new Error('Invalid token');
                } catch (error) {
                    logout();
                }
            }
        };

        initializeAuth();
        checkTokenValidity();

        return () => {
            // Cleanup function (if needed in the future).
        };
    }, []);

    /**
     * Logs in the admin user and stores credentials in localStorage.
     * @param {Object} adminData - The admin user data.
     * @param {string} token - The authentication token.
     */
    const login = (adminData, token) => {
        setIsAuthenticated(true);
        setAdmin(adminData);
        localStorage.setItem('admin', JSON.stringify(adminData));
        localStorage.setItem('adminToken', token);
    };

    /**
     * Logs out the admin user, clears state and localStorage.
     */
    const logout = () => {
        setIsAuthenticated(false);
        setAdmin(null);
        localStorage.removeItem('admin');
        localStorage.removeItem('adminToken');
    };

    return (
        <AdminAuthContext.Provider value={{ isAuthenticated, admin, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
};

