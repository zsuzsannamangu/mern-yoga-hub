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
      console.warn('reCAPTCHA site key not found in environment variables');
      return;
    }

    // Check if script is already loaded
    if (document.querySelector(`script[src*="recaptcha"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Failed to load reCAPTCHA script');
      Swal.fire({
        icon: 'warning',
        title: 'reCAPTCHA Loading Issue',
        text: 'reCAPTCHA failed to load. You can still submit the form, but verification may not work properly.',
        confirmButtonText: 'OK'
      });
    };

    document.body.appendChild(script);

    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => {
          console.log('reCAPTCHA loaded successfully');
        });
      } else {
        console.error('reCAPTCHA not available after script load');
        Swal.fire({
          icon: 'warning',
          title: 'reCAPTCHA Not Ready',
          text: 'reCAPTCHA is not ready. Please refresh the page if you encounter issues.',
          confirmButtonText: 'OK'
        });
      }
    };

    return () => {
      // Only remove if we added it
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
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

    // Validate required fields
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Information',
        text: 'Please fill in all required fields.',
        confirmButtonText: 'Got it'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Email',
        text: 'Please enter a valid email address.',
        confirmButtonText: 'Got it'
      });
      return;
    }

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
    let recaptchaToken = null;

    // Try to get reCAPTCHA token if available
    if (window.grecaptcha && siteKey) {
      try {
        recaptchaToken = await window.grecaptcha.execute(siteKey, { action: 'signup_form_submit' });
      } catch (recaptchaError) {
        console.warn('reCAPTCHA failed:', recaptchaError);
        // Continue without reCAPTCHA if it fails
      }
    } else {
      console.warn('reCAPTCHA not available, proceeding without verification');
    }

    try {
      // API call to save form data and signature
      const response = await fetch(`${process.env.REACT_APP_API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          signature: signatureData, 
          recaptchaToken: recaptchaToken || 'bypass' // Send bypass if no token
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.message || errorData.error || "Something went wrong.";

        if (errorMsg.toLowerCase().includes("already")) {
          await Swal.fire({
            icon: 'warning',
            title: 'Already Signed Up',
            text: 'You have already registered for this class.',
            confirmButtonText: 'Okay'
          });

          // Clear form field
          setFormData({ name: "", email: "", phone: "", classTitle: "", date: "", waiver: false });
          setSignatureData(null);
          sigPad.current.clear();

          return; // prevent further execution
        }

        if (errorMsg.toLowerCase().includes("email does not exist")) {
          Swal.fire({
            icon: 'warning',
            title: 'Student Not Found',
            text: "Email not found. Please register as a new student.",
            confirmButtonText: 'Okay'
          });

          return;
        }

        if (errorMsg.toLowerCase().includes("full")) {
          Swal.fire({
            icon: 'warning',
            title: 'Class Full',
            text: 'This class is full. Please select another date.',
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
      setFormData({ name: "", email: "", phone: "", classTitle: "", date: "", waiver: false });
      setSignatureData(null);
      sigPad.current.clear(); // Clear the signature pad after successful submission
    } catch (error) {
      console.error('Signup error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Sign-Up Failed',
        text: `Something went wrong: ${error.message}. Please try again later or contact me if the issue persists.`,
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
          <div className="waiver-text">
            <h4>WAIVER AND RELEASE OF LIABILITY</h4>
            <p>
              I understand that the yoga classes and events offered by Zsuzsanna Mangu are designed to provide a safe and supportive environment for exploring movement, breath, and mindfulness. Participation in all activities is entirely optional, and I am encouraged to adapt or opt out of any movement or activity that does not feel right for me.
            </p>
            <p>By signing this waiver, I acknowledge and agree to the following:</p>
            <ul>
              <li><strong>Voluntary Participation:</strong> I am voluntarily participating in yoga classes, workshops, or events offered by Zsuzsanna Mangu.</li>
              <li><strong>Assumption of Risk:</strong> I am aware that participation involves inherent risks, including but not limited to the potential for physical or psychological discomfort, injury, or the transmission of communicable diseases.</li>
              <li><strong>Release of Liability:</strong> I release and hold harmless Zsuzsanna Mangu, her affiliates, employees, and agents, from any responsibility or liability for injuries, disabilities, or other issues that may arise from my participation in any yoga class, workshop, or event, now and in the future.</li>
              <li><strong>Fitness to Participate:</strong> I affirm that I am physically and mentally fit to participate in yoga classes and events. I understand that I am responsible for monitoring my own limits, modifying activities as needed, and taking rests when appropriate.</li>
              <li><strong>General Applicability:</strong> This waiver applies to all yoga classes, workshops, and events I attend, now and in the future, that are conducted by Zsuzsanna Mangu.</li>
            </ul>
            <p>By signing below, I confirm my understanding of this waiver and my agreement to its terms. I consent to participate with these assurances and release Zsuzsanna Mangu from any liability for any unforeseen outcomes.</p>
          </div>
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