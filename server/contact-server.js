/**
 * Black Eagle AI - Optional Private SMTP Backend Server
 * 
 * Run this if you prefer hosting your own private Node.js backend instead of a form endpoint service.
 * All credentials remain securely inside your server environment (.env) and are never exposed to the frontend.
 */

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure SMTP Transporter (Credentials stored safely on the server)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: process.env.SMTP_USER, // Your sending account / SMTP login
    pass: process.env.SMTP_PASS, // Your private SMTP password or App Password
  },
});

// Contact Form Endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { "Full-Name": name, email, Phone: phone, "Service-Type": service, Message: message } = req.body;

    // Validate inputs
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Email content layout
    const mailOptions = {
      from: `"Black Eagle AI Leads" <${process.env.SMTP_USER}>`,
      to: process.env.RECIPIENT_EMAIL || 'faheemrahamani@gmail.com', // Recipient address
      replyTo: email,
      subject: `New AI Consultation Inquiry from ${name} - Black Eagle AI`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0c121e; color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="color: #6ee7b7; margin-top: 0; font-size: 22px;">New Contact Form Submission</h2>
          <p style="color: #94a3b8; font-size: 14px;">A new inquiry has been received from blackeaglei.com:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
              <td style="padding: 10px 0; color: #94a3b8; width: 140px; font-weight: bold;">Full Name:</td>
              <td style="padding: 10px 0; color: #ffffff;">${name}</td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Email Address:</td>
              <td style="padding: 10px 0; color: #ffffff;"><a href="mailto:${email}" style="color: #6ee7b7;">${email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Phone Number:</td>
              <td style="padding: 10px 0; color: #ffffff;"><a href="tel:${phone}" style="color: #ffffff;">${phone || 'Not provided'}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
              <td style="padding: 10px 0; color: #94a3b8; font-weight: bold;">Service / Project:</td>
              <td style="padding: 10px 0; color: #ffffff;">${service || 'General Inquiry'}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0 6px 0; color: #94a3b8; font-weight: bold; vertical-align: top;">Message:</td>
              <td style="padding: 12px 0 6px 0; color: #ffffff; line-height: 1.6; white-space: pre-wrap;">${message}</td>
            </tr>
          </table>
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 12px; color: #64748b;">
            Sent automatically by Black Eagle AI Notification Engine.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while sending email' });
  }
});

app.listen(PORT, () => {
  console.log(`Black Eagle AI Contact Server running on port ${PORT}`);
});
