import mongoose from 'mongoose';

const adSpotCommentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adSpotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdSpot',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const AdSpotComment = mongoose.models.AdSpotComment || mongoose.model('AdSpotComment', adSpotCommentSchema);