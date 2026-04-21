import { Helmet } from "react-helmet";
import React, { useEffect, useRef, useState } from 'react';
//useEffect() is a React Hook that lets you perform side effects in function components, instead of class components. useRef is a React Hook that allows you to create a mutable reference to a DOM element.
import { useLocation } from 'react-router-dom'; //useLocation is a hook provided by React Router that gives access to the current URL's location object.
import './About.scss';
import '../../App.scss';
import { motion } from 'framer-motion';
import Slideshow from './Slideshow';
import { FaCalendarAlt, FaExternalLinkAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { seo } from '../../config/seoContent';

function About() {
    const location = useLocation(); // React Router hook to access current location (current URL, such as the path or query parameters)
    const classDescriptionsRef = useRef(null); // Reference for the "Class Descriptions" section to enable scrolling.
    const regularClassesRef = useRef(null); // Scroll target for Regular Classes (calendar "More Info")
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

        if (section === 'regularClasses' && regularClassesRef.current) {
            regularClassesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (section === 'classDescriptions' && classDescriptionsRef.current) {
            // Scroll to the start of the Classes and Workshops section
            classDescriptionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [location]); //'location' is a dependency, the dependencies array is an array of variables that the effect depends on. [location] ensures the effect runs only when the location object changes.

    return (
        <div className='about-page'>
            <Helmet>
                <title>{seo.yoga.title}</title>
                <meta name="description" content={seo.yoga.description} />
                <meta property="og:title" content={seo.yoga.title} />
                <meta property="og:description" content={seo.yoga.description} />
                <meta name="twitter:title" content={seo.yoga.title} />
                <meta name="twitter:description" content={seo.yoga.description} />
            </Helmet>

            {/* Workshop Announcement Bar */}
            <div className="workshop-announcement newyear-announcement">
                <div className="announcement-content">
                    <span className="announcement-text">
                        ✨ <strong>Yoga and chocolate workshop</strong> — May 9th at The People&apos;s Yoga
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
                        <h1>Group classes &amp; workshops</h1>
                        <p className="about-hero-tagline">
                            Trauma-informed chair and wheelchair yoga, adaptive yoga for hypermobility and EDS, slow vinyasa and restorative practices, and integrative chocolate &amp; chakra workshops offered in Portland and online.
                        </p>
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
                        <p>
                            I teach weekly group classes at various studios throughout Portland, offering a range of practices to meet you where you are. 
                            My teaching style emphasizes connection and accessibility.
                        </p>
                        <p>
                            All classes welcome students of all levels and abilities. I offer modifications and options for every pose, creating an inclusive 
                            environment where everyone can explore movement and breath at their own pace.
                        </p>
                        <p>
                            My classes and sessions are characterized by:
                        </p>
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
                            Personalized one-on-one sessions designed to meet your unique needs. These sessions offer tailored practices including physical postures, breathwork, meditation, and yoga philosophy.
                        </p>
                        <p>
                            Private sessions provide focused attention and personalized guidance that group classes cannot offer. Each session is crafted specifically for you, 
                            taking into account your body, your goals, and where you are in your practice.
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
                            Sessions are available in-person in Portland, Oregon, or online via Google Meet. To book a session, please <a href="/register">create an account</a>. 
                            Once registered, you'll see available time slots.
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
                        <h4>Awaken the Senses: Restorative Yoga, Handcrafted Chocolate and an Exploration of the Chakras</h4>
                        <p>
                            An immersive experience combining restorative yoga, meditation, and sense awareness. This workshop brings together yoga and handmade chocolate to awaken presence, deepen awareness, and open the senses.
                        </p>
                        <p>
                            As both a chocolatier and yoga teacher, I bring these worlds together with intention. The chocolates we taste are created specifically to reflect the body's energetic centers, the chakras, using organic cacao infused with edible flowers, fruits, and spices.
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
                                            <div className="date-text">February 14, 2026</div>
                                            <div className="time-text">3:00 PM - 4:30 PM</div>
                                        </div>
                                    </div>
                                    <div className="location-text">
                                        <FaExternalLinkAlt className="register-icon" aria-hidden="true" />
                                        <a href="https://firelightyoga.com/yoga-chocolate-chakras/" target="_blank" rel="noopener noreferrer" aria-label="Register for workshop on February 14 at Firelight Yoga, 3:00 PM to 4:30 PM">Firelight Yoga</a>
                                    </div>
                                    <div className="chakra-focus">
                                        Focus: Root (1st) & Heart (4th) Chakras
                                    </div>
                                </div>

                                <div className="workshop-date-card">
                                    <div className="date-header">
                                        <FaCalendarAlt className="date-icon" aria-hidden="true" />
                                        <div className="date-info">
                                            <div className="date-text">May 9, 2026</div>
                                            <div className="time-text">3:00 PM – 5:00 PM</div>
                                        </div>
                                    </div>
                                    <div className="location-text">
                                        <FaExternalLinkAlt className="register-icon" aria-hidden="true" />
                                        <a href="https://thepeoplesyoga.org/events-and-workshops/" target="_blank" rel="noopener noreferrer" aria-label="Register for workshop on May 9 at The People's Yoga NE">The People's Yoga NE</a>
                                    </div>
                                    <div className="chakra-focus">
                                        Focus: Root (1st) & Heart (4th) Chakras
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Reimagine Yoga: Adapt, Support, and Create with Chairs</h4>
                        <p>
                            Chairs can radically expand what yoga looks like, and who it is for. In this 2-hour workshop, we'll explore how chairs can be used to adapt, support, and reimagine yoga poses for a wide range of bodies, needs, and experiences. This workshop is designed for yoga teachers who want practical tools for inclusive teaching, as well as yoga practitioners who want to use chairs in their own practice.
                        </p>
                        <p>We will work with chairs as:</p>
                        <ul>
                            <li>Support for balance and strength</li>
                            <li>A bridge to standing poses</li>
                            <li>A way to make yoga accessible for people who cannot bear weight through the legs</li>
                            <li>A creative partner, not a limitation, even for students without mobility restrictions</li>
                        </ul>
                        <p>We will specifically explore:</p>
                        <ul>
                            <li>How to adapt familiar yoga poses using a chair</li>
                            <li>Teaching standing poses with chair support</li>
                            <li>Chair-based approaches to common yoga poses</li>
                            <li>Working with seated practice for wheelchair users</li>
                            <li>Adaptations for people with limited or no leg use, or reduced mobility</li>
                            <li>How to cue clearly and respectfully for mixed-ability classes</li>
                            <li>How to think creatively rather than prescriptively when adapting poses</li>
                        </ul>
                        <p>
                            This workshop draws from nearly two years of study in adaptive and chair yoga with Sarahjoy Marsh, as well as over a year of teaching wheelchair yoga for people with spinal cord injuries. The emphasis is on real-world teaching, embodied understanding, and practical skills you can use immediately.
                        </p>
                        <p>You'll leave with:</p>
                        <ul>
                            <li>Concrete adaptations you can bring into any class</li>
                            <li>Greater confidence teaching chair and adaptive yoga</li>
                            <li>New ways of seeing chairs as tools for exploration, not just accommodation</li>
                            <li>A deeper understanding of access, inclusion, and creativity in yoga</li>
                        </ul>
                        <p>
                            No prior experience with chair yoga is required. This workshop is suitable for yoga teachers of all styles, yoga students, and anyone curious about making yoga more accessible, functional, and expansive.
                        </p>
                        <p>Pay what you can: $35–$55 per person.</p>
                        <div className="workshop-dates-section">
                            <h5>Upcoming Dates</h5>
                            <div className="workshop-dates-grid">
                                <div className="workshop-date-card">
                                    <div className="date-header">
                                        <FaCalendarAlt className="date-icon" aria-hidden="true" />
                                        <div className="date-info">
                                            <div className="date-text">March 29, 2026</div>
                                            <div className="time-text">2:00 PM – 3:30 PM</div>
                                        </div>
                                    </div>
                                    <div className="location-text">
                                        <FaExternalLinkAlt className="register-icon" aria-hidden="true" />
                                        <a href="https://fullbodiedyoga.union.site/performances/mnbiuj52" target="_blank" rel="noopener noreferrer" aria-label="Register for Chair Yoga workshop on March 29 at Full Bodied Yoga">Full Bodied Yoga</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Regular Classes Section (alphabetical by class title) */}
                    <motion.h3 ref={regularClassesRef} className="classes-subtitle" variants={fadeInUp}>Regular Classes</motion.h3>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Align and Flow</h4>
                        <p className="class-schedule">Mondays 12:00-1:00pm at <a href="https://fullbodiedyoga.union.site/" target="_blank" rel="noopener noreferrer">Full Bodied Yoga</a> (also available livestream)</p>
                        <p>Align + Flow is a yoga class designed to help all bodies move mindfully and confidently. You'll explore alignment that supports your unique body in asana (yoga postures) allowing you to seamlessly coordinate breath with movement, 
                            yoking the two together for a balanced and empowering practice. Leave feeling grounded, energized, and ready to move through any yoga class with ease.
                        </p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Hatha Yoga</h4>
                        <p>A grounding practice that blends breath awareness with intentional movement. Hatha Yoga emphasizes steady postures and transitions, creating space for balance,
                            strength, and inner stillness. This class is slower-paced than vinyasa, offering time to explore alignment and deepen into each pose. Ideal for those seeking a
                            more meditative, breath-centered experience. Modifications and props are welcome.
                        </p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Postpartum Yoga</h4>
                        <p className="class-schedule">Thursdays 10:30am-11:30am at <a href="https://www.thebymc.com/classes" target="_blank" rel="noopener noreferrer">The Bhakti Yoga Movement Center</a></p>
                        <p>This postpartum yoga class aims to help you regain core strength, relieve pelvic floor imbalances, ease neck and back tension and be in community. Pre-crawling babies welcome to attend!  This class is designed for new parents 4 weeks - 6 months postpartum, but may be helpful for anyone with diastasis recti (abdominal muscle separation) or pelvic floor issues
                            regardless of childbirth. This is a wonderful place to tend to your body and spirit, and be in community with others on the postpartum journey. No prior yoga experience necessary.</p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Restorative Yoga</h4>
                        <p className="class-schedule">Thursdays 7:30-8:45pm at <a href="https://www.yogarefugepdx.com/class-schedule" target="_blank" rel="noopener noreferrer">Yoga Refuge NW</a></p>
                        <p>Restorative Yoga is a slow and sweet practice guided with gentle, prop-supported postures to allow students to release tension, reset the nervous system and experience deep rest.
                        Poses are held for a longer period of time, with the intention being to settle into stillness and meditation. A variety of props are used to provide support to the physical body so the mind can begin to unwind.
                        Restorative yoga is perfect for those looking for space to relax and shift the nervous system into a parasympathetic ("rest and digest") state. This can be a powerful practice for our busy and stressful lives.
                        </p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Rise and Flow</h4>
                        <p className="class-schedule">Mondays 9:30-10:30am at <a href="https://www.dearyogastudio.com/schedule" target="_blank" rel="noopener noreferrer">Dear Yoga</a></p>
                        <p>Awaken your body and mind with this uplifting morning practice. We’ll begin with gentle warm-ups and grounding exercises to set the tone for the day, then transition into an invigorating 
                            Vinyasa flow designed to increase blood circulation, energize your system, and flush out stagnant energy. The practice concludes with a soothing cool-down, leaving you feeling refreshed, 
                            balanced, and ready to move through your day with clarity and ease. All levels are welcome!</p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Supportive &amp; Safe Chair Yoga</h4>
                        <p className="class-schedule">
                            Wednesdays 9:00 AM – 10:00 AM · $25 per session ·{' '}
                            <a
                                href="https://heartspringhealth.com/event/chair-and-wheelchair-yoga/2026-04-01/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Heart Spring Health
                            </a>
                            , 7886 SE 13th Ave, Portland, OR 97202 (
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=7886+SE+13th+Ave+Portland+OR+97202"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                map
                            </a>
                            )
                        </p>
                        <div className="wheelchair-yoga-content">
                            <div className="wheelchair-yoga-text">
                                <p>
                                    This chair and wheelchair yoga class will explore breath awareness, gentle mobility, and simple strengthening movements that support joint comfort, circulation, posture, and ease in the body. Movements are adaptable, and options are offered so students can participate in ways that feel supportive and safe.
                                </p>
                            </div>
                            <div className="wheelchair-yoga-image">
                                <img src="/images/yoga/wheelchairyoga.png" alt="Chair and wheelchair yoga practice" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Vinyasa Flow</h4>
                        <p className="class-schedule">Thursdays 5:45pm-6:45pm at <a href="https://www.dearyogastudio.com/schedule" target="_blank" rel="noopener noreferrer">Dear Yoga</a></p>
                        <p className="class-schedule">Fridays 4pm-5pm at <a href="https://www.yogarefugepdx.com/class-schedule" target="_blank" rel="noopener noreferrer">Yoga Refuge NW</a> (also available livestream)</p>
                        <p>Vinyasa Flow builds strength, flexibility, and focus through creative sequences and mindful transitions. Expect to move, breathe,
                            and sweat while cultivating presence and resilience. Options will be offered to support a variety of experience levels.
                        </p>
                    </motion.div>

                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Yoga for Hypermobility &amp; EDS</h4>
                        <p><strong>Building Stability and Body Awareness</strong></p>
                        <p className="class-schedule">
                            Saturdays 6:30–7:45 PM · $30 per session ·{' '}
                            <a
                                href="https://heartspringhealth.com/event/yoga-for-hypermobility-eds/2026-04-11/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Heart Spring Health
                            </a>
                            , 7886 SE 13th Ave, Portland, OR 97202 (
                            <a
                                href="https://www.google.com/maps/search/?api=1&query=7886+SE+13th+Ave+Portland+OR+97202"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                map
                            </a>
                            )
                        </p>
                        <p className="class-schedule">
                            Saturdays — April 11, April 25, May 9, May 23, June 6, June 20
                        </p>
                        <p>
                            This class is designed for people with hypermobile bodies, including those living with Ehlers-Danlos Syndrome (EDS) or hypermobility spectrum disorders.
                        </p>
                        <p>
                            We’ll explore slow, controlled yoga movements that build joint stability, strength, and body awareness. Practices emphasize working within supportive ranges of motion, improving proprioception, and developing muscular support around joints.
                        </p>
                        <p>
                            Classes are primarily movement-based yoga practice, with brief guidance to help students understand how to move safely and effectively in hypermobile bodies.
                        </p>
                        <p>
                            Students are welcome to attend the full 6-week series or join individual classes as drop-ins.
                        </p>
                        <p>No prior yoga experience is required.</p>
                        <p><strong>Series focus</strong></p>
                        <ul>
                            <li><strong>Week 1: Understanding Hypermobility in Movement</strong> — Learning how to work within supportive ranges of motion. We explore neutral joint alignment, micro-bends, and the difference between mobility and stability through slow, simple yoga poses.</li>
                            <li><strong>Week 2: Proprioception &amp; Body Awareness</strong> — Practices that improve awareness of joint position and movement. We use slow transitions, small-range movements, and props such as blocks or the wall to support body awareness.</li>
                            <li><strong>Week 3: Joint Stability &amp; Co-Contraction</strong> — Developing muscular support around joints through gentle strengthening and co-contraction. The practice includes low-load strength work and isometric holds that stabilize shoulders and hips.</li>
                            <li><strong>Week 4: Moving with Control</strong> — Learning to move with precision rather than momentum. We explore slow transitions, coordination patterns, and controlled flowing movements.</li>
                            <li><strong>Week 5: Nervous System Regulation</strong> — Practices that support recovery and reduce tension in the body. This class includes breathwork, restorative postures, and pacing strategies to support nervous system balance.</li>
                            <li><strong>Week 6: Integration &amp; Personal Practice</strong> — Bringing the elements together into a sustainable yoga practice. Students learn how to modify yoga safely and apply the tools from the series in everyday movement.</li>
                        </ul>
                    </motion.div>

                    {/* Additional Classes Note */}
                    <motion.div className="info-item additional-classes-note" variants={fadeInUp}>
                        <p><em>I also sub at The People's Yoga, The Practice Space, Ready Set Grow and Firelight Yoga. For a complete schedule of all classes, including substitute classes and special events, please check the <a href="/calendar">calendar</a>.</em></p>
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
