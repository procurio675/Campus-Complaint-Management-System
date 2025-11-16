import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/userModel.js';
import Complaint from './models/Complaint.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load backend/.env using a platform-correct path derived from import.meta.url.
const envPath = fileURLToPath(new URL('./.env', import.meta.url));
dotenv.config({ path: envPath });

const seedDatabase = async () => {
  try {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB connected for seeding...');
    } catch (connErr) {
      // If SSL/TLS errors occur (common on some Windows/OpenSSL combos with Atlas),
      // try a more permissive TLS option as a fallback for local seeding only.
      const msg = String(connErr && connErr.message).toLowerCase();
      if (msg.includes('ssl') || msg.includes('tls') || msg.includes('alert')) {
        console.warn('Initial MongoDB connection failed with SSL/TLS error, retrying with relaxed TLS options (insecure, for local/dev seeding only)...');
        await mongoose.connect(process.env.MONGO_URI, {
          tls: true,
          tlsAllowInvalidCertificates: true,
          tlsInsecure: true,
        });
        console.log('MongoDB connected for seeding (insecure TLS fallback).');
      } else {
        throw connErr;
      }
    }

    // 1. Clear existing complaints so they don't reference old user IDs
    await Complaint.deleteMany({});
    console.log('Cleared existing complaints.');

    // 2. Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users.');

    // 3. Admin + Students + Committee Members
    const usersToSeed = [
      { name: 'College Admin', email: 'admin@dau.ac.in', password: 'admin123', role: 'admin' },

      // Students (IDs and names as in image)
      { name: 'Neel Shah', email: '202301093@dau.ac.in', password: 'neel123', role: 'student' },
      { name: 'Abhishek Kothari', email: '202301128@dau.ac.in', password: 'abhishek123', role: 'student' },
      { name: 'Harshvir Singh', email: '202301080@dau.ac.in', password: 'harshvir123', role: 'student' },
      { name: 'Kanani Tirth', email: '202301075@dau.ac.in', password: 'tirth123', role: 'student' },
      { name: 'Krutant Rajesh Jethva', email: '202301120@dau.ac.in', password: 'krutant123', role: 'student' },
      { name: 'Patel Krish Bhaveshkumar', email: '202301078@dau.ac.in', password: 'krish123', role: 'student' },
      { name: 'Het Ladani', email: '202301102@dau.ac.in', password: 'het123', role: 'student' },
      { name: 'Rajdeep Patel', email: '202301092@dau.ac.in', password: 'rajdeep123', role: 'student' },
      { name: 'Sanya Vaishnavi', email: '202301117@dau.ac.in', password: 'sanya123', role: 'student' },
      { name: 'Krish R Malhotra', email: '202301099@dau.ac.in', password: 'malhotra123', role: 'student' },

      // Committee Members (one for each committee type)
      { name: 'Cafeteria Management Committee', email: 'canteen@dau.ac.in', password: 'canteen123', role: 'committee', committeeType: 'Canteen' },
      { name: 'Hostel Management Committee', email: 'hostel@dau.ac.in', password: 'hostel123', role: 'committee', committeeType: 'Hostel' },
      { name: 'Sports Committee', email: 'sports@dau.ac.in', password: 'sports123', role: 'committee', committeeType: 'Sports' },
      { name: 'Tech Support Committee', email: 'tech@dau.ac.in', password: 'tech123', role: 'committee', committeeType: 'Tech' },
      { name: 'Academic Committee', email: 'academic@dau.ac.in', password: 'acad123', role: 'committee', committeeType: 'Academic' },
      { name: 'Internal Complaints Committee', email: 'internalcomplaints@dau.ac.in', password: 'internal123', role: 'committee', committeeType: 'Internal Complaints' },
      { name: 'Annual Fest Committee', email: 'annualfest@dau.ac.in', password: 'annual123', role: 'committee', committeeType: 'Annual Fest' },
      { name: 'Cultural Committee', email: 'cultural@dau.ac.in', password: 'cult123', role: 'committee', committeeType: 'Cultural' },
      { name: 'Student Placement Cell', email: 'placement@dau.ac.in', password: 'placement123', role: 'committee', committeeType: 'Placement' },
      
    ];

    // Hash passwords
    const processedUsers = usersToSeed.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 10),
    }));

    await User.insertMany(processedUsers);
    console.log('Admin, student, and committee users seeded successfully.');

  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDatabase();
