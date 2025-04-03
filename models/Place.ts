import mongoose from 'mongoose';

const openingHoursSchema = new mongoose.Schema({
  day: String,
  isOpen: Boolean,
  openTime: String,
  closeTime: String
});

const placeSchema = new mongoose.Schema({
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
  shortDescription: {
    type: String,
    required: true
  },
  longDescription: String,
  services: String,
  logo: String,
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
  openingHours: [openingHoursSchema],
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

export const Place = mongoose.models.Place || mongoose.model('Place', placeSchema);