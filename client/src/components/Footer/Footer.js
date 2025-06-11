import React from 'react';
import './Footer.scss'; // Importing the Footer-specific styles
import { FaGithub, FaInstagram } from 'react-icons/fa'; // GitHub and Instagram icons from react-icons
import { SiEtsy } from 'react-icons/si';

function Footer() {
    return (
        <div className="footer">
            <div className="footer-content">
                {/* Footer text and GitHub link */}
                <p>
                    Website developed by &copy; Zsuzsanna Mangu 2025
                    <a
                        href="https://github.com/zsuzsannamangu/MERN-yoga-hub/tree/main" // GitHub profile link
                        target="_blank" // Open in a new tab
                        rel="noopener noreferrer" // Security best practice for external links
                        className="github-link"
                    >
                        <FaGithub style={{ marginLeft: '8px', verticalAlign: 'middle' }} /> {/* GitHub icon */}
                    </a>
                </p>

                {/* Navigation and social links */}
                <div className="footer-links">
                    {/* Internal links */}
                    <a href="/">Home</a>
                    <a href="/about">About</a>
                    <a href="/calendar">Calendar</a>
                    <a href="/contact">Contact</a>
                    <a href="/chocolates">Chocolates</a>
                    <a href="/aboutwebsite">Website</a>

                    {/* Instagram link */}
                    <a
                        href="https://www.instagram.com/zsuzsannacreates/" // Instagram profile link
                        target="_blank" // Open in a new tab
                        rel="noopener noreferrer" // Security best practice for external links
                        className="instagram-link"
                    >
                        <FaInstagram style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {/* Instagram icon */}
                    </a>
                    <a
                        href="https://www.etsy.com/shop/retreatcreations" // Etsy profile link
                        target="_blank" // Open in a new tab
                        rel="noopener noreferrer" // Security best practice for external links
                        className="instagram-link"
                    >
                        <SiEtsy style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {/* Etsy icon */}
                    </a>

                </div>
            </div>
        </div>
    );
}
export default Footer;
