import React, { useRef, useState } from "react";
import SignaturePad from "react-signature-canvas";
import "./SignUps.scss";
import Swal from 'sweetalert2';
import '@sweetalert2/theme-material-ui/material-ui.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useLocation } from 'react-router-dom'; // use useLocation to retrieve the passed state from Calendar.js

const Signup = () => {
  const sigPad = useRef();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate(); // Define navigate
  const [signatureData, setSignatureData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    class: queryParams.get('title') || "",
    date: queryParams.get('date') || "", // Extract from query params
    waiver: false,
  });

  const clearSignature = () => sigPad.current.clear();

  const handleSignatureSave = () => {
    const signature = sigPad.current.toDataURL(); // Save this data to your backend
    setSignatureData(signature);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!signatureData) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Please sign and press "save signature" to complete!`,
      })
      return;
    }

    try {
      // Mock API call to save form data and signature
      const response = await fetch("http://localhost:5001/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, signature: signatureData }),
      });

      if (!response.ok) throw new Error("Failed to submit signup form.");

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Sign up successful. \n We sent you a confirmation email.`,
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/calendar'); // Navigate to the calendar page
        }
      });
      setFormData({ name: "", email: "", phone: "", class: "", waiver: false });
      setSignatureData(null);
      sigPad.current.clear(); // Clear the signature pad after successful submission
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to sign up. Please try again later.`,
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
            name="class"
            value={formData.class}
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
            Clear
          </button>
          <button type="button" onClick={handleSignatureSave}>
            Save
          </button>
        </div>

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
