import mongoose from 'mongoose';

const adSpotSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  placeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place'
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  media: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    }
  }],
  views: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    viewCount: {
      type: Number,
      default: 1
    }
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure that either placeId or shopId is provided, but not both
adSpotSchema.pre('save', function(next) {
  if (this.placeId && this.shopId) {
    next(new Error('Un spot publicitaire ne peut pas être associé à la fois à un lieu et à une boutique'));
  } else if (!this.placeId && !this.shopId) {
    next(new Error('Un spot publicitaire doit être associé à un lieu ou à une boutique'));
  }
  next();
});

export const AdSpot = mongoose.models.AdSpot || mongoose.model('AdSpot', adSpotSchema);