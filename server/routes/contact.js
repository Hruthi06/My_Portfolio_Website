const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Attempt to send email if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail', // Assuming gmail, can be changed
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.EMAIL_USER, // Send to yourself
                subject: `New Portfolio Message from ${name}`,
                text: `You have received a new message from your portfolio website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
                replyTo: email
            };

            await transporter.sendMail(mailOptions);
            return res.status(200).json({ success: true, message: 'Message sent successfully.' });
        } catch (error) {
            console.error('Email sending failed:', error);
            return res.status(500).json({ error: 'Failed to send email.' });
        }
    } else {
        // Mock success if no env vars set (useful for dev without breaking the site)
        console.warn('EMAIL_USER or EMAIL_PASS not set. Mocking email send logic.');
        return res.status(200).json({ success: true, message: '[MOCK] Message accepted.', mock: true });
    }
});

module.exports = router;
