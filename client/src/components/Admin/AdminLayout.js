import React from 'react';
import AdminNavbar from './AdminNavbar';
import './AdminNavbar.scss';

const AdminLayout = ({ children }) => {
    return (
        <div className="admin-layout">
            <AdminNavbar />
            <div className="admin-content">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
