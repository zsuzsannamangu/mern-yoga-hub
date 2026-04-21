
import React from 'react';
import { Helmet } from 'react-helmet';
import './Chocolates.scss';
import Products from './Products';
import AboutChocolates from './AboutChocolates';
import '../../App.scss';
import Slideshow from './Slideshow';
import { motion } from 'framer-motion';
import Testimonials from './Testimonials';
import VideoBlock from './VideoBlock';
import { seo } from '../../config/seoContent';

function Chocolates() {
    const scrollToProductsSection = () => {
        document.getElementById("products-section").scrollIntoView({ behavior: "smooth" });
    };
    return (
        <div className='chocolates-page'>
            <Helmet>
                <title>{seo.chocolates.title}</title>
                <meta name="description" content={seo.chocolates.description} />
                <meta property="og:title" content={seo.chocolates.title} />
                <meta property="og:description" content={seo.chocolates.description} />
                <meta name="twitter:title" content={seo.chocolates.title} />
                <meta name="twitter:description" content={seo.chocolates.description} />
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
                className='chocolates-top'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
            >
                <div className="overlay">
                    <motion.div
                        className="overlay-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    >
                        <h1>ReTreat Chocolates</h1>
                        <p>Plant-based. Sustainably sourced. Low waste packaging.</p>
                        <p>Organic, local and seasonal ingredients.</p>
                        <p>I never use: soy, palm oil, and refined sugar.</p>
                        <p>Made to order, from scratch, by hand, in very small batches.</p>
                        <motion.button
                            onClick={scrollToProductsSection}
                            className="order-button"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            Order
                        </motion.button>
                    </motion.div>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <Products />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <AboutChocolates />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <VideoBlock
                    videoId="BNDjHWsjHI4"
                    title="How I Make My Chocolates"
                    creditName="Conrad Kaczor"
                    creditUrl="https://www.conradkaczor.com/"
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <Testimonials />
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
            >
                <Slideshow />
            </motion.div>
        </div>
    );
}

export default Chocolates;


