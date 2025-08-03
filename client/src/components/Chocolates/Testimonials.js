// src/components/Chocolates/Testimonials.js
import React from 'react';
import './Testimonials.scss';

const testimonials = [
  {
    name: "Elana S.",
    quote: "Each little Vite is perfection. The flavors are just enough to savor without being overwhelming and the chocolate is so smooth and delicious! I would give these 10 stars if I could.",
  },
  {
    name: "Doug W.",
    quote: "It makes a perfect gift and has a great taste. I so appreciate your care in selecting quality healthy ingredients.",
  },
  {
    name: "Renee M.",
    quote: "Such a beautiful presentation in cute, reusable tins. Handwritten note on thoughtful seeded paper. Not to mention the delicious chocolates with obviously quality ingredients. Excellent product and experience!",
  },
    {
    name: "Ben R.",
    quote: "These are my favorite chocolates ever! They are so delicious and they are hand-made with the best ingredients. So good!!",
  },
  {
    name: "Heather V.",
    quote: "Zsuzsanna's chocolates are amazing! They are sustainably packaged and thoughtfully prepared. Her chocolate feels like something extra special to share with friends and family after a meal or at a gathering. I love that they are vegan and how much thought she puts into sourcing her ingredients. Highly recommend!",
  },
  {
    name: "Patricia",
    quote: "These chocolates are unique and delectable. And I appreciate the environmentally conscious packaging. The personal note is so touching. You are sun bursts, star shine and stardust.",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <h2>What Customers Are Saying</h2>
      <div className="testimonials-container">
        {testimonials.map((t, index) => (
          <div key={index} className="testimonial-card">
            <p className="quote">“{t.quote}”</p>
            <p className="name">— {t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
