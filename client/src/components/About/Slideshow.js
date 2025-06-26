import React from 'react';
import Slider from 'react-slick';
import './Slideshow.scss';
import '../../App.scss';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slideshow = () => {
    const settings = {
        dots: true,
        speed: 500,
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
            <Slider {...settings}>
                <div>
                    <img src='/images/Zsuzsi/1.jpg' alt="Downward facing dog" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/2.jpg' alt="One legged downdog" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/3.jpg' alt="High lunge" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/4.jpg' alt="Warrior 2" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/5.jpg" alt="Reverse warrior" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/6.jpg' alt="High lunge" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/7.jpg" alt="Side plank" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/8.jpg" alt="rockstar pose" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/9.jpg" alt="Seated twist" />
                </div>
                <div>
                    <img src="/images/Zsuzsi/10.jpg" alt="Plank" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/11.jpg' alt="Upward facing dog pose" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/12.jpg' alt="Downward facing dog pose" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/13.jpg' alt="Figure four chair pose" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/14.jpg' alt="Warrior 3" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/15.jpg' alt="Half moon" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/16.jpg' alt="Halflift" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/17.jpg' alt="Downward facing dog pose" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/18.jpg' alt="Sit on heels" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/200.jpg' alt="Twist" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/220.jpg' alt="Side stretch" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/230.jpg' alt="Seated cat" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/240.jpg' alt="Tabletop" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/250.jpg' alt="Modified sideplank" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/260.jpg' alt="Child's pose" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/270.jpg' alt="Back stretch" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/280.jpg' alt="Rabbit pose" />
                </div>
                <div>
                    <img src='/images/Zsuzsi/290.jpg' alt="Sit on heels" />
                </div>
            </Slider>
        </div>
    );
};

export default Slideshow;
