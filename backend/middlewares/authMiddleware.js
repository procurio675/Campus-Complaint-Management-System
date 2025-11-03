import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

// protected middleware to secure routes
const protect = async (req, res, next) => {
  let token;

  // Check if the request has an "Authorization" header that starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token part
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user from the database using the ID that was in the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
      
    } catch (error) {
      // errors if the token is expired or invalid
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // error token not found
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// NEW: Middleware to check for specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is attached by the 'protect' middleware
    if (!req.user||!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Forbidden: This resource is only accessible by users with the role(s): ${roles.join(', ')}` 
      });
    }
    next();
  };
};

export { protect, authorize };
