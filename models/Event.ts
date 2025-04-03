import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  mainMedia: {
    type: String,
    required: true
  },
  additionalMedia: [String],
  country: {
    type: String,
    required: true
  },
  coordinates: String,
  address: {
    type: String,
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
  interests: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    interestedAt: {
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

export const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);