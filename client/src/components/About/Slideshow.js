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
                arrows: false, // Hide arrows for small screens
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
                    <img src='/images/Zsuzsi/1.jpg' alt="Melting cacao" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/2.jpg' alt="Pouring chocolate" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/3.jpg' alt="Filling chocolate molds" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/4.jpg' alt="Chocolate mold" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/5.jpg" alt="Adding toppings to chocolate" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/6.jpg' alt="Topping chocolate pieces" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/7.jpg" alt="Truffles" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/8.jpg" alt="Tasting chocolate" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/9.jpg" alt="Viola and blackberry white chocolate bars" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/10.jpg" alt="Strawberry Chocolate" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/11.jpg' alt="Cranberry Chocolate" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/12.jpg' alt="Chocolate tins" />
                </div>
            </Slider>
        </div>
    );
};

export default Slideshow;
