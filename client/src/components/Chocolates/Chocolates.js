
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

function Chocolates() {
    const scrollToProductsSection = () => {
        document.getElementById("products-section").scrollIntoView({ behavior: "smooth" });
    };

    //Animation Variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 },
        transition: { duration: 1 }
    };

    return (
        <div className='chocolates-page'>
            <Helmet>
                <title>ReTreat Chocolates | Small-Batch, Sustainable, Plant-Based, Low-Waste</title>
                <meta name="description" content="Handcrafted chocolate made with organic, fair-trade cacao or ceremonial cacao. Soy-free, vegan, palm-oil free and packaged in reusable tins." />
                <link rel="canonical" href="https://www.yogaandchocolate.com/chocolates" />
            </Helmet>
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
                        <p>I never use: gluten, soy, palm oil, and refined sugar.</p>
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
                    videoDescription="A peek into my small-batch process—slow and intentional."
                    process={[
                        "Grind pure cacao paste from cacao beans.",
                        "Gently melt the cacao butter.",
                        "Add farm-sourced organic maple sugar.",
                        "Incorporate organic Madagascar Bourbon vanilla powder.",
                        "Sprinkle in Oregon sea salt.",
                        "Slowly combine the cacao paste with the melted cacao butter and sugar.",
                        "Carefully monitor the temperature by hand.",
                        "Polish the molds and prepare the toppings.",
                        "Fill the molds with the chocolate.",
                        "Add toppings.",
                        "Let the chocolates harden naturally.",
                        "Clean the tins, and place the chocolates inside.",
                    ]}
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


