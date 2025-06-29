import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminNavbar.scss';
import '../../App.scss';

const AdminNavbar = () => {
    const navigate = useNavigate(); // Hook for navigation

    // Logout function: Removes admin token and redirects to login page
    const logout = () => {
        localStorage.removeItem('adminToken'); // Remove token from local storage
        navigate('/admin'); // Redirect to admin login page
    };
    return (
        <div className="admin-navbar">
            <h2 className="admin-title">Admin Dashboard</h2>
            <nav>
                <ul>
                    <li>
                        <NavLink to="/admin/dashboard" activeClassName="active-link">
                            Events
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/bookings" activeClassName="active-link">
                            Bookings
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/chocolates" activeClassName="active-link">
                            Chocolates
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/signups" activeClassName="active-link">
                            Classes
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/users" activeClassName="active-link">
                            Clients
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/subscribers" activeClassName="active-link">
                            Subscribers
                        </NavLink>
                    </li>
                    <button onClick={logout}>Logout</button>
                </ul>
            </nav>
        </div>
    );
};

export default AdminNavbar;
