import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "./AboutWebsite.scss";
import { FaGithub } from 'react-icons/fa'; // GitHub and Instagram icons from react-icons

const AboutWebsite = () => {
    return (
        <div className="about-app">
            <div className="about-container">
                <h1>About This Website</h1>

                {/* Introduction */}
                <section className="app-intro">
                    <h2>Hey there!</h2>
                    <p>
                        I built this website from scratch using the MERN stack—which means no Wix,
                        no templates, just real code. <p>As a yoga teacher and chocolatier, I wanted a custom platform that
                            reflects my work and allows students to book sessions, sign up for classes & workshops, buy chocolates and stay connected.</p>
                    </p>
                </section>

                {/* Features */}
                <section className="features">
                    <h2>What This Website Can Do</h2>
                    <ul>
                        <li>**Secure user authentication** (sign up, log in, role-based access).</li>
                        <li>**Event & booking management** (create, update, delete, and track bookings).</li>
                        <li>**Secure online payments** (integrated with PayPal).</li>
                        <li>**Automated email notifications** (using SendGrid for confirmations & reminders).</li>
                        <li>**Mobile-friendly design** (works on phones, tablets, and desktops).</li>
                    </ul>
                </section>

                {/* Tech Stack */}
                <section className="tech-stack">
                    <h2>Built with These Technologies</h2>
                    <ul>
                        <li><strong>MongoDB:</strong> Stores all data.</li>
                        <li><strong>Express.js:</strong> Backend API.</li>
                        <li><strong>React:</strong> Frontend UI.</li>
                        <li><strong>Node.js:</strong> Runs the backend and handles business logic.</li>
                        <li><strong>PayPal API:</strong> Secure checkout for bookings and payments.</li>
                        <li><strong>SendGrid API:</strong> Automates email confirmations and reminders.</li>
                    </ul>
                </section>

                {/* Future Enhancements */}
                <section className="future-plans">
                    <h2>What’s Next?</h2>
                    <p>There’s always room to grow. Here are some features I plan to add:</p>
                    <ul>
                        <li>**Tax API** integration to automatically calculate tax based on location.</li>
                        <li>**Kubernetes** for scaling, so the app stays fast under heavy traffic.</li>
                        <li>**Socket.IO** to enable real-time updates for instant booking confirmations.</li>
                    </ul>
                </section>

                {/* Contact & Hiring Info */}
                <section className="contact">
                    <h2>Let’s Work Together</h2>
                    <p>
                        If you're looking for a developer to build a website like this for your business
                        or if you're a company looking for a full-stack developer, I’d love to chat.
                        <Link to="/contact" className="contact-link"> Message me! </Link>
                    </p>
                </section>
                <section className="code">
                    <p>
                        <FaGithub style={{ marginLeft: '8px', verticalAlign: 'middle' }} /> {/* GitHub icon */} See the code on 
                        <a
                            href="https://github.com/zsuzsannamangu/MERN-yoga-hub/tree/main" // GitHub profile link
                            target="_blank" // Open in a new tab
                            rel="noopener noreferrer" // Security best practice for external links
                        > GitHub!
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default AboutWebsite;
