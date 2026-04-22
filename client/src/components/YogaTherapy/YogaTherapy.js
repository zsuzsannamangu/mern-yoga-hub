import { Helmet } from "react-helmet";
import React, { useMemo, useState } from 'react';
// import { Link } from 'react-router-dom';
import './YogaTherapy.scss';
import '../../App.scss';
import { motion } from 'framer-motion';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { seo, SEO_SITE_HOST } from '../../config/seoContent';

/** Plain text for JSON-LD (strips FAQ answers that include HTML links). */
function faqAnswerPlainText(htmlOrText) {
    return htmlOrText.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

const YOGA_THERAPY_OG_IMAGE = `${SEO_SITE_HOST}/images/yoga/Zsuzsi_Home_4.jpg`;

// FAQ data focused on yoga therapy (module scope so structured data stays stable)
const FAQ_DATA = [
        {
            id: 1,
            question: "Do I need to have yoga experience to do yoga therapy?",
            answer: "Not at all. Sessions are designed to meet you where you are."
        },
        {
            id: 2,
            question: "What is trauma-informed yoga?",
            answer: "Trauma-informed yoga is an approach that prioritizes safety, choice, and empowerment. It's designed to create a supportive environment where students can connect with their bodies at their own pace. The focus is on invitation rather than instruction, offering space for each person to decide what feels right for them in the moment."
        },
        {
            id: 3,
            question: "What is yoga therapy?",
            answer: "Yoga therapy may be defined as the application of Yogic principles to a particular person with the objective of achieving a particular spiritual, psychological, or physiological goal. The means employed are comprised of intelligently conceived steps that include but are not limited to the components of Ashtânga Yoga, which includes the educational teachings of yama, niyama, âsana, prânâyâma, pratyâhâra, dhâranâ, dhyâna, and samâdhi. Also included are the application of meditation, textual study, spiritual or psychological counseling, chanting, imagery, prayer, and ritual to meet the needs of the individual. Yoga therapy respects individual differences in age, culture, religion, philosophy, occupation, and mental and physical health. (Definition from the <a href='https://www.iayt.org/about-yoga-therapy' target='_blank' rel='noopener noreferrer'>International Association of Yoga Therapists</a>)"
        },
        {
            id: 4,
            question: "Are sessions in-person or online?",
            answer: "I offer both. You're welcome to join in person in Portland, Oregon, or online via Google Meet. If you're local, I recommend in-person sessions when possible for deeper support."
        },
        {
            id: 5,
            question: "Do you offer hands-on assists or touch during in-person sessions?",
            answer: "Yes, only with consent. I offer gentle, intentional touch and hands-on support when appropriate and always with your clear permission. Touch can be a beautiful tool for grounding, connection, and transformation."
        },
        {
            id: 6,
            question: "What props do I need for online sessions?",
            answer: "If you have yoga props, great! But you can easily use everyday items too: a stack of books for blocks, a firm pillow for a bolster, a belt as a strap, and any cozy blanket you have on hand. I always offer modifications so you can make the most of what you have."
        },
        {
            id: 7,
            question: "Are yoga therapy sessions covered by insurance?",
            answer: "Yoga therapy may be reimbursable through HSA or FSA accounts if recommended by a licensed healthcare provider. Please check with your provider to confirm eligibility."
        },
        {
            id: 8,
            question: "How much are yoga therapy sessions?",
            answer: "Yoga therapy sessions are offered on a sliding scale through June 2026, while I'm in training. Online sessions are $10-$80/hr, and in-person sessions in NW Portland are $20-$100/hr. Your investment is a personal choice, aligning with your current financial circumstances. No questions asked."
        }
];

function YogaTherapy() {
    const [openFAQ, setOpenFAQ] = useState(null);

    const yogaTherapyStructuredData = useMemo(() => {
        const pageUrl = `${SEO_SITE_HOST}/yoga-therapy`;
        return {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'WebPage',
                    '@id': `${pageUrl}#webpage`,
                    url: pageUrl,
                    name: seo.yogaTherapy.title,
                    description: seo.yogaTherapy.description,
                    inLanguage: 'en-US',
                    primaryImageOfPage: {
                        '@type': 'ImageObject',
                        url: YOGA_THERAPY_OG_IMAGE,
                    },
                },
                {
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        {
                            '@type': 'ListItem',
                            position: 1,
                            name: 'Home',
                            item: `${SEO_SITE_HOST}/`,
                        },
                        {
                            '@type': 'ListItem',
                            position: 2,
                            name: 'Yoga Therapy',
                            item: pageUrl,
                        },
                    ],
                },
                {
                    '@type': 'FAQPage',
                    mainEntity: FAQ_DATA.map(({ question, answer }) => ({
                        '@type': 'Question',
                        name: question,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: faqAnswerPlainText(answer),
                        },
                    })),
                },
            ],
        };
    }, []);

    const toggleFAQ = (id) => {
        setOpenFAQ(openFAQ === id ? null : id);
    };

    //Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
        transition: { duration: 1 }
    };

    return (
        <div className='yoga-therapy-page'>
            <Helmet>
                <title>{seo.yogaTherapy.title}</title>
                <meta name="description" content={seo.yogaTherapy.description} />
                <meta property="og:title" content={seo.yogaTherapy.title} />
                <meta property="og:description" content={seo.yogaTherapy.description} />
                <meta property="og:image" content={YOGA_THERAPY_OG_IMAGE} />
                <meta property="og:image:alt" content="Yoga therapy — personalized sessions in Portland and online" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seo.yogaTherapy.title} />
                <meta name="twitter:description" content={seo.yogaTherapy.description} />
                <meta name="twitter:image" content={YOGA_THERAPY_OG_IMAGE} />
                <script type="application/ld+json">{JSON.stringify(yogaTherapyStructuredData)}</script>
            </Helmet>

            <motion.div
                className='yoga-therapy-top'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <div className="yoga-therapy-overlay">
                    <div className="yoga-therapy-overlay-text">
                        <h1>Yoga Therapy in Portland &amp; Online</h1>
                        <p className="yoga-therapy-hero-tagline">
                            One-on-one sessions integrating breathwork, somatic movement, and gentle, adaptive practices to support anxiety, depression and chronic pain. Sessions also draw on functional movement, hypermobility-aware strengthening, and accessible approaches (including chair and wheelchair yoga).
                        </p>
                        {/* Chronic pain hero CTA — re-enable when ready (needs Link import from react-router-dom)
                        <p className="yoga-therapy-pain-cta">
                            <Link to="/chronic-pain-help" className="yoga-therapy-pain-cta__link">
                                Looking for help with chronic pain? Start here <span className="yoga-therapy-pain-cta__arrow" aria-hidden="true">
                                    →
                                </span>
                            </Link>
                        </p>
                        */}
                    </div>
                </div>
            </motion.div>

            <div className="three-sections-yoga-therapy">
                {/* WHAT IS YOGA THERAPY SECTION */}
                <div className="yoga-therapy-info-section">
                    <motion.div
                        className="yoga-therapy-flex-section"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <div className="yoga-therapy-info-text">
                            <motion.h2 className="section-title" variants={fadeInUp}>What is Yoga Therapy?</motion.h2>
                            <div className="title-line"></div>
                            <p>
                                Yoga therapy is a personalized, holistic approach that supports physical, emotional, and mental well-being. 
                                It combines breath, movement, psychology, neurobiology, mindfulness, and somatic practices to address specific concerns or conditions.
                            </p>
                            <p>
                                <strong>What makes yoga therapy different?</strong> Unlike general yoga classes, yoga therapy sessions are tailored to your individual needs, creating space for 
                                healing, resilience, and greater self-awareness. Sessions are designed to meet you where you are.
                            </p>
                            <p>
                                <strong>What to expect:</strong> Each session brings together mindful movement, guided breathwork, meditation, and nervous system support. 
                                Practices are designed to be integrated into your daily life.
                            </p>
                            <p>
                                To book a session, please <a href="/register" className="register-link">create an account</a>. Once registered, you'll see available sessions.
                            </p>
                        </div>
                        <div className="yoga-therapy-info-image">
                            <img src="/images/yoga/Zsuzsi_Home_4.jpg" alt="Yoga therapy practice" />
                        </div>
                    </motion.div>
                </div>

                {/* MY APPROACH & SESSIONS SECTION */}
                <div className="yoga-therapy-info-section">
                    <motion.div
                        className="yoga-therapy-flex-section reverse"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <div className="yoga-therapy-info-text">
                            <motion.h2 className="section-title" variants={fadeInUp}>My Approach</motion.h2>
                            <div className="title-line"></div>
                            <p>
                                My approach to yoga therapy is rooted in presence and compassion. I offer trauma-informed and adaptive 
                                practices that meet you where you are. I combine breath science, somatic 
                                awareness, and yoga psychology to support your body and nervous system.
                            </p>
                            <p>
                                Yoga therapy sessions are personalized, one-on-one experiences designed to support your unique journey.
                                Sessions are about discovering what it means to be in your body, right now, with curiosity and kindness.
                            </p>
                            <ul className="custom-bullet-list">
                                <li>Trauma-informed and neurobiologically grounded approaches</li>
                                <li>Adaptive and accessible: chair and gentle floor options</li>
                                <li>One-on-one settings for deeper connection and personalized attention</li>
                                <li>Inclusive of all bodies, abilities, and backgrounds</li>
                                <li>Integration of practices into daily life</li>
                            </ul>
                        </div>
                        <div className="yoga-therapy-info-image">
                            <img src="/images/yoga/Zsuzsi_Home_111.jpg" alt="Yoga therapy practice" />
                        </div>
                    </motion.div>
                </div>

                {/* WHO I WORK WITH SECTION */}
                <div className="yoga-therapy-info-section">
                    <motion.div
                        className="yoga-therapy-flex-section"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <div className="yoga-therapy-info-text">
                            <motion.h2 className="section-title" variants={fadeInUp}>
                                Who I Work With in Yoga Therapy
                            </motion.h2>
                            <div className="title-line"></div>
                            <p>
                                These sessions are open to all, regardless of experience, background, or physical ability.
                                I always strive to create a supportive, welcoming environment for everyone. While all are welcome, I specialize in supporting:
                            </p>
                            <ul className="custom-bullet-list">
                                <li>Teens and adults in addiction recovery</li>
                                <li>People navigating postpartum</li>
                                <li>Wheelchair users and those with spinal cord injuries</li>
                                <li>Stay-at-home caregivers navigating identity shifts, overwhelm, and emotional labor</li>
                                <li>Immigrants and those navigating cultural displacement or loss (as an immigrant myself)</li>
                                <li>Anyone seeking personalized support for physical, emotional, or mental well-being</li>
                            </ul>
                        </div>

                        <div className="yoga-therapy-info-image">
                            <img src="/images/yoga/Zsuzsi_chair.jpg" alt="Yoga therapy practice" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Pricing Section */}
            <motion.div
                className="yoga-therapy-info-section pricing-booking-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>Pricing & Booking</motion.h2>
                <div className="title-line"></div>
                <div className="info-category">
                    <motion.div className="info-item" variants={fadeInUp}>
                        <p>
                            <strong>Yoga Therapy Sessions:</strong> Sliding scale pricing (offered until June 2026, while I'm in training).
                        </p>
                        <ul className="custom-bullet-list">
                            <li><strong>Online sessions:</strong> $10-$80/hr sliding scale</li>
                            <li><strong>In-person sessions (NW Portland):</strong> $20-$100/hr sliding scale</li>
                        </ul>
                        <p>
                            Your investment is a personal choice, aligning with your current financial circumstances. No questions asked.
                        </p>
                        <p>
                            <strong>Committing to at least 8 weeks of yoga therapy</strong> gives us time to build trust, personalize your practice, 
                            and support meaningful, lasting change in body, mind, and nervous system.
                        </p>
                        <p>
                            Sessions are available in-person in NW Portland, Oregon, or online via Google Meet.
                        </p>
                        <p>
                            To book a session, please <a href="/register">create an account</a>. Once registered, you'll see available sessions.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
                className="yoga-therapy-info-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>Frequently Asked Questions</motion.h2>
                <div className="title-line"></div>
                <div className="faq-accordion">
                    {FAQ_DATA.map((faq) => (
                        <motion.div key={faq.id} className="faq-item" variants={fadeInUp}>
                            <button
                                className={`faq-question ${openFAQ === faq.id ? 'open' : ''}`}
                                onClick={() => toggleFAQ(faq.id)}
                                aria-expanded={openFAQ === faq.id}
                                aria-controls={`faq-answer-${faq.id}`}
                            >
                                <span>{faq.question}</span>
                                {openFAQ === faq.id ?
                                    <FaChevronUp className="faq-icon" aria-hidden="true" /> :
                                    <FaChevronDown className="faq-icon" aria-hidden="true" />
                                }
                            </button>
                            <motion.div
                                id={`faq-answer-${faq.id}`}
                                className={`faq-answer ${openFAQ === faq.id ? 'open' : ''}`}
                                initial={false}
                                animate={{
                                    height: openFAQ === faq.id ? 'auto' : 0,
                                    opacity: openFAQ === faq.id ? 1 : 0
                                }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                <div className="faq-answer-content">
                                    <p>{faq.answer}</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Trainings Section */}
            <motion.div
                className="yoga-therapy-info-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>Training & Credentials</motion.h2>
                <div className="title-line"></div>
                <div className="info-category">
                    <motion.h3 variants={fadeInUp}>Yoga Therapy Training</motion.h3>
                    <div className="info-item">
                        <h4>800hr Integrative Yoga Therapy Training</h4>
                        <h4>Accredited with IAYT</h4>
                        <p><em><a href="https://www.sarahjoyyoga.com/800-hour-yoga-therapy-training-curriculum-dates.html" target='_blank' rel="noopener noreferrer">Institute for Living Yoga, Portland OR</a></em><br />
                            June 2025 - exp. June 2026</p>
                        <p>The Science of the Breath and the Art of Yoga Therapy; Internal Family Systems Model;<br />
                            Chronic Pain and Brain-Based Approaches to Yoga Therapy; Yoga and Expressive Arts Therapy;<br />
                            Endocrine, Digestive and Immune Health; Attachment Theory and Implicit Memory in Yoga Therapy;<br />
                            Yoga for Cancer; Yoga, Biofeedback + Mind-Body Medicine; Kriya Yoga Model for Addiction Recovery.</p>
                    </div>
                </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
                className="yoga-therapy-info-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>Ready to Begin?</motion.h2>
                <div className="title-line"></div>
                <div className="cta-links">
                    <a href="/register" className="cta-button outline">
                        Book a Yoga Therapy Session
                    </a>
                    <a href="/yoga" className="cta-button">
                        View Group Classes
                    </a>
                </div>
            </motion.div>
        </div>
    );
}

export default YogaTherapy;
