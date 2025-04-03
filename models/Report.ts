import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  contentType: {
    type: String,
    enum: ['event', 'place', 'opportunity', 'shop', 'post' , 'user'],
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'inappropriate',
      'spam',
      'offensive',
      'fake',
      'scam',
      'violence',
      'copyright',
      'fake_account',
      'impersonation',
      'spam',
      'harassment',
      'hate_speech',
      'scam',
      'inappropriate_content',
      'fake_business',
      'other'
    ]
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);