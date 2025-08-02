import { Helmet } from "react-helmet";
import React, { useEffect, useRef } from 'react';
//useEffect() is a React Hook that lets you perform side effects in function components, instead of class components. useRef is a React Hook that allows you to create a mutable reference to a DOM element.
import { useLocation } from 'react-router-dom'; //useLocation is a hook provided by React Router that gives access to the current URL's location object.
import './About.scss';
import Offerings from './Offerings';
import '../../App.scss';
import { motion } from 'framer-motion';
import Slideshow from './Slideshow';

function About() {
    const location = useLocation(); // React Router hook to access current location (current URL, such as the path or query parameters)
    const classDescriptionsRef = useRef(null); // Reference for the "Class Descriptions" section to enable scrolling.

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
            classDescriptionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [location]); //'location' is a dependency, the dependencies array is an array of variables that the effect depends on. [location] ensures the effect runs only when the location object changes.

    return (
        <div className='about-page'>
            <Helmet>
                <title>Yoga with Zsuzsanna | Accessible, Therapeutic, Trauma-Informed Yoga</title>
                <meta name="description" content="Explore yoga therapy and accessible, trauma-informed yoga with Zsuzsanna, offering slow flow, restorative, chair, and wheelchair yoga in Portland and online." />
                <link rel="canonical" href="https://www.yogaandchocolate.com/yoga" />
            </Helmet>

            <motion.div
                className='about-top'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <div className="about-overlay">
                    <div className="about-overlay-text">
                        <h1>Yoga with Zsuzsanna</h1>
                        <p>I'm Zsuzsanna, a yoga teacher and yoga therapist-in-training, here to support you in finding alignment between body and mind.</p>
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

            {/* <motion.div
                className="about-info-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>My approach</motion.h2>
                <div className="title-line"></div>
                <p>My approach to yoga is rooted in presence and compassion.
                    I offer trauma-informed and adaptive practices that meet you where you are. As an aspiring yoga therapist, I combine breath science, somatic awareness, and yoga psychology to support nervous system regulation, emotional resilience, and healing.</p>
                <p>These classes are about discovering what it means to be in your body, right now, with curiosity and kindness.</p>
            </motion.div>

            <motion.div
                className="about-info-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
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
            </motion.div> */}

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
                            My approach to yoga is rooted in presence and compassion.
                            I offer trauma-informed and adaptive practices that meet you where you are. As an aspiring yoga therapist,
                            I combine breath science, somatic awareness, and yoga psychology to support nervous system regulation, emotional resilience, and healing.
                        </p>
                        <p>These classes are about discovering what it means to be in your body, right now, with curiosity and kindness.</p>
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
                        <img src="/images/yoga/Zsuzsi_Home_111.jpg" alt="A peaceful yoga session" />
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="about-info-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <motion.h2 className="section-title" variants={fadeInUp}>Who These Sessions Are For</motion.h2>
                <div className="title-line"></div>
                <p>
                    These sessions are open to everyone, regardless of experience, background, or physical ability. I offer practices that honor the unique experiences we each carry.
                </p>
                <p>
                    While all are welcome, I specialize in:
                </p>
                <ul className="custom-bullet-list">
                    <li>Everyone!</li>
                    <li>Teens and adults in addiction recovery</li>
                    <li>Pregnant and postpartum mothers</li>
                    <li>Wheelchair users and those with spinal cord injuries</li>
                    <li>Stay-at-home moms navigating identity shifts, overwhelm, and emotional labor</li>
                    <li>Immigrants and those navigating cultural displacement or loss</li>
                </ul>
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
                <motion.h2 className="section-title" variants={fadeInUp}>Class Descriptions</motion.h2>
                <div className="title-line"></div>
                <div className="info-category">
                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Yoga for Wheelchair Users</h4>
                        <p>A yoga practice tailored for individuals who use wheelchairs, focusing on enhancing well-being through breath, gentle movement, and mindfulness.

                            Through guided breathwork, we’ll cultivate a sense of calm, helping to lower stress, improve circulation, and support respiratory health. Gentle
                            movements are designed to improve flexibility, build strength, and enhance range of motion, all while remaining seated.

                            Mindfulness and meditation will be woven into the practice to foster mental clarity, emotional resilience, and a deeper connection to your body.
                            All levels are welcome, and no prior experience is needed. Props will be offered.</p>
                    </motion.div>
                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Gentle Flow</h4>
                        <p>This class focuses on mindful movement, allowing you to ease into each posture with intention and awareness.
                            Through gentle flows, we’ll explore balance and strength at a pace that honors your body.
                            This practice is inclusive and adaptive, offering a welcoming space for all levels, whether you’re new to yoga or looking to refine your practice.</p>
                    </motion.div>
                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Hatha Yoga</h4>
                        <p>A grounding practice that blends breath awareness with intentional movement. Hatha Flow emphasizes steady postures and transitions, creating space for balance,
                            strength, and inner stillness. This class is slower-paced than vinyasa, offering time to explore alignment and deepen into each pose. Ideal for those seeking a
                            more meditative, breath-centered experience. Modifications and props are welcome.
                        </p>
                    </motion.div>
                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Restorative Yoga</h4>
                        <p>A deeply relaxing class designed to soothe the nervous system and restore balance. Using props to support the body in restful poses, this
                            practice encourages deep release and stillness. Perfect for stress relief, recovery, and cultivating a sense of inner calm.
                        </p>
                    </motion.div>
                    <motion.div className="info-item" variants={fadeInUp}>
                        <h4>Vinyasa Flow</h4>
                        <p>Vinyasa Flow builds strength, flexibility, and focus through creative sequences and mindful transitions. Expect to move, breathe,
                            and sweat while cultivating presence and resilience. Options will be offered to support a variety of experience levels.
                        </p>
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
                <div className="faq">
                    <h4>Do I need to have yoga experience?</h4>
                    <p>Not at all. My classes are designed to meet you exactly where you are.</p>

                    <h4>Are sessions in-person or online?</h4>
                    <p>I offer both. You’re welcome to join in person in Portland, Oregon, or online via Google Meet. If you're local, I recommend in-person sessions when possible for deeper support.</p>

                    <h4>Do you offer hands-on assists or touch during in-person sessions?</h4>
                    <p>Yes, only with consent. I offer gentle, intentional touch and hands-on support when appropriate and always with your clear permission. Touch can be a beautiful tool for grounding, connection, and transformation.</p>

                    <h4>What props do I need for online sessions?</h4>
                    <p>If you have yoga props, great! But you can easily use everyday items too: a stack of books for blocks, a firm pillow for a bolster, a belt as a strap, and any cozy blanket you have on hand. I always offer modifications so you can make the most of what you have.</p>

                    <h4>Are yoga therapy sessions covered by insurance?</h4>
                    <p>Yoga therapy may be reimbursable through HSA or FSA accounts if recommended by a licensed healthcare provider. Please check with your provider to confirm eligibility.</p>
                </div>
            </motion.div>

            {/* Trainings Section */}
    //         <motion.div
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
                        <h4>10hr "Yoga for Disabled Folks" Training</h4>
                        <p><em>with <strong><a href="https://www.allihopayoga.com/about" target='_blank'>Rodrigo Souza</a></strong>, live via Accessible Yoga</em><br />
                            December 9-19, 2024</p>
                        <p>Accessible & adaptive practices for those with limited mobility & wheelchair users</p>
                    </div>
                    <div className="info-item">
                        <h4>50hr Yoga Anatomy and Physiology Training</h4>
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
                    <a href="/calendar" className="cta-button">
                        Sign up for group classes
                    </a>
                    <a href="/register" className="cta-button outline">
                        Book a private session
                    </a>
                </div>
            </motion.div>

            <Slideshow />
        </div >
    );
}

export default About;
