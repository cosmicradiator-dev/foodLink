const Listing = require('../models/Listing');
const Claim = require('../models/Claim');
const User = require('../models/User');
const generatePickupCode = require('../utils/generatePickupCode');
const notificationService = require('../services/notification.service');

/**
 * Claim a food listing atomically
 * POST /api/claims/:listingId
 */
const claimListing = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    // Atomic findOneAndUpdate to prevent race conditions (double claiming)
    const listing = await Listing.findOneAndUpdate(
      {
        _id: listingId,
        status: 'available',
        expires_at: { $gt: new Date() },
      },
      {
        $set: { status: 'claimed' },
      },
      {
        new: true,
      }
    ).populate('donor_id', 'name organisation_name');

    if (!listing) {
      return res.status(409).json({
        success: false,
        message: 'This food listing is no longer available or has already expired/been claimed.',
      });
    }

    // Generate unique 6-character pickup code
    const pickupCode = generatePickupCode();

    const claim = new Claim({
      listing_id: listing._id,
      recipient_id: req.user._id,
      pickup_code: pickupCode,
      status: 'claimed',
      claimed_at: new Date(),
    });

    await claim.save();
    await claim.populate('recipient_id', 'name organisation_name');

    // Notify donor via Socket.io
    notificationService.notifyDonor(listing.donor_id._id, 'claim:created', {
      message: `${req.user.name} (${req.user.organisation_name || 'Recipient'}) has claimed "${listing.food_type}".`,
      listingId: listing._id,
      claimId: claim._id,
      recipient: {
        name: req.user.name,
        organisation_name: req.user.organisation_name,
      },
    });

    // Broadcast status change so map/list update in real-time
    notificationService.broadcastListingStatusChange(
      listing._id,
      'claimed',
      listing
    );

    return res.status(201).json({
      success: true,
      message: 'Listing claimed successfully! Present your pickup code when receiving the food.',
      data: {
        claim,
        listing,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm pickup with verification code (Donor confirms code given by recipient/volunteer)
 * POST /api/claims/:claimId/confirm-pickup
 */
const confirmPickup = async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { pickupCode } = req.body;

    if (!pickupCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the 4-digit pickup verification code.',
      });
    }

    const claim = await Claim.findById(claimId).populate('listing_id');
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim record not found.',
      });
    }

    const listing = await Listing.findById(claim.listing_id);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Associated listing not found.',
      });
    }

    // Only the donor or an admin can confirm pickup
    if (listing.donor_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only the donor of this food can verify the pickup code.',
      });
    }

    if (claim.status === 'picked_up') {
      return res.status(400).json({
        success: false,
        message: 'This food has already been marked as picked up.',
      });
    }

    // Verify code (case-insensitive)
    if (claim.pickup_code.trim().toUpperCase() !== pickupCode.trim().toUpperCase()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup code. Please ask the recipient or volunteer for their code.',
      });
    }

    const now = new Date();
    claim.status = 'picked_up';
    claim.picked_up_at = now;
    await claim.save();

    listing.status = 'picked_up';
    await listing.save();

    // Notify recipient and volunteer
    notificationService.notifyRecipient(claim.recipient_id, 'claim:picked_up', {
      message: `Pickup confirmed for "${listing.food_type}"! Please rate your experience.`,
      claimId: claim._id,
      listingId: listing._id,
      promptRating: true,
      partnerId: listing.donor_id,
    });

    if (claim.volunteer_id) {
      notificationService.notifyVolunteer(claim.volunteer_id, 'claim:picked_up', {
        message: `Delivery completed for "${listing.food_type}"! Thank you for your service.`,
        claimId: claim._id,
      });
    }

    notificationService.broadcastListingStatusChange(
      listing._id,
      'picked_up',
      listing
    );

    return res.status(200).json({
      success: true,
      message: 'Pickup verified and confirmed successfully!',
      data: {
        claim,
        listing,
        promptRating: true,
        recipientId: claim.recipient_id,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a claim (re-opens the listing to available)
 * POST /api/claims/:claimId/cancel
 */
const cancelClaim = async (req, res, next) => {
  try {
    const { claimId } = req.params;

    const claim = await Claim.findById(claimId).populate('listing_id');
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'Claim not found.',
      });
    }

    // Must be the recipient, volunteer, or admin
    const isRecipient = claim.recipient_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isRecipient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot cancel this claim.',
      });
    }

    if (claim.status === 'picked_up') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a claim that has already been picked up.',
      });
    }

    claim.status = 'cancelled';
    claim.cancelled_at = new Date();
    await claim.save();

    // Revert listing to available if not expired
    const listing = await Listing.findById(claim.listing_id);
    if (listing) {
      if (new Date(listing.expires_at) > new Date()) {
        listing.status = 'available';
      } else {
        listing.status = 'expired';
      }
      await listing.save();

      // Notify donor
      notificationService.notifyDonor(listing.donor_id, 'claim:cancelled', {
        message: `Claim for "${listing.food_type}" was cancelled. It is now listed as ${listing.status}.`,
        listingId: listing._id,
      });

      notificationService.broadcastListingStatusChange(
        listing._id,
        listing.status,
        listing
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Claim cancelled successfully. Listing has been restored.',
      data: {
        claim,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user's claims (recipient view)
 * GET /api/claims/my
 */
const getUserClaims = async (req, res, next) => {
  try {
    const claims = await Claim.find({ recipient_id: req.user._id })
      .populate({
        path: 'listing_id',
        populate: {
          path: 'donor_id',
          select: 'name organisation_name address phone trust_score',
        },
      })
      .populate('volunteer_id', 'name phone trust_score')
      .sort({ claimed_at: -1 });

    return res.status(200).json({
      success: true,
      count: claims.length,
      data: {
        claims,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get claim details for a specific listing (donor view)
 * GET /api/claims/listing/:listingId
 */
const getListingClaim = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    if (listing.donor_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Access denied.',
      });
    }

    const claim = await Claim.findOne({
      listing_id: listingId,
      status: { $in: ['claimed', 'picked_up'] },
    })
      .populate('recipient_id', 'name email phone organisation_name trust_score')
      .populate('volunteer_id', 'name phone trust_score');

    return res.status(200).json({
      success: true,
      data: {
        claim,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  claimListing,
  confirmPickup,
  cancelClaim,
  getUserClaims,
  getListingClaim,
};
