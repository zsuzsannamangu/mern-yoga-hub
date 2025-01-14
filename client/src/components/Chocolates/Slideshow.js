import React from 'react';
import Slider from 'react-slick';
import './Slideshow.scss';
import '../../App.scss';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slideshow = () => {
    const settings = {
        dots: true,
        speed: 800,
        slidesToShow: 4,
        slidesToScroll: 2,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000, // Set to a reasonable speed for a smooth transition
        responsive: [
            {
              breakpoint: 768, // Screen width below 768px
              settings: {
                dots: false,
                slidesToShow: 2, // Show one slide at a time
                slidesToScroll: 1,
                arrows: false, // Optional: Hide arrows for small screens
              },
            },
          ],
    };

    return (
        <div className="slideshow">
            <div className='photography'>
                <p>Photos by Zsuzsanna Mangu and Jason Quigley</p>
            </div>
            <Slider {...settings}>
                <div>
                    <img src='/images/Zsuzsi/Slideshow_14.jpg' alt="Melting cacao" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/Slideshow_1.jpg' alt="Pouring chocolate" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/Slideshow_16.jpg' alt="Filling chocolate molds" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/Slideshow_2.jpg' alt="Chocolate mold" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/Slideshow_22.jpg" alt="Adding toppings to chocolate" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/Slideshow_13.jpg' alt="Topping chocolate pieces" />
                </div>
                <div>
                    <img src="/images/chocolates/Truffles_5.jpg" alt="Truffles" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/Slideshow_12.jpg" alt="Tasting chocolate" />
                </div>
                <div>
                    <img src="/images/chocolates/Violabars.jpg" alt="Viola and blackberry white chocolate bars" />
                </div>
                <div>
                    <img src="/images/chocolates/Strawberry_chocolate_2.jpg" alt="Strawberry Chocolate" />
                </div>
                <div>
                    <img src='/images/chocolates/Cranberry_chocolate.jpg' alt="Cranberry Chocolate" />
                </div>
                <div>
                    <img src='/images/chocolates/Chocolates_3.jpg' alt="Chocolate tins" />
                </div>
                <div>
                    <img src='/images/chocolates/Orangebar_1.jpg' alt="Dark chocolate bar with orange slices" />
                </div>
                <div>
                    <img src='/images/chocolates/White_bars.jpg' alt="White chocolate bars: matcha mint, raspberry and cornflower" />
                </div>
                <div>
                    <img src='/images/chocolates/Tea_truffle.jpg' alt="Green Tea Truffles" />
                </div>
                <div>
                    <img src='/images/chocolates/Truffles_1.jpg' alt="Truffles" />
                </div>
            </Slider>
        </div>
    );
};

export default Slideshow;
