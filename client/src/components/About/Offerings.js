// src/components/Offerings.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Offerings.scss';
import '../../App.scss';

/**
 * Offerings Data
 * An array of objects representing different yoga offerings.
 * Each object contains:
 * - id: Unique identifier
 * - title: Name of the offering
 * - description: HTML formatted description
 * - image: Path to the offering image
 */

const offeringsData = [
    {
        id: 1,
        title: "Group Classes",
        description: `
        I teach weekly group classes at various studios throughout Portland, offering a range of practices to meet you where you are.
        <br><br><strong>Hatha Yoga:</strong> A grounding practice that blends breath awareness with intentional movement, creating space for balance, strength, and inner stillness. Slower-paced than vinyasa, offering time to explore alignment and deepen into each pose.
	    <br><br><strong>Vinyasa & Morning Flow:</strong> Flowing breath-based movement that builds strength, flexibility, and focus through creative sequences and mindful transitions. Perfect for cultivating presence and energy.
	    <br><br><strong>Restorative Yoga:</strong> A deeply relaxing practice designed to soothe the nervous system and restore balance, using props to support the body in restful poses.
        <br><br><strong>Wheelchair & Adaptive Yoga:</strong> Practices tailored for wheelchair users, focusing on breathwork, gentle movement, and mindfulness.
        <br><br><strong>Postnatal Yoga:</strong> Supporting postpartum recovery through gentle movement, breathwork, and community. Pre-crawling babies welcome!
        <br><br>View the complete schedule and sign up for classes on the <a href="/yoga?section=classDescriptions">Classes & Workshops page</a> or check the <a href="/calendar">calendar</a> for current offerings.
        `,
        image: '/images/yoga/Zsuzsi_yoga_25.jpg',
    },
    {
        id: 2,
        title: "Yoga Therapy",
        description: `
        Yoga therapy is a personalized, holistic approach that supports physical, emotional, and mental well-being. It combines breath, movement, psychology, neurobiology, mindfulness, and somatic practices to address specific concerns or conditions.
        <br><br><strong>What makes yoga therapy different?</strong> Unlike general yoga classes, yoga therapy sessions are tailored to your individual needs, creating space for healing, resilience, and greater self-awareness. Sessions are designed to meet you exactly where you are.
        <br><br><strong>What to expect:</strong> Each session brings together mindful movement, guided breathwork, meditation, and nervous system support. Practices are designed to be integrated into your daily life for sustainable wellness.
        <br><br><strong>Pricing:</strong> $10-$80/hr sliding scale (offered until June 2026, while I'm in training). Your investment is a personal choice, aligning with your current financial circumstances. No questions asked. 
        <br><br>To book a session, please <a href="/register">create an account</a>. Once registered, you'll see available sessions.
        `,
        image: '/images/yoga/childs-pose.jpg'
    },
    {
        id: 3,
        title: "Private Yoga",
        description: `
        <strong>Individual Yoga Sessions:</strong> Personalized one-on-one sessions designed to meet your unique needs. These sessions offer tailored practices including physical postures, breathwork, meditation, and yoga philosophy.
        <br><br>Private sessions are ideal for:
        <br>• Building a personal practice tailored to your body and goals
        <br>• Working with specific physical conditions or injuries
        <br>• Deepening your understanding of breathwork and meditation
        <br>• Exploring yoga philosophy and its application to daily life
        <br><br><strong>Pricing:</strong> $80-$110/hr sliding scale. Your investment is a personal choice, aligning with your current financial circumstances. No questions asked.
        <br><br>Sessions are available in-person in Portland, Oregon, or online via Google Meet.
        <br><br>To book a session, please <a href="/register">create an account</a>. Once registered, you'll see available time slots.
        `,
        image: '/images/yoga/yoga5.jpg',
    },
    {
        id: 4,
        title: "Workshops",
        description: `
        <strong>Awaken the Senses: Restorative Yoga, Handcrafted Chocolate and Chakra Exploration</strong>
        <br><br>An immersive experience combining restorative yoga, meditation, and sense awareness. This workshop brings together yoga and handmade chocolate to awaken presence, deepen awareness, and open the senses.
        <br><br>As both a chocolatier and yoga teacher, I bring these worlds together with intention. The chocolates we taste are created specifically to reflect the body's energetic centers, the chakras, using organic cacao infused with edible flowers, fruits, and spices.
        <br><br>Throughout the workshop, you'll be guided through restorative yoga and meditation practices that prepare the body and mind to fully experience these flavors. Together, we'll explore the chakras through both movement and sense awareness.
        <br><br>View upcoming workshop dates and register on the <a href="/yoga?section=classDescriptions">Classes & Workshops page</a>.
        `,
        image: '/images/yoga/Zsuzsi_yoga_21.jpg',
    },
];

/**
 * Offerings Component
 * Displays different yoga offerings, allowing users to view details and book sessions.
 */

function Offerings() {
    const navigate = useNavigate(); // React Router hook for navigation
    const [selectedOffering, setSelectedOffering] = useState(null); // State for managing modal visibility

    const handleOpenModal = (offering) => {     // Opens the modal for the selected offering
        setSelectedOffering(offering);
    };

    const handleCloseModal = () => { // Closes the modal
        setSelectedOffering(null);
    };

    //Navigates to the register page
    const handleBookClick = () => {
        navigate('/register');
    };


    return (
        <div className="offerings-section">
            <h2 className="section-title">Offerings</h2>
            <div className="title-line"></div>

            {/* SEO Hidden Content */}
            <div className="seo-content">
                {offeringsData.map((offering) => (
                    <div key={offering.id}>
                        <h3>{offering.title}</h3>
                        <div dangerouslySetInnerHTML={{ __html: offering.description }} />
                    </div>
                ))}
            </div>

            {/* Offerings List */}
            <div className="offerings-grid">
                {offeringsData.map((offering) => (
                    <div key={offering.id} className="offering-card">
                        <img src={offering.image} alt={offering.title} className="offering-image" />
                        <h3 className="offering-name">{offering.title}</h3>
                        <button onClick={() => handleOpenModal(offering)} className="view-more-button">
                            View More
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal Section */}
            {selectedOffering && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button" onClick={handleCloseModal}>×</button>
                        {/* <img src={selectedOffering.image} alt={selectedOffering.title} className="modal-image" />*/}
                        <h3 className="modal-title">{selectedOffering.title}</h3>
                        <p
                            className="modal-description"
                            dangerouslySetInnerHTML={{ __html: selectedOffering.description }}
                        />
                        <button className="book-session-button" onClick={handleBookClick}>
                            Book a Session
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Offerings;
