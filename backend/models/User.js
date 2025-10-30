const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student','committee'], default: 'student' },
  committeeType: { 
    type: String, required: function() { return this.role === 'committee'; },
    enum: ['Canteen', 'Hostel', 'Sports', 'Tech Committee', 'Disciplinary Action', 'Maintenance']
  },
});

module.exports = mongoose.model('User', userSchema);
