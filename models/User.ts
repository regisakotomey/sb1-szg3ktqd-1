import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { 
    type: String,
    unique: true,
    sparse: true
  },
  phone: { 
    type: String,
    unique: true,
    sparse: true
  },
  password: { 
    type: String
  },
  firstName: String,
  lastName: String,
  country: {
    type: String,
    required: true
  },
  sector: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  avatar: String,
  coverImage: String,
  followers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    followedAt: {
      type: Date,
      default: Date.now
    }
  }],
  following: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    followedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);