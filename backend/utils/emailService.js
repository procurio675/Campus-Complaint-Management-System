import nodemailer from 'nodemailer';

// Create transporter (using Gmail as example - can be configured for other providers)
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_PASS in .env file');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use app password for Gmail
    },
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - Campus Complaint Management System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You have requested to reset your password for the Campus Complaint Management System.</p>
          <p>Your One-Time Password (OTP) is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This OTP is valid for only <strong>5 minutes</strong></li>
            <li>Do not share this OTP with anyone</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>
          <p>Best regards,<br>Campus Complaint Management System</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

export default { sendOTPEmail };
