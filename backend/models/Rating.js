const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    claim_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Claim',
      required: [true, 'Claim ID is required'],
    },
    from_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rater user ID is required'],
    },
    to_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rated user ID is required'],
    },
    score: {
      type: Number,
      required: [true, 'Rating score is required'],
      min: [1, 'Score cannot be less than 1'],
      max: [5, 'Score cannot exceed 5'],
    },
    comment: {
      type: String,
      maxlength: [300, 'Comment cannot exceed 300 characters'],
      trim: true,
      default: '',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double rating for the same claim by the same user
ratingSchema.index({ claim_id: 1, from_user: 1 }, { unique: true });
ratingSchema.index({ to_user: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
