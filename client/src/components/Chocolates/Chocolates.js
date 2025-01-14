
import React from 'react';
import './Chocolates.scss';
import Products from './Products';
import AboutChocolates from './AboutChocolates';
import '../../App.scss';
import Slideshow from './Slideshow';

function Chocolates() {
    const scrollToProductsSection = () => {
        document.getElementById("products-section").scrollIntoView({ behavior: "smooth" });
    };
    return (
        <div className='chocolates-page'>
            <div className='chocolates-top'>
                <div className="overlay">
                    <div className="overlay-text">
                        <p>Plant-based. Sustainably sourced. Low waste packaging.</p>
                        <p>Organic, local and seasonal ingredients.</p>
                        <p>I never use: gluten, soy, palm oil, and refined sugar.</p>
                        <p>Made to order, from scratch, by hand, in very small batches.</p>
                        <button onClick={scrollToProductsSection} className="order-button">Order</button>
                    </div>
                </div>
            </div>
            <Products/>
            <AboutChocolates />
            <Slideshow />
        </div>
    );
}

export default Chocolates;


