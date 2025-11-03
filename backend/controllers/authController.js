import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

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

export { loginUser, getUserProfile };

