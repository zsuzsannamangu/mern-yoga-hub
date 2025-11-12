import { Helmet } from "react-helmet";
import React, { useEffect, useRef, useState } from 'react';
//useEffect() is a React Hook that lets you perform side effects in function components, instead of class components. useRef is a React Hook that allows you to create a mutable reference to a DOM element.
import { useLocation } from 'react-router-dom'; //useLocation is a hook provided by React Router that gives access to the current URL's location object.
import './About.scss';
import Offerings from './Offerings';
import '../../App.scss';
import { motion } from 'framer-motion';
import Slideshow from './Slideshow';
import { FaCalendarAlt, FaExternalLinkAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

function About() {
    const location = useLocation(); // React Router hook to access current location (current URL, such as the path or query parameters)
    const classDescriptionsRef = useRef(null); // Reference for the "Class Descriptions" section to enable scrolling.
    const [openFAQ, setOpenFAQ] = useState(null); // State for managing which FAQ item is open

    // FAQ data
    const faqData = [
        {
            id: 1,
            question: "Do I need to have yoga experience to do yoga therapy?",
            answer: "Not at all. Sessions are designed to meet you exactly where you are."
        },
        {
            id: 2,
            question: "What is trauma-informed yoga?",
            answer: "Trauma-informed yoga is an approach that prioritizes safety, choice, and empowerment. It's designed to create a supportive environment where students can connect with their bodies at their own pace. The focus is on invitation rather than instruction, offering space for each person to decide what feels right for them in the moment."
        },
        {
            id: 3,
            question: "What is yoga therapy?",
            answer: "Yoga therapy is a personalized, holistic approach that supports physical, emotional, and mental well-being. It combines breath, movement, psychology, neurobiology, mindfulness, somatic practices and the ancient wisdom of yoga to address specific concerns or conditions. Sessions are tailored to the individual, creating space for healing, resilience, and greater self-awareness."
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
            question: "How much are individual sessions?",
            answer: "Private yoga therapy sessions are $10-$80 sliding scale through June 2026, while I'm in training. Individual yoga sessions are $80-$110 sliding scale."
        }
    ];

    const toggleFAQ = (id) => {
        setOpenFAQ(openFAQ === id ? null : id);
    };

    //Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
        transition: { duration: 1 }
    };


    // Scroll to the "Class Descriptions" section if the URL contains the appropriate query parameter.
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const section = params.get('section');

        if (section === 'classDescriptions' && classDescriptionsRef.current) {
            classDescriptionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [location]); //'location' is a dependency, the dependencies array is an array of variables that the effect depends on. [location] ensures the effect runs only when the location object changes.

    return (
        <div className='about-page'>
            <Helmet>
                <title>Yoga with Zsuzsanna | Accessible, Therapeutic, Trauma-Informed Yoga</title>
                <meta name="description" content="Explore yoga therapy and accessible, trauma-informed yoga with Zsuzsanna, offering slow flow, restorative, chair, and wheelchair yoga in Portland and online." />
                <link rel="canonical" href="https://www.yogaandchocolate.com/yoga" />
            </Helmet>

            {/* Workshop Announcement Bar */}
            <div className="workshop-announcement">
                <div className="announcement-content">
                    <span className="announcement-text">
                        🍫✨ <strong>Awaken the Senses Workshop:</strong> Restorative Yoga + Handcrafted Chocolate + Chakra Exploration
                    </span>
                    <a href="/yoga?section=classDescriptions" className="announcement-link">
                        View Dates
                    </a>
                </div>
            </div>

            <motion.div
                className='about-top'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <div className="about-overlay">
                    <div className="about-overlay-text">
                        <h1>Yoga with Zsuzsanna</h1>
                        <p>I'm Zsuzsanna, a yoga teacher and yoga therapist, here to support you in finding alignment between body and mind.</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <Offerings />
            </motion.div>

            <div className="three-sections-about-yoga">
                {/* MY APPROACH SECTION WITH IMAGE */}
                <div className="about-info-section">
                    <motion.div
                        className="about-flex-section"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <div className="about-info-text">
                            <motion.h2 className="section-title" variants={fadeInUp}>My approach</motion.h2>
                            <div className="title-line"></div>
                            <p>
                                I offer weekly group classes and private 1:1 sessions in both general yoga and yoga therapy.
                                Group classes follow a consistent theme and are open to all levels.
                                Private sessions are tailored to your personal needs, whether physical, emotional, or spiritual.
                            </p>
                            <p>
                                My approach to yoga is rooted in presence and compassion.
                                I offer trauma-informed and adaptive practices that meet you where you are. As an aspiring yoga therapist,
                                I combine breath science, somatic awareness, and yoga psychology to support nervous system regulation, emotional resilience, and healing.
                            </p>
                            <p>Sessions are about discovering what it means to be in your body, right now, with curiosity and kindness.</p>
                        </div>
                        <div className="about-info-image">
                            <img src="/images/yoga/Zsuzsi_Home_4.jpg" alt="Zsuzsanna doing yoga next to river" />
                        </div>
                    </motion.div>
                </div>

                {/* MY SESSIONS ARE SECTION WITH IMAGE (reverse layout) */}
                <div className="about-info-section">
                    <motion.div
                        className="about-flex-section reverse"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <div className="about-info-text">
                            <motion.h2 className="section-title" variants={fadeInUp}>My sessions are</motion.h2>
                            <div className="title-line"></div>
                            <ul className="custom-bullet-list">
                                <li>Trauma-informed and neurobiologically grounded</li>
                                <li>Adaptive and accessible: chair and gentle floor options</li>
                                <li>Rooted in yoga therapy principles and somatic movement</li>
                                <li>Small-group or one-on-one settings for deeper connection</li>
                                <li>Inclusive of all bodies, abilities, and backgrounds</li>
                                <li>Practices designed to support the nervous system and emotional health</li>
                            </ul>
                        </div>
                        <div className="about-info-image">
                            <img src="/images/yoga/Zsuzsi_Home_111.jpg" alt="Zsuzsanna doing extended side angle pose with full bind next to the river" />
                        </div>
                    </motion.div>
                </div>

                <div className="about-info-section">
                    <motion.div
                        className="about-flex-section"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        <div className="about-info-text">
                            <motion.h2 className="section-title" variants={fadeInUp}>
                                Who I Work With
                            </motion.h2>
                            <div className="title-line"></div>
                            <p>
                                I offer one-on-one sessions in yoga and yoga therapy.
                            </p>
                            <p>
                                These sessions are open to all, regardless of experience, background, or physical ability.
                                I always strive to create a supportive, welcoming environment for everyone. While all are welcome, I specialize in supporting:
                            </p>
                            <ul className="custom-bullet-list">
                                <li>Teens and adults in addiction recovery</li>
                                <li>People navigating postpartum</li>
                                <li>Wheelchair users and those with spinal cord injuries</li>
                                <li>Stay-at-home caregivers navigating identity shifts, overwhelm, and emotional labor</li>
                                <li>Immigrants and those navigating cultural displacement or loss</li>
                                <li>Everyone!</li>
                            </ul>
                        </div>

                        <div className="about-info-image">
                            <img src="/images/yoga/Zsuzsi_chair.jpg" alt="Zsuzsanna doing chair yoga" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Class Descriptions Section */}
            <motion.div
                className="about-info-section"
                ref={classDescriptionsRef}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>Classes and Workshops</motion.h2>
                <div className="title-line"></div>
                <div className="info-category">
                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Awaken the Senses: Restorative Yoga, Handcrafted Chocolate and an Exploration of the Chakras</h4>
                        <p>
                            An immersive couple hours of restorative yoga, meditation, and sensory exploration.
                        </p>

                        <p>
                            This workshop brings together yoga and handmade chocolate to awaken presence, deepen awareness, and open the senses.
                            Yoga invites us to slow down and reconnect with the body. Chocolate, when made with attention and enjoyed mindfully,
                            becomes a pathway to taste, texture, and energy that can amplify this inner journey. Together, they create a space where movement, stillness, and sensory experience meet.
                        </p>

                        <p>
                            As both a chocolatier and yoga teacher, I bring these worlds together with intention. Since 2020, I have been making small-batch,
                            80% dark chocolate with organic cacao, maple sugar, vanilla, Oregon sea salt and botanicals. Each bar is made fresh, infused with edible
                            flowers, fruits, and spices. The chocolates we'll taste in this workshop are created specifically to reflect the body's energetic centers, the chakras:
                        </p>

                        <div className="chakra-chocolate-info">
                            <div className="chakra-image">
                                <img src="/images/chocolates/Chocolate_1.jpg" alt="Handcrafted chocolate bars" />
                            </div>

                            <div className="chakra-list">
                                <p><strong>Root (1st) + Heart (4th):</strong> Cacao nibs, ashwagandha, saffron and rose petals. This blend brings earth + heart harmony: grounding your roots while softening and expanding the heart.</p>

                                <p><strong>Sacral (2nd) + Throat (5th):</strong> Chamomile and lavender. A powerful combination that invites you to speak your truth with softness and nurture creative flow.</p>

                                <p><strong>Solar Plexus (3rd) + Third Eye (6th):</strong> Orange, orange peel, calendula, and blue lotus flower. This blend brings confidence + clarity: energizing your inner fire while opening your perception to insight.</p>
                            </div>
                        </div>

                        <p>
                            Throughout this workshop, you'll be guided through restorative yoga and meditation practices that prepare the body and mind to fully experience these flavors.
                            Together, we'll explore the chakras, the body's energetic centers that connect our physical, emotional, and spiritual selves, through both movement and mindful tasting.
                        </p>

                        <p>
                            By slowing down and engaging the senses, this workshop offers a grounding practice that brings balance, nourishes the spirit, and awakens deeper awareness.
                        </p>

                        <div className="workshop-dates-section">
                            <h5>Upcoming Dates</h5>
                            <div className="workshop-dates-grid">
                                <div className="workshop-date-card">
                                    <div className="date-header">
                                        <FaCalendarAlt className="date-icon" aria-hidden="true" />
                                        <div className="date-info">
                                            <div className="date-text">November 8</div>
                                            <div className="time-text">11:00 AM - 1:00 PM</div>
                                        </div>
                                    </div>
                                    <div className="location-text">
                                        <FaExternalLinkAlt className="register-icon" aria-hidden="true" />
                                        <a href="https://fullbodiedyoga.union.site/performances/3walcxsp" target="_blank" rel="noopener noreferrer" aria-label="Register for workshop on November 8 at Full Bodied Yoga, 11:00 AM to 1:00 PM">Full Bodied Yoga</a>
                                    </div>
                                    <div className="chakra-focus">
                                        <strong>Focus:</strong> Solar Plexus (3rd) + Third Eye (6th) Chakras
                                    </div>
                                </div>

                                <div className="workshop-date-card">
                                    <div className="date-header">
                                        <FaCalendarAlt className="date-icon" aria-hidden="true" />
                                        <div className="date-info">
                                            <div className="date-text">November 22</div>
                                            <div className="time-text">2:00 PM - 4:00 PM</div>
                                        </div>
                                    </div>
                                    <div className="location-text">
                                        <FaExternalLinkAlt className="register-icon" aria-hidden="true" />
                                        <a href="https://www.yogarefugepdx.com/workshops-and-events?mobile=false&options%5Bids%5D=1466&options%5Bsite_id%5D=140907&version=0" target="_blank" rel="noopener noreferrer" aria-label="Register for workshop on November 22 at Yoga Refuge NW, 2:00 PM to 4:00 PM, focusing on Root and Heart Chakras">Yoga Refuge NW</a>
                                    </div>
                                    <div className="chakra-focus">
                                        <strong>Focus:</strong> Root (1st) + Heart (4th) Chakras
                                    </div>
                                </div>

                                <div className="workshop-date-card">
                                    <div className="date-header">
                                        <FaCalendarAlt className="date-icon" aria-hidden="true" />
                                        <div className="date-info">
                                            <div className="date-text">November 23</div>
                                            <div className="time-text">2:00 PM - 4:00 PM</div>
                                        </div>
                                    </div>
                                    <div className="location-text">
                                        <FaExternalLinkAlt className="register-icon" aria-hidden="true" />
                                        <a href="https://www.thebymc.com/post/awaken-the-senses-where-artisanal-chocolate-and-restorative-yoga-meet" target="_blank" rel="noopener noreferrer" aria-label="Register for workshop on November 23 at The Bhakti Yoga Movement Center, 2:00 PM to 4:00 PM, focusing on Sacral and Throat Chakras">The Bhakti Yoga Movement Center</a>
                                    </div>
                                    <div className="chakra-focus">
                                        <strong>Focus:</strong> Sacral (2nd) + Throat (5th) Chakras
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Regular Classes Section */}
                    <motion.h3 className="classes-subtitle" variants={fadeInUp}>Regular Classes</motion.h3>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Yoga for Wheelchair Users</h4>
                        <p className="class-schedule">Every other Saturday 6-7pm at The People's Yoga NE, Studio 3 - entrance on 30th · <a href="/calendar">Sign up</a></p>
                        <div className="wheelchair-yoga-content">
                            <div className="wheelchair-yoga-text">
                                <p>A yoga practice tailored for individuals who use wheelchairs, focusing on enhancing well-being through breath, gentle movement, and mindfulness.

                                    Through guided breathwork, we'll cultivate a sense of calm, helping to lower stress, improve circulation, and support respiratory health. Gentle
                                    movements are designed to improve flexibility, build strength, and enhance range of motion, all while remaining seated.

                                    Mindfulness and meditation will be woven into the practice to foster mental clarity, emotional resilience, and a deeper connection to your body.
                                    All levels are welcome, and no prior experience is needed. Props will be offered.</p>
                            </div>
                            <div className="wheelchair-yoga-image">
                                <img src="/images/yoga/wheelchairyoga.png" alt="Wheelchair yoga practice" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Hatha Yoga</h4>
                        <p className="class-schedule">Mondays 9:30-10:30am at <a href="https://www.dearyogastudio.com/schedule" target="_blank" rel="noopener noreferrer">Dear Yoga</a></p>
                        <p>A grounding practice that blends breath awareness with intentional movement. Hatha Yoga emphasizes steady postures and transitions, creating space for balance,
                            strength, and inner stillness. This class is slower-paced than vinyasa, offering time to explore alignment and deepen into each pose. Ideal for those seeking a
                            more meditative, breath-centered experience. Modifications and props are welcome.
                        </p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Grounded Alignment</h4>
                        <p className="class-schedule">Mondays 12:15-1:15pm at <a href="https://fullbodiedyoga.union.site/" target="_blank" rel="noopener noreferrer">Full Bodied Yoga</a> (also available livestream)</p>
                        <p>Grounded Alignment is a Hatha-inspired yoga class designed to help all bodies move mindfully and confidently. Led by experienced instructors who honor body diversity, this class offers personalized techniques tailored to your needs. You'll build strength, find balance, and embrace your unique capabilities, leaving you grounded both on and off the mat.</p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Postpartum Yoga</h4>
                        <p className="class-schedule">Thursdays 10:30am-11:30am at <a href="https://www.thebymc.com/classes" target="_blank" rel="noopener noreferrer">The Bhakti Yoga Movement Center</a></p>
                        <p>This postpartum yoga class aims to help you regain core strength, relieve pelvic floor imbalances, ease neck and back tension and be in community. Pre-crawling babies welcome to attend!  This class is designed for new parents 4 weeks - 6 months postpartum, but may be helpful for anyone with diastasis recti (abdominal muscle separation) or pelvic floor issues
                            regardless of childbirth. This is a wonderful place to tend to your body and spirit, and be in community with others on the postpartum journey. No prior yoga experience necessary.</p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Restorative Yoga</h4>
                        <p className="class-schedule">Thursdays 7:30-8:45pm at <a href="https://www.yogarefugepdx.com/class-schedule" target="_blank" rel="noopener noreferrer">Yoga Refuge, NW location</a></p>
                        <p>A deeply relaxing class designed to soothe the nervous system and restore balance. Using props to support the body in restful poses, this
                            practice encourages deep release and stillness. Perfect for stress relief, recovery, and cultivating a sense of inner calm.
                        </p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Morning Flow</h4>
                        <p className="class-schedule">Fridays 7am-8am at <a href="https://www.yogarefugepdx.com/class-schedule" target="_blank" rel="noopener noreferrer">Yoga Refuge, NW location</a> (also available livestream)</p>
                        <p>Start your day with an energizing flow that awakens the body and centers the mind. This mindful practice combines breath-synchronized movement with intentional transitions, building strength and flexibility while cultivating presence. Perfect for setting a grounded, positive tone for your day.</p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Vinyasa Flow</h4>
                        <p className="class-schedule">Fridays 4pm-5pm at <a href="https://www.yogarefugepdx.com/class-schedule" target="_blank" rel="noopener noreferrer">Yoga Refuge, NW location</a> (also available livestream)</p>
                        <p>Vinyasa Flow builds strength, flexibility, and focus through creative sequences and mindful transitions. Expect to move, breathe,
                            and sweat while cultivating presence and resilience. Options will be offered to support a variety of experience levels.
                        </p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Slow Flow</h4>
                        <p>This class focuses on mindful movement, allowing you to ease into each posture with intention and awareness.
                            Through gentle flows, we'll explore balance and strength at a pace that honors your body.
                            This practice is inclusive and adaptive, offering a welcoming space for all levels, whether you're new to yoga or looking to refine your practice.</p>
                    </motion.div>

                    {/* Additional Classes Note */}
                    <motion.div className="info-item additional-classes-note" variants={fadeInUp}>
                        <p><em>I also sub at The People's Yoga and Firelight Yoga. For a complete schedule of all classes, including substitute classes and special events, please check the <a href="/calendar">calendar</a>.</em></p>
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                className="about-info-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>Frequently Asked Questions</motion.h2>
                <div className="title-line"></div>
                <div className="faq-accordion">
                    {faqData.map((faq) => (
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
                className="about-info-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>Trainings</motion.h2>
                <div className="title-line"></div>
                <div className="info-category">
                    <motion.h3 variants={fadeInUp}>Core Yoga Teacher Trainings</motion.h3>
                    <div className="info-item">
                        <h4>800hr Integrative Yoga Therapy Training</h4>
                        <h4>Accredited with IAYT</h4>
                        <p><em><a href="https://www.sarahjoyyoga.com/800-hour-yoga-therapy-training-curriculum-dates.html" target='_blank'>Institute for Living Yoga, Portland OR</a></em><br />
                            June 2025 - exp. June 2026</p>
                        <p>The Science of the Breath and the Art of Yoga Therapy; Internal Family Systems Model;<br />
                            Chronic Pain and Brain-Based Approaches to Yoga Therapy; Yoga and Expressive Arts Therapy;<br />
                            Endocrine, Digestive and Immune Health; Attachment Theory and Implicit Memory in Yoga Therapy;<br />
                            Yoga for Cancer; Yoga, Biofeedback + Mind-Body Medicine; Kriya Yoga Model for Addiction Recovery.</p>
                    </div>
                    <div className="info-item">
                        <h4>300hr Advanced Yoga Teacher Training</h4>
                        <h4>(RYT-500)</h4>
                        <p><em>Sarahjoy Yoga, Portland OR</em><br />
                            May 2024 - February 2025</p>
                        <p>Trauma-informed, neurobiologically grounded teacher training with <strong><a href="https://www.sarahjoyyoga.com/300-hour-advanced-yoga-teacher-training.html" target='_blank'>Sarahjoy Marsh</a></strong><br />
                            Restorative Yoga, Slow Flow, Chair Yoga, Adaptive Yoga, Pranayama<br />
                            Focus on neuroscience, mindfulness, psychology, physiology, and ayurvedic practices</p>
                    </div>
                    <div className="info-item">
                        <h4>300hr Foundational Yoga Teacher Training</h4>
                        <p><em>The People’s Yoga, Portland OR</em><br />
                            October 2023 - April 2024</p>
                        <p>Treasures of Engagement with <strong><a href="https://www.suniti.net/" target='_blank'>Suniti Dernovsek</a></strong><br />
                            Hatha Yoga, Vinyasa Yoga, Restorative Yoga<br />
                            Focus on somatic practices such as Body-Mind Centering and the Alexander Technique</p>
                    </div>
                </div>
                <div className="info-category">
                    <h3>Other Yoga Trainings</h3>
                    <div className="info-item">
                        <h4>20hr "Postpartum Yoga" Teacher Training</h4>
                        <p><em>with <strong><a href="https://www.awakenedspirityoga.com/product/postnatal-yoga-teacher-training-virtual/" target='_blank'>Julia Forest</a></strong>, online</em><br />
                            October, 2025</p>
                    </div>
                    <div className="info-item">
                        <h4>10hr "Yoga for Disabled Folks" Training</h4>
                        <p><em>with <strong><a href="https://www.allihopayoga.com/about" target='_blank'>Rodrigo Souza</a></strong>, live via Accessible Yoga</em><br />
                            December 9-19, 2024</p>
                        <p>Accessible & adaptive practices for those with limited mobility & wheelchair users</p>
                    </div>
                    <div className="info-item">
                        <h4>50hr "Yoga Anatomy and Physiology" Training</h4>
                        <p><em>with <strong><a href="https://joemilleryoga.com/" target='_blank'>Joe Miller</a></strong>, online</em><br />
                            November 2024</p>
                        <p>Applying anatomy to yoga practice and teachings, using anatomical terminology.</p>
                    </div>
                    <div className="info-item">
                        <h4>8hr Kids Yoga Teacher Training</h4>
                        <p><em>with Leslie Wilda, <strong><a href="https://www.yogaplaygrounds.com/" target='_blank'>Yoga Playgrounds</a></strong>, in-person in Portland, OR</em><br />
                            August 2024</p>
                        <p>Teaching yoga and mindfulness for kids ages 3-12.<br />
                            Yoga games, breathing exercises, visualizations, mindfulness activities and relaxation techniques.</p>
                    </div>
                </div>
                <div className="info-category">
                    <h3>Other Programs</h3>
                    <div className="info-item">
                        <h4>Master of Arts in International Studies</h4>
                        <p><em> <strong><a href="https://www.nccu.edu.tw/index.php?Lang=en" target='_blank'>National Chengchi University</a></strong>, Taipei, Taiwan</em><br />
                            2009-2011</p>
                        <p>Full scholarship recipient of the Ministry of Education, Taiwan</p>
                    </div>
                    <div className="info-item">
                        <h4>Bachelor of Arts in International Studies</h4>
                        <p><em> <strong><a href="https://english.nye.hu/" target='_blank'>University of Nyíregyháza</a></strong>, Nyíregyháza, Hungary</em><br />
                            2003-2007</p>
                        <p>Scholarship recipient of the Ministry of Education, Hungary</p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="about-info-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>Ready to Begin?</motion.h2>
                <div className="title-line"></div>
                <div className="cta-links">
                    <a href="/register" className="cta-button outline">
                        Book a private session
                    </a>
                    <a href="/calendar" className="cta-button">
                        Sign up for group classes
                    </a>
                </div>
            </motion.div>

            <Slideshow />
        </div >
    );
}

export default About;
