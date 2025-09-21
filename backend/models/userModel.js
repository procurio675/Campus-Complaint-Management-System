import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add a full name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'committee', 'admin'], // Role must be one of these values
      default: 'student',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const User = mongoose.model('User', userSchema);

export default User;