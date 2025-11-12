import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("Cloudinary credentials missing");
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

async function testUpload() {
  try {
    const result = await cloudinary.uploader.upload('test.jpg', {
      folder: 'test',
      allowed_formats: ['jpg', 'jpeg', 'png'],
      resource_type: 'image',
    });
    console.log('Upload success:', result.secure_url);
  } catch (error) {
    console.error('Upload error:', error);
  }
}

testUpload();