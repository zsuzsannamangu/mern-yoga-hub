import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from './User/UserAuthContext';
import { useCart } from '../context/CartContext';
import ProfileIcon from './User/ProfileIcon';
import { FaShoppingCart } from 'react-icons/fa';
import '../App.scss';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const { isAuthenticated, user, logout } = useUserAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const { cartCount } = useCart();

    const isChocolatesOrCartPage = location.pathname === '/chocolates' || location.pathname === '/cart';

    // Debugging user data
    useEffect(() => {
    }, [user]);

    // Handle clicks outside the profile menu
    const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
            setIsMenuOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout(navigate); // Pass navigate to logout
        setIsMenuOpen(false);
    };

    return (
        <div className="navbar">
            <div className="logo">
                {isChocolatesOrCartPage ? 'ReTreat Chocolates' : 'Zsuzsanna Mangu'}
            </div>
            <div className="nav-links">
                {isChocolatesOrCartPage ? (
                    <>
                        <Link to="/chocolates" className="nav-item nav-item-chocolates">Chocolates</Link>
                        <Link to="/contact" className="nav-item">Contact</Link>
                        <Link to="/" className="nav-item">Back to Yoga</Link>
                    </>
                ) : (
                    <>
                        <Link to="/" className="nav-item">Home</Link>
                        <Link to="/about" className="nav-item">About</Link>
                        <Link to="/calendar" className="nav-item">Calendar</Link>
                        <Link to="/contact" className="nav-item">Contact</Link>
                        <Link to="/chocolates" className="nav-item nav-item-chocolates">Chocolates</Link>
                    </>
                )}
            </div>

            <div className="nav-buttons">
                {isChocolatesOrCartPage ? (
                    <button>
                        <Link to="/cart" className="cart-button">
                            <FaShoppingCart />
                            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                            {/* Display cart item count */}
                        </Link>
                    </button>
                ) : isAuthenticated ? (
                    <div ref={menuRef}>
                        <div onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {/* ProfileIcon now only displays initials */}
                            <ProfileIcon user={user} />
                        </div>
                        {isMenuOpen && (
                            <div className="profile-menu">
                                <ul>
                                    <li>
                                        <Link
                                            to={user?.id ? `/user/${user.id}` : "/login"}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            My Bookings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to={user?.id ? `/user/${user.id}/book` : "/login"}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            New Booking
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to={user?.id ? `/user/${user.id}/account` : "/login"}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Account
                                        </Link>
                                    </li>
                                    <li>
                                        <button
                                            className="user-logout-button"
                                            onClick={handleLogout}
                                        >
                                            Log Out
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <button className="button register" onClick={() => navigate('/register')}>Register</button>
                        <button className="button login" onClick={() => navigate('/login')}>Log in</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default Navbar;
