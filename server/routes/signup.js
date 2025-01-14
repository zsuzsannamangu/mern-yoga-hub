const express = require("express");
const router = express.Router();
const sgMail = require("@sendgrid/mail");
const Event = require("../models/Event");
const SignUp = require("../models/SignupModel");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function formatTimeTo12Hour(time) {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(hours, minutes);
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    }).format(date);
}

router.post("/signup", async (req, res) => {
    const { name, email, phone, class: classTitle, date, signature } = req.body;

    if (!name || !email || !phone || !date || !classTitle || !signature) {
        console.error("Missing required fields:", req.body);
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        // Fetch the event details from the database
        const event = await Event.findOne({ title: classTitle, date });
        if (!event) {
            console.error("Event not found:", { classTitle, date });
            return res.status(404).json({ error: "Event not found for the given class and date." });
        }

        const time = event.time ? formatTimeTo12Hour(event.time) : "Time Not Specified";
        const location = event.location || "Location Not Specified";

        // Waiver text
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
        const adminEmail = {
            to: process.env.EMAIL_RECEIVER,
            from: process.env.EMAIL_USER,
            subject: "New Sign Up",
            html: `
                <h2>New Waiver Signed</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Phone:</b> ${phone}</p>
                <p><b>Class:</b> ${classTitle}</p>
                <p><b>Date of Class:</b> ${date}</p>
                <p><b>Time:</b> ${time}</p>
                <p><b>Location:</b> ${location}</p>
                <p>Signature:</p>
                <img src="${signature}" alt="Signature" style="border: 1px solid #000; width: 300px;" />
            `,
        };

        // Email to user
        const userEmail = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: `You're in! Confirmation for ${classTitle} on ${date}`,
            html: `
                <p>Dear ${name},</p>
                <p>Thank you for signing up for the ${classTitle} class on ${date}.</p>
                <p>Here are the details of the class:</p>
                <ul>
                    <li><strong>Date:</strong> ${date}</li>
                    <li><strong>Time:</strong> ${time}</li>
                    <li><strong>Location:</strong> ${location}</li>
                </ul>
                <p>There is no front desk, so please try your best to arrive on time. If you’re running late, text Zsuzsanna at <a href="tel:+15037346656">503-734-6656</a> with your name and estimated time of arrival if possible.</p>
                <p>Below is a copy of the waiver you signed:</p>
                <pre style="white-space: pre-wrap;">${waiverText}</pre>
                <p>Looking forward to seeing you!</p>
                <p>Best regards,<br>Zsuzsanna Mangu</p>
            `,
        };
        await sgMail.send(adminEmail);
        await sgMail.send(userEmail);

        res.status(200).json({ message: "Signup successful and emails sent." });
    } catch (error) {
        console.error("Error in signup route:", error.response?.body || error.message);
        res.status(500).json({ error: "Failed to send emails." });
    }
});

module.exports = router;
 