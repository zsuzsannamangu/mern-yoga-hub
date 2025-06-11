import React, { useEffect, useRef } from 'react';
//useEffect() is a React Hook that lets you perform side effects in function components, instead of class components. useRef is a React Hook that allows you to create a mutable reference to a DOM element.
import { useLocation } from 'react-router-dom'; //useLocation is a hook provided by React Router that gives access to the current URL's location object.
import './About.scss';
import Offerings from './Offerings';
import '../../App.scss';
import { motion } from 'framer-motion';

function About() {
    const location = useLocation(); // React Router hook to access current location (current URL, such as the path or query parameters)
    const classDescriptionsRef = useRef(null); // Reference for the "Class Descriptions" section to enable scrolling.

    //Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.3,
            }
        }
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
        <motion.div
            className='about-page'
            initial="hidden"
            whileInView="visible"
            animate="visible"
            variants={containerVariants}
        >

            {/* Top section with an introductory overlay about the instructor */}
            <motion.div className='about-top' variants={fadeInUp}>
                <div className="about-overlay">
                    <div className="about-overlay-text">
                        <p>I'm Zsuzsanna, a yoga teacher and yoga therapist-in-training, here to support you in finding alignment between body and mind. My teaching approach
                            embraces each layer of your experience—the physical, emotional, and mental—as we explore what it means to feel whole.</p>
                    </div>
                </div>
            </motion.div>

            {/* Offerings */}
            <motion.div variants={fadeInUp}>
                <Offerings />
            </motion.div>

            {/* Trainings Section */}
            <div className="about-info-section">
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
            </div>

            {/* Class Descriptions Section */}
            <div className="about-info-section" ref={classDescriptionsRef}>
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
                        <h4>Slow Flow</h4>
                        <p>This class focuses on mindful movement, allowing you to ease into each posture with intention and awareness.
                            Through gentle flows, we’ll explore balance and strength at a pace that honors your body.
                            This practice is inclusive and adaptive, offering a welcoming space for all levels, whether you’re new to yoga or looking to refine your practice.</p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

export default About;
