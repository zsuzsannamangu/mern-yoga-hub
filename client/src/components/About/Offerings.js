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
        title: "Individual & Group Yoga",
        description: `
        <strong>Slow Gentle Flow:</strong> These classes unite breath and movement in a flowing sequence, building strength and concentration with a mindful pace. Classes weave in pranayama (breathing practices), visualization, and meditation to support a holistic and grounding practice.
	    <br><br><strong>Restorative Yoga:</strong> A deeply restful practice, using supportive postures to help release tension and foster a state of renewal and relaxation.
	    <br><br><strong>Chair, Adaptive & Wheelchair Yoga:</strong> Inclusive classes offering gentle movement and thoughtful modifications.
        <br><br>--------
        <br><br><strong>Individual Sessions:</strong> Personalized one-on-one sessions designed to deepen your connection to yoga through tailored physical postures, breathwork, mindfulness practices, and philosophical insights.
        <br><br>**Individual yoga sessions are $80-$110/hr sliding scale. Your investment is a personal choice, aligning with your current financial circumstances. No questions asked.**
        `,
        image: '/images/yoga/Zsuzsi_Yoga_StandingSplit.jpg',
    },
    {
        id: 2,
        title: "Workshops",
        description: `<strong>Ayurvedic Restorative Yoga Workshop:</strong> Ayurveda, the ancient Indian system of holistic medicine, aligns practices with the rhythms of nature and the changing seasons. This restorative yoga workshop incorporates Ayurvedic principles to support 
        balance during the current season.<br><br><strong>Yoga and Chocolate Infusion Workshop:</strong> A unique blend of mindful restorative yoga, <a href="/chocolates">house-made artisanal chocolate</a>, and a guided meditation on the senses. This practice invites you to 
        explore the sensations of smell, taste, and touch, enhancing sensory awareness and grounding you in 
        the present moment. Gentle movement, meditative music, and rich flavors create a joyful experience to nurture body, mind, and taste buds. <br><br><strong>Mindfulness Practices Workshop:</strong> Explore mindfulness through sensory awareness, subtle body practices, 
        and breathing techniques to enrich daily life. Engage in activities like sensing light, eye gazing, tuning into touch, taste, and smell, and meditations on sound and space. 
        Experience gentle movement, chanting, and breathwork, all while cultivating compassion and loving-kindness to deepen your connection to the present moment.
        `,
        image: '/images/yoga/Zsuzsi_yoga_21.jpg',
    },
    {
        id: 3,
        title: "Yoga Therapy",
        description: `Yoga therapy is an integrative approach that invites balance and harmony across body, mind, and spirit, offering a pathway to support specific health challenges and overall well-being. It embraces each individual’s unique needs and life circumstances, with gentle practices that can bring ease and resilience into daily life.<br><br>
        This therapeutic process can help navigate a range of concerns, from managing anxiety, depression, and trauma to supporting physical conditions like muscle pain, osteoporosis and spinal cord injury. Each session weaves together mindful movement, guided breathwork, and meditative practices to encourage a grounded presence, inviting release and renewal.<br><br>
        As a collaborative journey, yoga therapy provides space to explore tools such as mindful yoga postures, restorative breath exercises, and grounding visualizations. These elements are carefully tailored to support you in nurturing your body’s innate wisdom and ease.<br><br>
        Every session is crafted with consideration of age, health conditions, and personal goals, integrating practices that can be gently woven into the rhythm of daily life. This is not a replacement for traditional medical treatment but a complement, an invitation to cultivate inner balance, self-compassion, and a sustainable path toward wellness.
        <br><br>$10-$80/hr sliding scale, offered until June 2026, while I'm in training. Your investment is a personal choice, aligning with your current financial circumstances. No questions asked. The first 30-minute session is free.`,
        image: '/images/yoga/childs-pose.jpg'
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
