import React from 'react';
import './Home.scss';
import '../../App.scss';

function Home({ showAlert }) {
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        name: e.target.name.value,
        email: e.target.email.value,
        phone: e.target.phone.value,
        sessionType: e.target['session-type'].value,
        message: e.target.message.value,
      };

      // Send form data to backend
      const response = await fetch('http://localhost:5001/api/publicBookings/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });


      if (!response.ok) {
        throw new Error('Failed to submit the form');
      }

      showAlert('Success!', 'Your request has been submitted successfully.', 'success');
      e.target.reset(); // Reset form after submission
    } catch (error) {
      console.error('Error submitting form:', error.message);
      showAlert('Error!', 'Failed to submit the form. Please try again.', 'error');
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
        <img src="./images/yoga/Zsuzsi_Home_2.jpg" alt="Yoga Horizontal" className="left-image" id="homeimage-2"/>
        <img src="./images/yoga/Zsuzsi_Home_4.jpg" alt="Yoga Horizontal" className="left-image"id="homeimage-3"/>
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
          <p>Book a free 30-minute online session to discuss your unique goals and needs. During this session, we’ll take time to connect, discuss your aspirations, and uncover what resonates with you most. Whether you’re seeking a personalized practice, 
            support for well-being, or guidance in cultivating mindfulness, this half hour is dedicated to you.</p>
          <p>To book your first (free) session, simply fill out this form, and I will get back to you within 24 hours. Alternatively, create an account to manage your bookings and select time slots directly. <a href="/register">Create an account</a></p>
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
                <option value="private">Individual Yoga Class</option>
                <option value="couples">Partner Yoga Class</option>
                <option value="group">Group Yoga Class</option>
                <option value="therapy">Yoga Therapy Session</option>
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
