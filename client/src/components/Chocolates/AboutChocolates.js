import React from 'react';
import './AboutChocolates.scss';
import '../../App.scss';

function AboutChocolates() {
  return (
    <div className="about-chocolates-section">
      <div className="about-chocolates-content">
        <div className="about-chocolates-text">
          <h2 className="section-title">The ReTreat Culture</h2>
          <div className="title-line"></div>
          <p>Hello! Welcome to ReTreat Chocolates!</p>
          <p>I'm Zsuzsanna, the creator behind ReTreat, a small chocolate business in Portland, Oregon, founded in November 2020.</p>
          <h3>Our Mission: Reduce - Reuse - ReTreat™</h3>
          <p>Driven by a commitment to sustainability, ReTreat offers chocolates in returnable and reusable packaging. Our family practices low-waste living, and ReTreat is an extension of that
            philosophy. When I couldn't find chocolate with sustainable packaging, I decided to make it myself, leading to the creation of ReTreat.</p>
          <h3>Ingredients and Packaging</h3>
          <ul>
            <li>Zero Waste Packaging: My chocolates come in returnable and reusable aluminum tins.</li>
            <li>Local and Ethical Sourcing: I support local farmers and use fair trade, sustainably sourced cacao from the Dominican Republic, Ecuador, Venezuela and Guatemala.</li>
            <li>Natural Sweeteners: My dark chocolates are sweetened with organic maple sugar directly sourced from a farm in Pennsylvania, while white chocolates use Lakanto monkfruit sweetener. (I opted for monkfruit
              in white chocolates to stay true to its 'white' color as maple sugar would create a brownish white chocolate.)
            </li>
            <li>Pure Ingredients: I avoid artificial additives and use organic and locally sourced ingredients whenever possible. I don't use sunflower or soy lecithin or other substitutes. My core
              ingredients are fair-trade and organic cacao, organic cacao butter, organic maple sugar, Madagascar bourbon vanilla powder, Oregon sea salt, and organic pure coconut milk powder for the white chocolates.</li>
          </ul>
          <h3>Commitment to Quality</h3>
          <p>At ReTreat, I prioritize both taste and sustainability. From fair trade cacao to locally harvested sea salt, every ingredient is chosen with care. My simple chocolates reflect my dedication to sustainability, quality and transparency.</p>
          <h3>Join the ReTreat Movement</h3>
          <p>Have questions or feedback? I'd love to hear from you. <strong><a href="/contact">Message me!</a></strong></p>
        </div>
        <div className="about-chocolates-image">
          <img src="/images/Zsuzsi/Zsuzsi_and_chocolates_sm.jpg" alt="Zsuzsi" />
          <p className="photo-credit">Photo by Jason Quigley</p>
        </div>
      </div>
    </div>
  );
}

export default AboutChocolates;