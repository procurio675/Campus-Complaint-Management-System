import 'dotenv/config';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

// This is your "Error Guard" (Point 2)
// It checks for keys on startup, which is great.
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("CRITICAL ERROR: Cloudinary credentials are not configured.");
  // We throw an error to crash the app on startup if keys are missing.
  throw new Error('Cloudinary credentials are not configured in environment variables');
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 seconds timeout for uploads
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    // We get the user ID from req.user (which 'protect' middleware provides)
    // The 'fileFilter' below already checked if req.user exists.
    const userId = req.user._id.toString();

    return {
      folder: `campus-complaints/${userId}`,
      // Auto-detect if it's a video or image for Cloudinary
      resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    };
  },
});

// File size limit (10MB)
const limits = {
  fileSize: 10 * 1024 * 1024,
};

// This is the new fileFilter function you requested (Point 1)
const fileFilter = (req, file, cb) => {
  // This is the security check for 'anonymous' uploads (Point 3)
  // Your 'protect' middleware should run first, but this is a
  // great "defense-in-depth" check to prevent unauthenticated uploads.
  if (!req.user) {
    const authError = new Error('Not authorized. Please log in to upload files.');
    authError.code = 'UNAUTHENTICATED_UPLOAD';
    return cb(authError, false);
  }

  // This is your file type validation (Point 1)
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Allow file
  } else {
    // Reject file with a specific error
    const typeError = new Error('Invalid file type. Only JPG, PNG, MP4, and MOV are allowed.');
    typeError.code = 'INVALID_FILE_TYPE';
    cb(typeError, false);
  }
};

// Middleware handles uploads to Cloudinary with per-user folders.
export const upload = multer({
  storage,
  limits,
  fileFilter, // We added your new fileFilter here
});