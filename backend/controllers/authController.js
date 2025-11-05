import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import OTP from '../models/otpModel.js';
import { sendOTPEmail } from '../utils/emailService.js';
import crypto from 'crypto';


const loginUser = async (req, res) => {
  try {
    const { email, password, intendedRole } = req.body;

    if (!email || !password || !intendedRole) {
      return res.status(400).json({ message: 'Please provide email, password, and role.' });
    }

    // find the user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // check if the user exists.
    if (!user) {
      // Use 401 for authentication errors
      return res.status(401).json({ message: 'Account does not exist' });
    }

    //User exists, then check their password.
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
    // Password is correct. Now check if they are on the right portal.
    if (user.role !== intendedRole) {
      return res.status(403).json({ // 403 Forbidden
        message: `This is a ${user.role} account. Please use the ${user.role} login portal.`,
      });
    }

    // all tests passed: User is valid AND on the correct portal.
    
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      committeeType: user.committeeType,
      token: generateToken(user._id),
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong on our end' });
  }
};

const getUserProfile = async (req, res) => {
  res.status(200).json(req.user);
};

// Generate and send OTP for password reset
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address.' });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase() });

    // Save new OTP
    const otpDoc = new OTP({
      email: email.toLowerCase(),
      otp: otp,
    });
    await otpDoc.save();

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp);
    
    if (!emailResult.success) {
      return res.status(500).json({ 
        message: 'Failed to send OTP email. Please try again later.' 
      });
    }
    
    // For development - also log the OTP to console
    console.log(`OTP for ${email}: ${otp}`);

    res.status(200).json({
      message: 'OTP sent successfully to your email address. Please check your inbox.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Something went wrong on our end.' });
  }
};

// Verify OTP and reset password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        message: 'Please provide email, OTP, and new password.' 
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long.' 
      });
    }

    // Find and verify OTP
    const otpDoc = await OTP.findOne({ 
      email: email.toLowerCase(), 
      otp: otp 
    });

    if (!otpDoc) {
      return res.status(400).json({ 
        message: 'Invalid or expired OTP. Please request a new one.' 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Update password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    // Delete the used OTP
    await OTP.deleteOne({ _id: otpDoc._id });

    res.status(200).json({
      message: 'Password reset successfully. You can now login with your new password.',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Something went wrong on our end.' });
  }
};

export { loginUser, getUserProfile,forgotPassword, resetPassword  };


