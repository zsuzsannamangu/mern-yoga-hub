// /* global grecaptcha */
// import React, { useEffect } from 'react';
// import './Home.scss';
// import '../../App.scss';
// import Swal from 'sweetalert2';
// import '@sweetalert2/theme-material-ui/material-ui.css';
// import { getRecaptchaToken } from '../../utils/recaptcha';

// function Home({ showAlert }) {
//   useEffect(() => {
//     // Dynamically add reCAPTCHA script
//     const siteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY;
//     if (!siteKey) {
//       return;
//     }
//     const script = document.createElement('script');
//     script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
//     script.async = true;
//     script.defer = true;
//     document.body.appendChild(script);

//     script.onload = () => {
//       if (window.grecaptcha) {
//         window.grecaptcha.ready(() => {
//           window.grecaptcha.execute(siteKey, { action: 'submit' })
//             .then((token) => {
//               localStorage.setItem('captchaToken', token);
//             })
//             .catch((error) => console.error('Error generating token:', error));
//         });
//       } else {
//         console.error('reCAPTCHA library not loaded.');
//       }
//     };

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const form = e.target; // Reference to the form element

//     const captchaToken = localStorage.getItem('captchaToken');
//     if (!captchaToken) {
//       Swal.fire({
//         title: 'Verification Failed',
//         text: 'We couldn’t verify that you’re human. Please try again.',
//         icon: 'warning',
//         confirmButtonText: 'Retry'
//       });
//       return;
//     }

//     const formData = {
//       name: e.target.name.value.trim(),
//       email: e.target.email.value.trim(),
//       phone: e.target.phone.value.trim(),
//       sessionType: e.target['session-type'].value,
//       message: e.target.message.value.trim(),
//       captchaToken, // Include the token in your request
//     };

//     try {
//       const response = await fetch(`${process.env.REACT_APP_API}/api/publicBookings/request`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to submit the form');
//       }
//       Swal.fire({
//         title: 'Success!',
//         text: 'Your form has been submitted successfully.',
//         icon: 'success',
//         confirmButtonText: 'Great!'
//       });
//       form.reset(); // Clear the form fields after successful submission
//     } catch (error) {
//       Swal.fire({
//         title: 'Oops! Something went wrong!',
//         text: 'We couldn’t submit your form. Please try again later.',
//         icon: 'error',
//         confirmButtonText: 'OK'
//       });
//     }
//   };

//   return (
//     <div className="main-section">
//       <div className="mainTitle">Yoga Teacher and Chocolatier</div>
//       <div className="BookAFreeConsultation_Button">
//         <button onClick={() => document.getElementById('book-section').scrollIntoView({ behavior: 'smooth' })}>
//           Book a Free Session
//         </button>
//       </div>
//       <div className="images-row">
//         <img src="./images/yoga/Zsuzsi_Home_1.jpg" alt="Yoga Vertical" className="left-image" id="homeimage-1" />
//         <img src="./images/yoga/Zsuzsi_Home_2.jpg" alt="Yoga Horizontal" className="left-image" id="homeimage-2" />
//         <img src="./images/yoga/Zsuzsi_Home_4.jpg" alt="Yoga Horizontal" className="left-image" id="homeimage-3" />
//       </div>
//       <div className="main-row" id="about-section">
//         <div className="main-left">
//           <h1 className="section-title">About</h1>
//           <div className="title-line"></div>
//         </div>
//         <div className="right-section">
//           <p>In my work, I create a space for gentle exploration and grounded presence. Together, we’ll journey through practices of movement and stillness, attuning to the wisdom within the body and nurturing a path to balance.</p>
//           <p>I weave together somatic practices, breathwork, Ayurvedic wisdom, meditation, sensory experiences, and movement to support holistic well-being. My approach includes mindful vinyasa flow, restorative and adaptive yoga, and mindfulness practices, creating space for self-compassion,
//             balance, and a deeper connection to the present moment.</p>
//         </div>
//       </div>
//       <div className="main-row" id="book-section">
//         <div className="main-left">
//           <h1 className="section-title">Book</h1>
//           <div className="title-line"></div>
//         </div>
//         <div className="right-section">
//           <p>Book a free 30-minute online session where we’ll take time to connect and talk about you and any goals you might have. Together, we’ll create a plan for your journey, focusing on what matters most
//             to you—whether it’s building a personalized practice, finding support on your path to healing, or cultivating mindfulness with gentle guidance.</p>
//           <form className="booking-form" onSubmit={handleSubmit}>
//             <label>
//               <input type="text" name="name" placeholder="Name" required />
//             </label>
//             <label>
//               <input type="email" name="email" placeholder="Email" required />
//             </label>
//             <label>
//               <input type="tel" name="phone" placeholder="Phone" required />
//             </label>
//             <label>
//               What are you interested in?
//               <select name="session-type" required>
//                 <option value="private yoga">Individual Yoga Class</option>
//                 <option value="group yoga">Group Yoga Class</option>
//                 <option value="yoga therapy">Yoga Therapy Session</option>
//               </select>
//             </label>
//             <label>
//               Message
//               <textarea name="message" rows="10" placeholder="Anything you want me to know? (No sensitive information here please!)" />
//             </label>
//             <div id="recaptcha-container" className="g-recaptcha"></div>
//             <button type="submit">Submit</button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Home;


