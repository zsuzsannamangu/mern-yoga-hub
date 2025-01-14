import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [admin, setAdmin] = useState(null);

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
                console.error("Error parsing admin data from localStorage:", error);
                localStorage.removeItem('admin');
                localStorage.removeItem('adminToken');
            }
        };

        const checkTokenValidity = async () => {
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    const response = await fetch('/api/admin/verify', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!response.ok) throw new Error('Invalid token');
                } catch (error) {
                    console.error('Admin token validation failed:', error);
                    logout();
                }
            }
        };

        initializeAuth();
        checkTokenValidity();
    }, []);

    const login = (adminData, token) => {
        setIsAuthenticated(true);
        setAdmin(adminData);
        localStorage.setItem('admin', JSON.stringify(adminData));
        localStorage.setItem('adminToken', token);
    };

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
