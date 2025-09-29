const express = require("express");
const router = express.Router();
const sgMail = require("@sendgrid/mail");
const Event = require("../models/Event");
const Signup = require("../models/Signup"); // Unified Signup model
// Import fetch with fallback for different Node.js versions
let fetch;
try {
    // Try to use node-fetch for older Node.js versions
    fetch = require('node-fetch');
} catch (error) {
    // For Node.js 18+, use built-in fetch
    if (typeof globalThis.fetch !== 'undefined') {
        fetch = globalThis.fetch;
    } else {
        console.error('Fetch is not available. reCAPTCHA verification will be skipped.');
        fetch = null;
    }
}

// Fallback fetch implementation using built-in https module
const https = require('https');
const querystring = require('querystring');

function fallbackFetch(url, options) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const postData = querystring.stringify(options.body || {});
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData),
                ...options.headers
            }
        };

        const req = https.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    json: () => Promise.resolve(JSON.parse(data)),
                    status: res.statusCode
                });
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

// Set SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Helper function to format time to 12-hour format
function formatTimeTo12Hour(time) {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    }).format(date);
}

// Signup route
router.post("/signup", async (req, res) => {
    const { recaptchaToken, name, email, phone, classTitle, date, signature } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !date || !classTitle || !signature) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address." });
    }

    try {
        // Handle reCAPTCHA verification (allow bypass for development/testing)
        if (recaptchaToken && recaptchaToken !== 'bypass') {
            const secretKey = process.env.RECAPTCHA_SECRET_KEY;
            if (!secretKey) {
                console.warn('reCAPTCHA secret key not found, skipping verification');
            } else {
                const verifyUrl = `https://www.google.com/recaptcha/api/siteverify`;

                try {
                    // Step 1: Verify reCAPTCHA token
                    if (fetch) {
                        // Use regular fetch with URLSearchParams
                        const recaptchaResponse = await fetch(verifyUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: new URLSearchParams({ secret: secretKey, response: recaptchaToken }),
                        });
                        const recaptchaData = await recaptchaResponse.json();
                        
                        // If reCAPTCHA verification fails
                        if (!recaptchaData.success || recaptchaData.score < 0.5) {
                            return res.status(400).json({
                                error: "Failed reCAPTCHA verification. Please try again.",
                                score: recaptchaData.score,
                            });
                        }
                    } else {
                        // Use fallback fetch
                        const recaptchaResponse = await fallbackFetch(verifyUrl, {
                            method: "POST",
                            headers: { "Content-Type": "application/x-www-form-urlencoded" },
                            body: { secret: secretKey, response: recaptchaToken },
                        });
                        const recaptchaData = await recaptchaResponse.json();
                        
                        // If reCAPTCHA verification fails
                        if (!recaptchaData.success || recaptchaData.score < 0.5) {
                            return res.status(400).json({
                                error: "Failed reCAPTCHA verification. Please try again.",
                                score: recaptchaData.score,
                            });
                        }
                    }
                } catch (recaptchaError) {
                    console.error('reCAPTCHA verification error:', recaptchaError);
                    return res.status(400).json({
                        error: "reCAPTCHA verification failed. Please try again.",
                    });
                }
            }
        } else {
            console.log('reCAPTCHA bypassed or not provided');
        }

        // Step 2: Check if the event exists
        const event = await Event.findOne({ title: classTitle, date });
        if (!event) {
            return res.status(404).json({ error: "Event not found for the given class and date." });
        }

        // Step 3: Check for duplicate signup
        const existingSignup = await Signup.findOne({ email, classTitle, date });
        if (existingSignup) {
            return res.status(400).json({ message: "You have already signed up for this class." });
        }

        // Step 4: Check if the class is full (limit 25 attendees)
        const currentSignups = await Signup.countDocuments({ classTitle, date });
        if (currentSignups >= 25) {
            return res.status(400).json({ message: "This class is full. Please select another date." });
        }

        //save the base64 signature to a file and generate the file path
        const fs = require("fs");
        const path = require("path");

        // Save signature as PNG file
        const base64Data = signature.replace(/^data:image\/png;base64,/, "");
        const fileName = `signature-${Date.now()}.png`;
        const uploadsDir = path.join(__dirname, "..", "uploads");

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
        }

        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, base64Data, "base64");

        // Step 5: Save the signup to the database
        const newSignup = new Signup({
            name,
            email,
            phone,
            classTitle,
            date,
            signatureUrl: `/uploads/${fileName}`,
        });
        await newSignup.save();

        // Step 6: Send confirmation emails:

        // Format event time and location
        const time = event.time ? formatTimeTo12Hour(event.time) : "Time Not Specified";
        const location = event.location || "Location Not Specified";

        //Waiver text
        const waiverText = `
            WAIVER AND RELEASE OF LIABILITY:

            I understand that the yoga classes and events offered by Zsuzsanna Mangu are designed to provide a safe and supportive environment for exploring movement, breath, and mindfulness. Participation in all activities is entirely optional, and I am encouraged to adapt or opt out of any movement or activity that does not feel right for me.

            By signing this waiver, I acknowledge and agree to the following:

            - Voluntary Participation: I am voluntarily participating in yoga classes, workshops, or events offered by Zsuzsanna Mangu.
            - Assumption of Risk: I am aware that participation involves inherent risks, including but not limited to the potential for physical or psychological discomfort, injury, or the transmission of communicable diseases.
            - Release of Liability: I release and hold harmless Zsuzsanna Mangu, her affiliates, employees, and agents, from any responsibility or liability for injuries, disabilities, or other issues that may arise from my participation in any yoga class, workshop, or event, now and in the future.
            - Fitness to Participate: I affirm that I am physically and mentally fit to participate in yoga classes and events. I understand that I am responsible for monitoring my own limits, modifying activities as needed, and taking rests when appropriate.
            - General Applicability: This waiver applies to all yoga classes, workshops, and events I attend, now and in the future, that are conducted by Zsuzsanna Mangu.

            By signing this waiver, I confirm my understanding of this waiver and my agreement to its terms.
        `;

        // Email to admin
        const imageData = fs.readFileSync(filePath).toString("base64");
        const adminEmail = {
            to: process.env.EMAIL_RECEIVER,
            from: process.env.EMAIL_USER,
            subject: "New Sign Up",
            html: `
                <h2>New Signup and Waiver Received</h2>
                <p><b>Name:</b> ${newSignup.name}</p>
                <p><b>Email:</b> ${newSignup.email}</p>
                <p><b>Phone:</b> ${newSignup.phone}</p>
                <p><b>Class:</b> ${newSignup.classTitle}</p>
                <p><b>Date:</b> ${newSignup.date}</p>
                <p><b>Time:</b> ${time}</p>
                <p><b>Location:</b> ${location}</p>
                <pre style="white-space: pre-wrap;">${waiverText}</pre>
                <p><b>Signature:</b></p>
                <img src="cid:signatureImage"/>
            `,
            attachments: [
                {
                    content: imageData,
                    filename: fileName,
                    type: "image/png",
                    disposition: "inline",
                    content_id: "signatureImage",
                },
            ],
        };

        // Email to user
        const userEmail = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: `You're in! Confirmation for ${newSignup.classTitle} on ${newSignup.date}`,
            html: `
              <p>Dear ${newSignup.name},</p>
              <p>Thank you for signing up for the ${newSignup.classTitle} class on ${newSignup.date}.</p>
              <p>Here are the details of the class:</p>
              <ul>
                  <li><strong>Date:</strong> ${newSignup.date}</li>
                  <li><strong>Time:</strong> ${time}</li>
                  <li><strong>Duration:</strong> 60 minutes</li>
                  <li><strong>Location:</strong> ${location}</li>
              </ul>
              <p>If you have any issues on the day of the class, please text me at <a href="tel:+15037346656">503-734-6656</a>.</p>
              
              <p>Below is a copy of the waiver you signed:</p>
              <pre style="white-space: pre-wrap;">${waiverText}</pre>
          
              <p><strong>Your Signature:</strong></p>
              <img src="cid:userSignatureImage" style="max-width: 300px;"/>
          
              <p>Looking forward to seeing you!</p>
              <p>With gratitude,<br>Zsuzsanna</p>
            `,
            attachments: [
                {
                    content: imageData,
                    filename: fileName,
                    type: "image/png",
                    disposition: "inline",
                    content_id: "userSignatureImage", // must match img src
                },
            ],
        };

        // Send emails
        await sgMail.send(adminEmail);
        await sgMail.send(userEmail);

        res.status(200).json({ message: "Signup successful and emails sent." });
    } catch (error) {
        res.status(500).json({ error: "Failed to sign up." });
    }
});

