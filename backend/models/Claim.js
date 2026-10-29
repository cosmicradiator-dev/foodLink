const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema(
  {
    listing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing ID is required'],
    },
    recipient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient ID is required'],
    },
    volunteer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['claimed', 'picked_up', 'cancelled'],
      default: 'claimed',
    },
    pickup_code: {
      type: String,
      required: [true, 'Pickup verification code is required'],
      uppercase: true,
      trim: true,
    },
    claimed_at: {
      type: Date,
      default: Date.now,
    },
    picked_up_at: {
      type: Date,
      default: null,
    },
    cancelled_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

claimSchema.index({ listing_id: 1 });
claimSchema.index({ recipient_id: 1 });
claimSchema.index({ volunteer_id: 1 });
claimSchema.index({ status: 1 });

module.exports = mongoose.model('Claim', claimSchema);
