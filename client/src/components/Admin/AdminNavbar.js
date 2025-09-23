import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
    FaCalendarAlt, 
    FaBookOpen, 
    FaCookieBite, 
    FaUsers, 
    FaEnvelope, 
    FaChartLine, 
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaChalkboardTeacher
} from 'react-icons/fa';
import './AdminNavbar.scss';
import '../../App.scss';

const AdminNavbar = () => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    // Logout function: Removes admin token and redirects to login page
    const logout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
    };

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: FaCalendarAlt, label: 'Events' },
        { path: '/admin/bookings', icon: FaBookOpen, label: 'Bookings' },
        { path: '/admin/chocolates', icon: FaCookieBite, label: 'Chocolates' },
        { path: '/admin/signups', icon: FaChalkboardTeacher, label: 'Classes' },
        { path: '/admin/users', icon: FaUsers, label: 'Clients' },
        { path: '/admin/subscribers', icon: FaEnvelope, label: 'Subscribers' },
        { path: '/admin/finances', icon: FaChartLine, label: 'Finances' }
    ];

    return (
        <div className={`admin-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="sidebar-header">
                <button className="toggle-btn" onClick={toggleSidebar}>
                    {isExpanded ? <FaTimes /> : <FaBars />}
                </button>
                {isExpanded && <h2 className="admin-title">Admin Dashboard</h2>}
            </div>
            
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <li key={index}>
                                <NavLink 
                                    to={item.path} 
                                    className={({ isActive }) => 
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <IconComponent className="nav-icon" />
                                    {isExpanded && <span className="nav-text">{item.label}</span>}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={logout}>
                    <FaSignOutAlt className="nav-icon" />
                    {isExpanded && <span className="nav-text">Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default AdminNavbar;
