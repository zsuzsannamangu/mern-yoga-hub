import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserAuth } from '../components/User/UserAuthContext';
import { useAdminAuth } from '../components/Admin/AdminAuthContext';

// Protect user-specific routes
export const UserProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useUserAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};


// Protect admin-specific routes
export const AdminProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAdminAuth(); // Ensure this reflects the admin auth flow
    return isAuthenticated ? children : <Navigate to="/admin" />;
};
