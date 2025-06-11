import React from 'react';
import './AboutChocolates.scss';
import '../../App.scss';
import { motion } from 'framer-motion';

function AboutChocolates() {
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 1 } }
  };
  return (
    <div className="about-chocolates-section">
      <div className="about-chocolates-content">
        <motion.div className="about-chocolates-text" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className="section-title">The ReTreat Culture</h2>
          <div className="title-line"></div>
          <p>Hello! Welcome to ReTreat Chocolates!</p>
          <p>I'm Zsuzsanna, the creator behind ReTreat, a small chocolate business in Portland, Oregon, founded in November 2020.</p>
          <h3>Our Mission: Reduce - Reuse - ReTreat™</h3>
          <p>Driven by a commitment to sustainability, ReTreat offers chocolates in returnable and reusable packaging. Our family practices low-waste living, and ReTreat is an extension of that
            philosophy. When I couldn't find chocolate with sustainable packaging, I decided to make it myself, leading to the creation of ReTreat.</p>
          <h3>Ingredients and Packaging</h3>
          <ul>
            <li>Zero Waste Packaging: My chocolates come in returnable and reusable, dishwasher safe tins.</li>
            <li>Local and Ethical Sourcing: I support local farmers and use fair trade, sustainably sourced cacao from the Dominican Republic, Ecuador, Peru or Guatemala.</li>
            <li>Natural Sweeteners: My dark chocolates are sweetened with organic maple sugar directly sourced from a farm in Pennsylvania, while white chocolates use Lakanto monkfruit sweetener. (I opted for monkfruit
              in white chocolates to stay true to its 'white' color as maple sugar would create a brownish white chocolate.)
            </li>
            <li>Pure Ingredients: I avoid artificial additives and use organic and locally sourced ingredients whenever possible. I don't use sunflower or soy lecithin or other substitutes. My core
              ingredients are fair-trade and organic cacao, organic cacao butter, organic maple sugar, Madagascar bourbon vanilla powder, Oregon sea salt, and organic coconut milk powder for the white chocolates.</li>
          </ul>
          <h3>Commitment to Quality</h3>
          <p>At ReTreat, I prioritize both taste and sustainability. From fair trade cacao to locally harvested sea salt, every ingredient is chosen with care. My simple chocolates reflect my dedication to sustainability, quality and transparency.</p>
          <h3>Join the ReTreat Movement</h3>
          <p>Have questions or feedback? I'd love to hear from you. <strong><a href="/contact">Message me!</a></strong></p>
        </motion.div>
        <motion.div className="about-chocolates-image" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <img src="/images/Zsuzsi/Zsuzsi_and_chocolates_sm.jpg" alt="Zsuzsi" />
          <p className="photo-credit">Photo by Jason Quigley</p>
        </motion.div>
      </div>
      <div className="about-chocolates-content-2">
        <motion.div className="about-chocolates-text" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h2 className="section-title">Shipping and Discounts</h2>
          <div className="title-line"></div>
        </motion.div>
        <motion.div className="about-chocolates-image" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <img src="/images/Zsuzsi/Zsuzsi_and_chocolates_sm_2.jpg" alt="Zsuzsi" />
          <p className="photo-credit">Photo by Jason Quigley</p>
        </motion.div>
        <motion.div className="about-chocolates-text" variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <h3>Shipping Info</h3>
          <p>I ship via USPS Priority Mail (1–3 days) or Priority Mail Express (1–2 days) during the summer months. Orders are shipped within 2–5 days of purchase.</p>
          <p>To ensure your chocolates arrive fresh and unmelted, I ship at the beginning of the week (Monday–Wednesday) to avoid weekend delays.</p>
          <p>If you need your order sooner, feel free to reach out, I'm happy to be flexible when possible.</p>
          <p>Shipping materials such as packing paper, bubble wraps, and packing peanuts are all reused from previous shipments. The packing peanuts are plant-based and will dissolve in water in seconds. Instead of throwing them away, please soak them in water (or reuse them).</p>
          <h3>Local Pickup</h3>
          <p>
            You can pick up your order for free at <strong>Hail Snail</strong>, a vegan cinnamon roll shop located at:<br />
            <strong>6550 N Interstate Ave., Portland, OR 97217</strong><br />
            <em>Hours: Thursday–Sunday, 11am–5pm</em>
          </p>
          <p>
            If these hours don’t work for you, feel free to contact me. We’ll find an alternative that fits your schedule.
          </p>
          <p>
            <strong>To waive the shipping fee, be sure to check the “Local Pickup” option at checkout.</strong>
          </p>
          <h3>Instagram discount</h3>
          <p>If you loved your chocolates, please mention it on Instagram and tag me at <strong><a href="https://www.instagram.com/zsuzsannacreates/">@zsuzsannacreates</a></strong>, and receive 15% off your next order.</p>
        </motion.div>
      </div>
    </div>
  );
}

export default AboutChocolates;