import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export const VerificationCode = mongoose.models.VerificationCode || 
  mongoose.model('VerificationCode', verificationCodeSchema);