// GET all signups for the admin page
router.get("/admin/signups", async (req, res) => {
    try {
        const signups = await Signup.find(); // Fetch all signups
        res.status(200).json(signups);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch signups." });
    }
});

// DELETE a specific signup by ID on Admin page
router.delete("/signup/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deletedSignup = await Signup.findByIdAndDelete(id);
        if (!deletedSignup) {
            return res.status(404).json({ error: "Signup not found." });
        }
        res.status(200).json({ message: "Signup deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete signup." });
    }
});

// Check if student is returning or new and if returning, register student via email
router.post('/check-student', async (req, res) => {
    const { email, classTitle, date } = req.body;

    // Validate required fields
    if (!email || !classTitle || !date) {
        return res.status(400).json({ error: "Email, class title, and date are required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address." });
    }

    try {
        // Check if the user has signed up for any previous class
        const pastSignup = await Signup.findOne({ email });
        if (!pastSignup) {
            return res.status(404).json({ message: "Email doesn't exist. Please sign up as a new student!" });
        }

        // Check for duplicate signup
        const existingSignup = await Signup.findOne({ email, classTitle, date });
        if (existingSignup) {
            return res.status(400).json({ message: "You have already signed up for this class." });
        }

        // Check if the class is full (limit 25 attendees), prevents race conditions & accidental overbooking to add this here even though there is another route as well: router.get('/class-status')
        const currentSignups = await Signup.countDocuments({ classTitle, date });
        if (currentSignups >= 25) {
            return res.status(400).json({ message: "This class is full. Please select another date." });
        }

        // Otherwise, allow signup (returning student)
        const { name, phone, signatureUrl } = pastSignup; // Retrieve student's previous details
        const newSignup = new Signup({ name, email, phone, classTitle, date, signatureUrl }); // Save the signup to the database
        await newSignup.save();

        // Check if the event exists
        const event = await Event.findOne({ title: classTitle, date });
        if (!event) {
            return res.status(404).json({ error: "Event not found for the given class and date." });
        }

        // Format event time and location
        const time = event.time ? formatTimeTo12Hour(event.time) : "Time Not Specified";
        const location = event.location || "Location Not Specified";

        // Email to user
        const userEmail = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: `You're in! Confirmation for ${classTitle} on ${date}`,
            html: `
                <p>Dear ${name},</p>
                <p>Thank you for signing up for the <strong>${classTitle}</strong> class on <strong>${date}</strong>.</p>
                <p>Here are the details of the class:</p>
                <ul>
                    <li><strong>Date:</strong> ${date}</li>
                    <li><strong>Time:</strong> ${time}</li>
                    <li><strong>Duration:</strong> 60 minutes</li>
                    <li><strong>Location:</strong> ${location}</li>
                </ul>
                <p>If you have any issues on the day of the class, please text me at <a href="tel:+15037346656">503-734-6656</a>.</p>
                <p>Looking forward to seeing you!</p>
                <p>With gratitude,<br>Zsuzsanna</p>
            `,
        };

        // Email to admin
        const adminEmail = {
            to: process.env.EMAIL_RECEIVER,
            from: process.env.EMAIL_USER,
            subject: "Returning Student Signed Up",
            html: `
                <h2>Returning Student Signup</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Phone:</b> ${phone}</p>
                <p><b>Class:</b> ${classTitle}</p>
                <p><b>Date:</b> ${date}</p>
                <p><b>Time:</b> ${time}</p>
                <p><b>Location:</b> ${location}</p>
            `,
        };

        await sgMail.send(userEmail);
        await sgMail.send(adminEmail);

        res.json({ message: 'Sign-up confirmation sent successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Route to check if a class is full
router.get('/class-status', async (req, res) => {
    const { classTitle, date } = req.query; // Retrieve class title and date from query params

    if (!classTitle || !date) {
        return res.status(400).json({ error: "Class title and date are required." });
    }

    try {
        // Count how many people signed up for this class on this date
        const signupCount = await Signup.countDocuments({ classTitle, date });

        // Check if class is full (assuming a max of 25 attendees)
        const isFull = signupCount >= 25;

        res.status(200).json({ isFull, signupCount });
    } catch (error) {
        res.status(500).json({ error: "Failed to check class status." });
    }
});

module.exports = router;
