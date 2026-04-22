import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet';
import './Chocolates.scss';
import Products from './Products';
import AboutChocolates from './AboutChocolates';
import '../../App.scss';
import Slideshow from './Slideshow';
import { motion } from 'framer-motion';
import Testimonials from './Testimonials';
import VideoBlock from './VideoBlock';
import { seo, SEO_SITE_HOST } from '../../config/seoContent';

const CHOCOLATES_OG_IMAGE = `${SEO_SITE_HOST}/images/chocolates/Truffles_1.jpg`;

function Chocolates() {
    const scrollToProductsSection = () => {
        document.getElementById("products-section").scrollIntoView({ behavior: "smooth" });
    };

    const chocolatesStructuredData = useMemo(() => {
        const pageUrl = `${SEO_SITE_HOST}/chocolates`;
        return {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'WebPage',
                    '@id': `${pageUrl}#webpage`,
                    url: pageUrl,
                    name: seo.chocolates.title,
                    description: seo.chocolates.description,
                    inLanguage: 'en-US',
                    primaryImageOfPage: {
                        '@type': 'ImageObject',
                        url: CHOCOLATES_OG_IMAGE,
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
                            name: 'ReTreat Chocolates',
                            item: pageUrl,
                        },
                    ],
                },
                {
                    '@type': 'Organization',
                    '@id': `${pageUrl}#retreat-chocolates`,
                    name: 'ReTreat Chocolates',
                    url: pageUrl,
                    description: seo.chocolates.description,
                    founder: {
                        '@type': 'Person',
                        name: 'Zsuzsanna Mangu',
                        url: `${SEO_SITE_HOST}/`,
                    },
                    areaServed: {
                        '@type': 'City',
                        name: 'Portland',
                        containedInPlace: {
                            '@type': 'State',
                            name: 'Oregon',
                        },
                    },
                },
            ],
        };
    }, []);

    return (
        <div className='chocolates-page'>
            <Helmet>
                <title>{seo.chocolates.title}</title>
                <meta name="description" content={seo.chocolates.description} />
                <meta property="og:title" content={seo.chocolates.title} />
                <meta property="og:description" content={seo.chocolates.description} />
                <meta property="og:image" content={CHOCOLATES_OG_IMAGE} />
                <meta property="og:image:alt" content="ReTreat handcrafted dark chocolate — Portland small-batch vegan chocolate" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seo.chocolates.title} />
                <meta name="twitter:description" content={seo.chocolates.description} />
                <meta name="twitter:image" content={CHOCOLATES_OG_IMAGE} />
                <script type="application/ld+json">{JSON.stringify(chocolatesStructuredData)}</script>
            </Helmet>

            {/* Workshop Announcement Bar */}
            <div className="workshop-announcement newyear-announcement">
                <div className="announcement-content">
                    <span className="announcement-text">
                        ✨ <strong>Yoga and chocolate workshop</strong> on May 9th at The People&apos;s Yoga
                    </span>
                    <a href="/yoga?section=workshop" className="announcement-link">
                        Workshop details &amp; sign up
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


