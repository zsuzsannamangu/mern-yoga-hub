import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from './User/UserAuthContext';
import { useCart } from '../context/CartContext';
import ProfileIcon from './User/ProfileIcon';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import '../App.scss';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const { isAuthenticated, user, logout } = useUserAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const mobileMenuRef = useRef(null);
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
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
            // Check if click is not on hamburger button
            if (!event.target.closest('.hamburger-button')) {
                setIsMobileMenuOpen(false);
            }
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout(navigate); // Pass navigate to logout
        setIsMenuOpen(false);
    };

    return (
        <div className="navbar">
            {/* Hamburger button - mobile only */}
            <button 
                className="hamburger-button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
            >
                {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div className="logo">
                {isChocolatesOrCartPage ? 'ReTreat Chocolates' : 'Zsuzsanna Mangu'}
            </div>

            {/* Desktop nav links */}
            <div className="nav-links">
                {isChocolatesOrCartPage ? (
                    <>
                        <Link to="/chocolates" className="nav-item nav-item-chocolates">Chocolates</Link>
                        <Link to="/contact" className="nav-item">Contact</Link>
                        <Link to="/yoga" className="nav-item">Back to Yoga</Link>
                    </>
                ) : (
                    <>
                        <Link to="/" className="nav-item">Home</Link>
                        <Link to="/yoga" className="nav-item">Yoga</Link>
                        <Link to="/yoga-therapy" className="nav-item">Yoga Therapy</Link>
                        <Link to="/calendar" className="nav-item">Calendar</Link>
                        <Link to="/chocolates" className="nav-item nav-item-chocolates">Chocolates</Link>
                        <Link to="/contact" className="nav-item">Contact</Link>
                    </>
                )}
            </div>

            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}>
                    <div 
                        className="mobile-menu" 
                        ref={mobileMenuRef}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mobile-menu-header">
                            <div className="mobile-logo">
                                {isChocolatesOrCartPage ? 'ReTreat Chocolates' : 'Zsuzsanna Mangu'}
                            </div>
                            <button 
                                className="mobile-menu-close"
                                onClick={() => setIsMobileMenuOpen(false)}
                                aria-label="Close menu"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <nav className="mobile-nav-links">
                            {isChocolatesOrCartPage ? (
                                <>
                                    <Link to="/chocolates" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Chocolates</Link>
                                    <Link to="/contact" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                                    <Link to="/yoga" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Back to Yoga</Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                                    <Link to="/yoga" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Yoga</Link>
                                    <Link to="/yoga-therapy" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Yoga Therapy</Link>
                                    <Link to="/calendar" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Calendar</Link>
                                    <Link to="/chocolates" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Chocolates</Link>
                                    <Link to="/contact" className="mobile-nav-item" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                                </>
                            )}
                        </nav>
                        <div className="mobile-nav-buttons">
                            {isChocolatesOrCartPage ? (
                                <Link to="/cart" className="mobile-cart-button" onClick={() => setIsMobileMenuOpen(false)}>
                                    <FaShoppingCart />
                                    {cartCount > 0 && <span className="cart-count">({cartCount})</span>}
                                </Link>
                            ) : isAuthenticated ? (
                                <div className="mobile-profile-section">
                                    <ProfileIcon user={user} />
                                    <div className="mobile-profile-menu">
                                        <Link
                                            to={user?.id ? `/user/${user.id}` : "/login"}
                                            className="mobile-profile-link"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            My Bookings
                                        </Link>
                                        <Link
                                            to={user?.id ? `/user/${user.id}/book` : "/login"}
                                            className="mobile-profile-link"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            New Booking
                                        </Link>
                                        <Link
                                            to={user?.id ? `/user/${user.id}/account` : "/login"}
                                            className="mobile-profile-link"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Account
                                        </Link>
                                        <Link
                                            to={user?.id ? `/user/${user.id}/forms` : "/login"}
                                            className="mobile-profile-link"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Forms
                                        </Link>
                                        <button
                                            className="mobile-logout-button"
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                        >
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button className="mobile-button register" onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }}>Register</button>
                                    <button className="mobile-button login" onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}>Log in</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="nav-buttons">
                {isChocolatesOrCartPage ? (
                    <button>
                        <Link to="/cart" className="cart-button">
                            <FaShoppingCart />
                            {cartCount > 0 && <span className="cart-count">({cartCount})</span>}
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
                                        <Link
                                            to={user?.id ? `/user/${user.id}/forms` : "/login"}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Forms
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
