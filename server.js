const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const emailjs = require('@emailjs/nodejs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // static files amalgammation

// otp generator
function generateOTP() {
  const digits = '0123456789';
  let otp = '';
  try {
    for (let i = 0; i < 6; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
  } 
  catch (error) {
    console.error('Error generating OTP:', error);
    otp = Math.floor(100000 + Math.random() * 900000).toString();
  }
  return otp;
}

// API route for sending email
app.post('/send-email', async (req, res) => {
  const { email, otp, confirm_url, method } = req.body;

  const templateParams = {
    email: email,
    otp: otp || '',
    confirm_url: confirm_url || '',
    confirmation_link: 'confirmation_link',
    time: '5 minutes',
  };

  const templateID = method === 'otp'
    ? process.env.EMAILJS_TEMPLATE_ID_OTP
    : process.env.EMAILJS_TEMPLATE_ID_PUSH;

  try {
    const result = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      templateID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );
    res.status(200).json({ message: 'Email sent successfully', result });
  } 
  catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ message: 'Email sending failed', error });
  }
});

// Explicit root route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});