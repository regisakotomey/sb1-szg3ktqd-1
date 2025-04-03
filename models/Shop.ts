import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  organizer: {
    type: {
      type: String,
      enum: ['user', 'place'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'organizer.type'
    }
  },
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  logo: String,
  countries: {
    type: [String],
    required: true
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
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

export const Shop = mongoose.models.Shop || mongoose.model('Shop', shopSchema);