import React, { useRef, useState, useEffect } from "react";
import SignaturePad from "react-signature-canvas";
import "./SignUps.scss";
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { useLocation, useNavigate } from 'react-router-dom'; // use useLocation to retrieve the passed state from Calendar.js

/**
 * Signup component
 * Handles user registration for yoga classes, including collecting personal details,
 * accepting waiver agreement, signing electronically, and verifying submissions with reCAPTCHA.
 */

const Signup = () => {
  const sigPad = useRef(); // Reference for the signature pad
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate(); // React Router navigation hook
  const [signatureData, setSignatureData] = useState(null);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    classTitle: queryParams.get('title') || "", // Retrieve class title from URL params
    date: queryParams.get('date') || "", // Extract class date from query params
    waiver: false,
  });

  useEffect(() => {
    // Load reCAPTCHA script dynamically
    const siteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY;
    if (!siteKey) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    let isRecaptchaReady = false;

    script.onload = () => {
      if (window.grecaptcha) {
        // Show error message if reCAPTCHA fails to load
        window.grecaptcha.ready(() => {
          isRecaptchaReady = true;
          // Perform any action needed when reCAPTCHA is ready
        });
      } else {
        // Handle failure case, such as showing a warning message to the user
        Swal.fire({
          icon: 'error',
          title: 'reCAPTCHA Failed to Load',
          text: 'Please refresh the page or check your internet connection.',
          confirmButtonText: 'OK'
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Clear signature pad
  const clearSignature = () => sigPad.current.clear();

  // Handles form input changes. Updates state dynamically based on input field name and value
  const handleSignatureSave = () => {
    const signature = sigPad.current.toDataURL(); // Save data to backend
    setSignatureData(signature);

    // Show success popup
    Swal.fire({
      icon: 'success',
      title: 'Signature Saved',
      text: 'Click on "Sign Up" to complete your registration for the class.',
      confirmButtonText: 'OK'
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handles form submissions. Validates requires fields, reCAPTCHA and sends the data to the backend.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensures a signature is provided.
    if (!signatureData) {
      Swal.fire({
        icon: 'error',
        title: 'Signature Required',
        text: 'Please sign your name and save your signature before submitting the form.',
        confirmButtonText: 'Got it'
      });
      return;
    }

    const siteKey = process.env.REACT_APP_CAPTCHA_SITE_KEY;
    if (!window.grecaptcha || !siteKey) {
      Swal.fire({
        icon: 'warning',
        title: 'Verification Not Ready',
        text: 'reCAPTCHA is still loading. Please wait a moment and try again.',
        confirmButtonText: 'Okay'
      });
      return;
    }

    try {
      // Generate reCAPTCHA token
      const recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'signup_form_submit' });

      // API call to save form data and signature
      const response = await fetch(`${process.env.REACT_APP_API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, signature: signatureData, recaptchaToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.message || "Something went wrong.";

        if (errorMsg.toLowerCase().includes("already")) {
          await Swal.fire({
            icon: 'warning',
            title: 'Already Signed Up',
            text: 'You’ve already registered for this class.',
            confirmButtonText: 'Okay'
          });

          // Clear form field
          setFormData({ name: "", email: "", phone: "", classTitle: "", date: "", waiver: false });
          setSignatureData(null);
          sigPad.current.clear();

          return; // prevent further execution
        }

        if (errorMsg.toLowerCase().includes("email doesn't exist")) {
          Swal.fire({
            icon: 'warning',
            title: 'Student Not Found',
            text: "Email not found. Please register as a new student.",
            confirmButtonText: 'Okay'
          });

          return;
        }

        throw new Error(errorMsg);
      }

      // Show success message and redirect user
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Sign up successful. \n We sent you a confirmation email.`,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/calendar'); // Navigate to the calendar page
        }
      });

      // Reset form
      setFormData({ name: "", email: "", phone: "", classTitle: "", waiver: false });
      setSignatureData(null);
      sigPad.current.clear(); // Clear the signature pad after successful submission
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Sign-Up Failed',
        text: 'Something went wrong. Please try again later or contact me if the issue persists.',
        confirmButtonText: 'Okay'
      });
    }
  };

  return (
    <div className="signup-container">
      <h2 className="section-title" id="products-section">Sign Up</h2>
      <div className="title-line"></div>
      <form className="signup-form" onSubmit={handleSubmit}>
        <label>
          Full Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Phone Number:
          <input
            type="tel"
            name="phone"
            placeholder="123-456-7890"
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Class:
          <input
            name="classTitle"
            value={formData.classTitle}
            onChange={handleInputChange}
            required
          >
          </input>
        </label>
        <label className="waiver-date">
          Date of Class:
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
          />
        </label>
        <label className="waiver">
          <p readOnly className="waiver-text">
            WAIVER AND RELEASE OF LIABILITY<br></br><br></br>
            I understand that the yoga classes and events offered by Zsuzsanna Mangu are designed to provide a safe and supportive environment for exploring movement, breath, and mindfulness. Participation in all activities is entirely optional, and I am encouraged to adapt or opt out of any movement or activity that does not feel right for me.

            By signing this waiver, I acknowledge and agree to the following:<br></br><br></br>

            Voluntary Participation:
            I am voluntarily participating in yoga classes, workshops, or events offered by Zsuzsanna Mangu.<br></br>

            Assumption of Risk:
            I am aware that participation involves inherent risks, including but not limited to the potential for physical or psychological discomfort, injury, or the transmission of communicable diseases.<br></br>

            Release of Liability:
            I release and hold harmless Zsuzsanna Mangu, her affiliates, employees, and agents, from any responsibility or liability for injuries, disabilities, or other issues that may arise from my participation in any yoga class, workshop, or event, now and in the future.<br></br>

            Fitness to Participate:
            I affirm that I am physically and mentally fit to participate in yoga classes and events. I understand that I am responsible for monitoring my own limits, modifying activities as needed, and taking rests when appropriate.<br></br>

            General Applicability:
            This waiver applies to all yoga classes, workshops, and events I attend, now and in the future, that are conducted by Zsuzsanna Mangu.<br></br><br></br>

            By signing below, I confirm my understanding of this waiver and my agreement to its terms. I consent to participate with these assurances and release Zsuzsanna Mangu from any liability for any unforeseen outcomes.<br></br>
          </p>
        </label>

        <div className="signature-section">
          <h3>Sign below then click save:</h3>
          <SignaturePad
            ref={sigPad}
            canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
          />
          <button type="button" onClick={clearSignature}>
            Clear signature
          </button>
          <button type="button" onClick={handleSignatureSave}>
            Save signature
          </button>
        </div>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;