import { Helmet } from "react-helmet";
import React, { useEffect, useRef, useState } from 'react';
//useEffect() is a React Hook that lets you perform side effects in function components, instead of class components. useRef is a React Hook that allows you to create a mutable reference to a DOM element.
import { useLocation } from 'react-router-dom'; //useLocation is a hook provided by React Router that gives access to the current URL's location object.
import './About.scss';
import '../../App.scss';
import { motion } from 'framer-motion';
import Slideshow from './Slideshow';
import { FaCalendarAlt, FaExternalLinkAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

function About() {
    const location = useLocation(); // React Router hook to access current location (current URL, such as the path or query parameters)
    const classDescriptionsRef = useRef(null); // Reference for the "Class Descriptions" section to enable scrolling.
    const [openFAQ, setOpenFAQ] = useState(null); // State for managing which FAQ item is open

    // FAQ data focused on general yoga classes
    const faqData = [
        {
            id: 1,
            question: "Do I need yoga experience to attend classes?",
            answer: "Not at all! All classes are open to all levels, including complete beginners. I offer modifications and options for every pose."
        },
        {
            id: 2,
            question: "What is trauma-informed yoga?",
            answer: "Trauma-informed yoga is an approach that prioritizes safety, choice, and empowerment. It's designed to create a supportive environment where students can connect with their bodies at their own pace. The focus is on invitation rather than instruction, offering space for each person to decide what feels right for them in the moment."
        },
        {
            id: 3,
            question: "What types of classes do you offer?",
            answer: "I offer a variety of classes including Hatha Yoga, Vinyasa Flow, Slow Flow, Restorative Yoga, Postpartum Yoga, and Wheelchair & Adaptive Yoga. I also teach workshops combining yoga with chocolate tasting and chakra exploration."
        },
        {
            id: 4,
            question: "Are classes in-person or online?",
            answer: "Most group classes are in-person at various studios throughout Portland, Oregon. Some classes are also available via livestream. Check the class schedule for details."
        },
        {
            id: 5,
            question: "How much are private yoga sessions?",
            answer: "Private yoga sessions are $80-$110/hr sliding scale. Your investment is a personal choice, aligning with your current financial circumstances. No questions asked."
        },
        {
            id: 6,
            question: "What props do I need for classes?",
            answer: "Most studios provide props. If you're practicing at home, you can use everyday items: a stack of books for blocks, a firm pillow for a bolster, a belt as a strap, and any cozy blanket. I always offer modifications so you can make the most of what you have."
        },
        {
            id: 7,
            question: "Do you offer yoga therapy?",
            answer: "Yes! I offer yoga therapy sessions which are different from general yoga classes. Yoga therapy is a personalized, holistic approach tailored to individual needs. <a href='/yoga-therapy'>Learn more about yoga therapy here</a>."
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
                <title>Yoga Classes with Zsuzsanna | Group Classes, Workshops & Private Sessions</title>
                <meta name="description" content="Explore group yoga classes, workshops, and private sessions with Zsuzsanna, offering slow flow, restorative, chair, and wheelchair yoga in Portland and online." />
                <link rel="canonical" href="https://www.yogaandchocolate.com/yoga" />
            </Helmet>

            {/* Workshop Announcement Bar */}
            <div className="workshop-announcement newyear-announcement">
                <div className="announcement-content">
                    <span className="announcement-text">
                        ✨ <strong>New Year's Day Workshop: New Year's Day Practice and Intention Setting</strong>
                    </span>
                    <a href="/yoga?section=classDescriptions" className="announcement-link">
                        View Workshops
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
                        <h1>Yoga Classes & Workshops</h1>
                        <p>I'm Zsuzsanna, a yoga teacher offering group classes, workshops, and private sessions to support you in finding alignment between body and mind.</p>
                    </div>
                </div>
            </motion.div>

            {/* My Classes & Sessions Section */}
            <motion.div
                className="about-info-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>My Classes</motion.h2>
                <div className="title-line"></div>
                <div className="info-category">
                    <motion.div className="info-item" variants={fadeInUp}>
                        <ul className="custom-bullet-list">
                            <li>Trauma-informed and accessible practices</li>
                            <li>Adaptive options: chair and gentle floor variations</li>
                            <li>Breath-centered movement and mindfulness</li>
                            <li>Small-group classes and one-on-one private sessions</li>
                            <li>Inclusive of all bodies, abilities, and backgrounds</li>
                            <li>Support for nervous system regulation and emotional well-being</li>
                            <li>Classes that welcome beginners and challenge experienced practitioners</li>
                        </ul>
                    </motion.div>
                </div>
            </motion.div>

            {/* Private Yoga Section */}
            <motion.div
                className="about-info-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>Private Yoga Sessions</motion.h2>
                <div className="title-line"></div>
                <div className="info-category">
                    <motion.div className="info-item" variants={fadeInUp}>
                        <p>
                            <strong>Individual Yoga Sessions:</strong> Personalized one-on-one sessions designed to meet your unique needs. These sessions offer tailored practices including physical postures, breathwork, meditation, and yoga philosophy.
                        </p>
                        <p>
                            Private sessions are ideal for:
                        </p>
                        <ul className="custom-bullet-list">
                            <li>Building a personal practice tailored to your body and goals</li>
                            <li>Working with specific physical conditions or injuries</li>
                            <li>Deepening your understanding of breathwork and meditation</li>
                            <li>Exploring yoga philosophy and its application to daily life</li>
                        </ul>
                        <p>
                            <strong>Pricing:</strong> $80-$110/hr sliding scale. Your investment is a personal choice, aligning with your current financial circumstances. No questions asked.
                        </p>
                        <p>
                            Sessions are available in-person in Portland, Oregon, or online via Google Meet.
                        </p>
                        <p>
                            To book a session, please <a href="/register">create an account</a>. Once registered, you'll see available time slots.
                        </p>
                    </motion.div>
                </div>
            </motion.div>

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
                        <h4><a href="https://www.yogarefugepdx.com/workshops-and-events" target="_blank" rel="noopener noreferrer">New Year's Day Practice and Intention Setting</a></h4>
                        <p className="class-schedule">
                            <strong>Date & Time:</strong> 01/01 at 11am-1pm
                            <br />
                            <strong>Location:</strong> <a href="https://www.yogarefugepdx.com/workshops-and-events" target="_blank" rel="noopener noreferrer">Yoga Refuge NW</a>, 210 NW 17th Ave #101, Portland, OR 97209
                            <br />
                            <strong>Pricing:</strong> $30-$45 sliding scale
                        </p>
                        <p>
                            A grounding New Year's Day practice blending gentle flow with restorative poses. We'll explore intention setting, seasonal well being inspired by Ayurveda, and reflections inspired by the Yoga Sutras.
                        </p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Awaken the Senses: Restorative Yoga, Handcrafted Chocolate and an Exploration of the Chakras</h4>
                        <p>
                            An immersive experience combining restorative yoga, meditation, and sense awareness. This workshop brings together yoga and handmade chocolate to awaken presence, deepen awareness, and open the senses.
                        </p>
                        <p>
                            As both a chocolatier and yoga teacher, I bring these worlds together with intention. The chocolates we taste are created specifically to reflect the body's energetic centers, the chakras, using organic cacao infused with edible flowers, fruits, and spices.
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
                                            <div className="date-text">Spring 2026</div>
                                            <div className="time-text">TBA</div>
                                        </div>
                                    </div>
                                    <div className="location-text">
                                        <FaExternalLinkAlt className="register-icon" aria-hidden="true" />
                                        <a href="https://thepeoplesyoga.org/events-and-workshops/" target="_blank" rel="noopener noreferrer" aria-label="Register for workshop in Spring 2026 at The People's Yoga on NE Killingsworth">The People's Yoga, NE Killingsworth</a>
                                    </div>
                                    <div className="chakra-focus">
                                        
                                    </div>
                                </div>

                                <div className="workshop-date-card">
                                    <div className="date-header">
                                        <FaCalendarAlt className="date-icon" aria-hidden="true" />
                                        <div className="date-info">
                                            <div className="date-text">November 8, 2025</div>
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
                                            <div className="date-text">November 22, 2025</div>
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
                                            <div className="date-text">November 23, 2025</div>    
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
                            practice encourages deep release and stillness.
                        </p>
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
                            This practice is inclusive and adaptive, offering a welcoming space for all levels.</p>
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
                                    <p dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
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
                        <p><em>For information about my yoga therapy training, please visit the <a href="/yoga-therapy">Yoga Therapy page</a>.</em></p>
                    </div>
                    <div className="info-item">
                        <h4>300hr Advanced Yoga Teacher Training</h4>
                        <h4>(RYT-500)</h4>
                        <p><em>Sarahjoy Yoga, Portland OR</em><br />
                            May 2024 - February 2025</p>
                        <p>Trauma-informed, neurobiologically grounded teacher training with <strong><a href="https://www.sarahjoyyoga.com/300-hour-advanced-yoga-teacher-training.html" target='_blank' rel="noopener noreferrer">Sarahjoy Marsh</a></strong><br />
                            Restorative Yoga, Slow Flow, Chair Yoga, Adaptive Yoga, Pranayama<br />
                            Focus on neuroscience, mindfulness, psychology, physiology, and ayurvedic practices</p>
                    </div>
                    <div className="info-item">
                        <h4>300hr Foundational Yoga Teacher Training</h4>
                        <p><em>The People’s Yoga, Portland OR</em><br />
                            October 2023 - April 2024</p>
                        <p>Treasures of Engagement with <strong><a href="https://www.suniti.net/" target='_blank' rel="noopener noreferrer">Suniti Dernovsek</a></strong><br />
                            Hatha Yoga, Vinyasa Yoga, Restorative Yoga<br />
                            Focus on somatic practices such as Body-Mind Centering and the Alexander Technique</p>
                    </div>
                </div>
                <div className="info-category">
                    <h3>Other Yoga Trainings</h3>
                    <div className="info-item">
                        <h4>20hr "Postpartum Yoga" Teacher Training</h4>
                        <p><em>with <strong><a href="https://www.awakenedspirityoga.com/product/postnatal-yoga-teacher-training-virtual/" target='_blank' rel="noopener noreferrer">Julia Forest</a></strong>, online</em><br />
                            October, 2025</p>
                    </div>
                    <div className="info-item">
                        <h4>10hr "Yoga for Disabled Folks" Training</h4>
                        <p><em>with <strong><a href="https://www.allihopayoga.com/about" target='_blank' rel="noopener noreferrer">Rodrigo Souza</a></strong>, live via Accessible Yoga</em><br />
                            December 9-19, 2024</p>
                        <p>Accessible & adaptive practices for those with limited mobility & wheelchair users</p>
                    </div>
                    <div className="info-item">
                        <h4>50hr "Yoga Anatomy and Physiology" Training</h4>
                        <p><em>with <strong><a href="https://joemilleryoga.com/" target='_blank' rel="noopener noreferrer">Joe Miller</a></strong>, online</em><br />
                            November 2024</p>
                        <p>Applying anatomy to yoga practice and teachings, using anatomical terminology.</p>
                    </div>
                    <div className="info-item">
                        <h4>8hr Kids Yoga Teacher Training</h4>
                        <p><em>with Leslie Wilda, <strong><a href="https://www.yogaplaygrounds.com/" target='_blank' rel="noopener noreferrer">Yoga Playgrounds</a></strong>, in-person in Portland, OR</em><br />
                            August 2024</p>
                        <p>Teaching yoga and mindfulness for kids ages 3-12.<br />
                            Yoga games, breathing exercises, visualizations, mindfulness activities and relaxation techniques.</p>
                    </div>
                </div>
                <div className="info-category">
                    <h3>Other Programs</h3>
                    <div className="info-item">
                        <h4>Master of Arts in International Studies</h4>
                        <p><em> <strong><a href="https://www.nccu.edu.tw/index.php?Lang=en" target='_blank' rel="noopener noreferrer">National Chengchi University</a></strong>, Taipei, Taiwan</em><br />
                            2009-2011</p>
                        <p>Full scholarship recipient of the Ministry of Education, Taiwan</p>
                    </div>
                    <div className="info-item">
                        <h4>Bachelor of Arts in International Studies</h4>
                        <p><em> <strong><a href="https://english.nye.hu/" target='_blank' rel="noopener noreferrer">University of Nyíregyháza</a></strong>, Nyíregyháza, Hungary</em><br />
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
                    <a href="/yoga-therapy" className="cta-button outline">
                        Learn about Yoga Therapy
                    </a>
                </div>
            </motion.div>

            <Slideshow />
        </div >
    );
}

export default About;
