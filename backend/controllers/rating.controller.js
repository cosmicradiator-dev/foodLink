'use strict';

const Rating = require('../models/Rating');
const Claim = require('../models/Claim');
const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * Submit a rating after a successful pickup
 * POST /api/ratings
 */
const submitRating = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { claim_id, to_user, score, comment } = req.body;

    // Verify claim exists and is picked_up
    const claim = await Claim.findById(claim_id).populate('listing_id');
    if (!claim) {
      return res.status(404).json({ success: false, message: 'Claim not found.' });
    }

    if (claim.status !== 'picked_up') {
      return res.status(400).json({
        success: false,
        message: 'Ratings can only be submitted after a completed pickup.',
      });
    }

    // Ensure current user is a party to this claim
    const isRecipient = claim.recipient_id.toString() === req.user._id.toString();
    const isVolunteer = claim.volunteer_id && claim.volunteer_id.toString() === req.user._id.toString();
    const listing = claim.listing_id;
    const isDonor = listing && listing.donor_id && listing.donor_id.toString() === req.user._id.toString();

    if (!isRecipient && !isVolunteer && !isDonor) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You are not a party to this claim.',
      });
    }

    // Prevent duplicate ratings
    const existing = await Rating.findOne({ claim_id, from_user: req.user._id });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a rating for this transaction.',
      });
    }

    const rating = await Rating.create({
      claim_id,
      from_user: req.user._id,
      to_user,
      score: Number(score),
      comment: comment || '',
    });

    // Recalculate trust score for the rated user (average of last 20 ratings, scaled to 0-100)
    const recentRatings = await Rating.find({ to_user }).sort({ created_at: -1 }).limit(20).select('score');
    if (recentRatings.length > 0) {
      const avg = recentRatings.reduce((acc, r) => acc + r.score, 0) / recentRatings.length;
      // Scale from 1-5 to 0-100
      const newTrustScore = Math.round(((avg - 1) / 4) * 100);
      await User.findByIdAndUpdate(to_user, { trust_score: newTrustScore });
    }

    return res.status(201).json({
      success: true,
      message: 'Rating submitted successfully.',
      data: { rating },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ratings for a specific user
 * GET /api/ratings/user/:userId
 */
const getUserRatings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [ratings, total] = await Promise.all([
      Rating.find({ to_user: userId })
        .populate('from_user', 'name organisation_name role avatar_url')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Rating.countDocuments({ to_user: userId }),
    ]);

    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length).toFixed(1)
        : null;

    return res.status(200).json({
      success: true,
      count: total,
      data: { ratings, avgRating, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitRating, getUserRatings };

