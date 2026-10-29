'use strict';

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reported_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reported_listing_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for the report'],
      enum: ['fake_listing', 'spoiled_food', 'no_show', 'abusive_behaviour', 'spam', 'other'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
    },
    resolved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolved_at: Date,
    resolution_note: {
      type: String,
      trim: true,
      maxlength: [300, 'Resolution note cannot exceed 300 characters'],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

reportSchema.index({ status: 1, created_at: -1 });

module.exports = mongoose.model('Report', reportSchema);
