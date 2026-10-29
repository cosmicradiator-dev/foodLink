const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    donor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Donor ID is required'],
    },
    food_type: {
      type: String,
      required: [true, 'Please specify the food type'],
      trim: true,
      maxlength: [100, 'Food type cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description of the food'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    servings: {
      type: Number,
      required: [true, 'Please specify the number of servings'],
      min: [1, 'Servings must be at least 1'],
    },
    veg_flag: {
      type: Boolean,
      default: true,
    },
    food_nature: {
      type: String,
      enum: ['cooked', 'packaged'],
      default: 'cooked',
    },
    prepared_at: {
      type: Date,
      required: [true, 'Please specify preparation time'],
    },
    expires_at: {
      type: Date,
      required: [true, 'Please specify expiration time'],
    },
    location: {
      type: pointSchema,
      required: [true, 'Listing location is required'],
    },
    address: {
      type: String,
      required: [true, 'Pickup address is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['available', 'claimed', 'picked_up', 'expired'],
      default: 'available',
    },
    photo_url: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
listingSchema.index({ location: '2dsphere' });
listingSchema.index({ status: 1 });
listingSchema.index({ expires_at: 1 });
listingSchema.index({ donor_id: 1 });

// Virtual: timeLeft in milliseconds
listingSchema.virtual('timeLeft').get(function () {
  if (!this.expires_at) return 0;
  return Math.max(0, new Date(this.expires_at).getTime() - Date.now());
});

// Virtual: isExpired boolean
listingSchema.virtual('isExpired').get(function () {
  if (!this.expires_at) return false;
  return new Date(this.expires_at).getTime() <= Date.now();
});

module.exports = mongoose.model('Listing', listingSchema);
