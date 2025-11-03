const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/userModel');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // 1. Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users.');

    // 2. Admin + Students from the image
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
    ];

    // Hash passwords
    const processedUsers = usersToSeed.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 10),
    }));

    await User.insertMany(processedUsers);
    console.log('Admin and student users seeded successfully.');

  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDatabase();
