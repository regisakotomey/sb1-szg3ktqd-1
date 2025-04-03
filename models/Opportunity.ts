import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  mainImage: {
    type: String,
    required: true
  },
  additionalImages: [String],
  country: {
    type: String,
    required: true
  },
  coordinates: String,
  locationDetails: {
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

export const Opportunity = mongoose.models.Opportunity || mongoose.model('Opportunity', opportunitySchema);