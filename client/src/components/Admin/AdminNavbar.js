import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './AdminNavbar.scss';
import '../../App.scss';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const logout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
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
                    <button onClick={logout}>Logout</button>
                </ul>
            </nav>
        </div>
    );
};

export default AdminNavbar;
