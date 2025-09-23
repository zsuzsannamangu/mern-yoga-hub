import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const ConditionalNavbar = () => {
    const location = useLocation();
    
    // Hide navbar on admin routes
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    if (isAdminRoute) {
        return null;
    }
    
    return <Navbar />;
};

export default ConditionalNavbar;