/* global grecaptcha */
import React, { useEffect } from 'react';
import './Home.scss';
import '../../App.scss';
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { getRecaptchaToken } from '../../utils/recaptcha';

function Home({ showAlert }) {
  useEffect(() => {
    // Clear any old tokens on mount (optional)
    localStorage.removeItem('captchaToken');

    // You could prefetch a token here if you like, or just do it on submit
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target; // Reference to the form element

    try {
      // 🔐 Generate reCAPTCHA token on form submit
      const captchaToken = await getRecaptchaToken('public_booking');

      if (!captchaToken) {
        throw new Error('Missing reCAPTCHA token');
      }

      const formData = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        sessionType: form['session-type'].value,
        message: form.message.value.trim(),
        captchaToken,
      };

      const response = await fetch(`${process.env.REACT_APP_API}/api/publicBookings/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit the form');
      }

      Swal.fire({
        title: 'Success!',
        text: 'Your form has been submitted successfully.',
        icon: 'success',
        confirmButtonText: 'Great!',
      });

      form.reset();
    } catch (error) {
      console.error('Form submit error:', error);
      Swal.fire({
        title: 'Oops! Something went wrong!',
        text: 'We couldn’t submit your form. Please try again later.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className="main-section">
      <div className="mainTitle">Yoga Teacher and Chocolatier</div>
      <div className="BookAFreeConsultation_Button">
        <button onClick={() => document.getElementById('book-section').scrollIntoView({ behavior: 'smooth' })}>
          Book a Free Session
        </button>
      </div>
      <div className="images-row">
        <img src="./images/yoga/Zsuzsi_Home_1.jpg" alt="Yoga Vertical" className="left-image" id="homeimage-1" />
        <img src="./images/yoga/Zsuzsi_Home_2.jpg" alt="Yoga Horizontal" className="left-image" id="homeimage-2" />
        <img src="./images/yoga/Zsuzsi_Home_4.jpg" alt="Yoga Horizontal" className="left-image" id="homeimage-3" />
      </div>
      <div className="main-row" id="about-section">
        <div className="main-left">
          <h1 className="section-title">About</h1>
          <div className="title-line"></div>
        </div>
        <div className="right-section">
          <p>In my work, I create a space for gentle exploration and grounded presence. Together, we’ll journey through practices of movement and stillness, attuning to the wisdom within the body and nurturing a path to balance.</p>
          <p>I weave together somatic practices, breathwork, Ayurvedic wisdom, meditation, sensory experiences, and movement to support holistic well-being. My approach includes mindful vinyasa flow, restorative and adaptive yoga, and mindfulness practices, creating space for self-compassion,
            balance, and a deeper connection to the present moment.</p>
        </div>
      </div>
      <div className="main-row" id="book-section">
        <div className="main-left">
          <h1 className="section-title">Book</h1>
          <div className="title-line"></div>
        </div>
        <div className="right-section">
          <p>Book a free 30-minute online session where we’ll take time to connect and talk about you and any goals you might have. Together, we’ll create a plan for your journey, focusing on what matters most
            to you—whether it’s building a personalized practice, finding support on your path to healing, or cultivating mindfulness with gentle guidance.</p>
          <form className="booking-form" onSubmit={handleSubmit}>
            <label>
              <input type="text" name="name" placeholder="Name" required />
            </label>
            <label>
              <input type="email" name="email" placeholder="Email" required />
            </label>
            <label>
              <input type="tel" name="phone" placeholder="Phone" required />
            </label>
            <label>
              What are you interested in?
              <select name="session-type" required>
                <option value="private yoga">Individual Yoga Class</option>
                <option value="group yoga">Group Yoga Class</option>
                <option value="yoga therapy">Yoga Therapy Session</option>
              </select>
            </label>
            <label>
              Message
              <textarea name="message" rows="10" placeholder="Anything you want me to know? (No sensitive information here please!)" />
            </label>
            <button type="submit">Submit</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
