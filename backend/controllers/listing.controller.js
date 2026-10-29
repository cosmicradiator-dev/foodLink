const Listing = require('../models/Listing');
const User = require('../models/User');
const Claim = require('../models/Claim');
const { validationResult } = require('express-validator');
const rankingService = require('../services/ranking.service');
const notificationService = require('../services/notification.service');

/**
 * Create a new surplus food listing
 * POST /api/listings
 */
const createListing = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input parameters',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const {
      food_type,
      description,
      servings,
      veg_flag,
      food_nature,
      prepared_at,
      expires_at,
      address,
      latitude,
      longitude,
    } = req.body;

    // Validate coordinates
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude (-90 to 90) and longitude (-180 to 180) are required.',
      });
    }

    // Process photo URL from multer / Cloudinary
    let photo_url = '';
    if (req.file) {
      photo_url = req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
    } else if (req.body.photo_url) {
      photo_url = req.body.photo_url;
    }

    const listing = new Listing({
      donor_id: req.user._id,
      food_type,
      description,
      servings: Number(servings),
      veg_flag: veg_flag === 'true' || veg_flag === true,
      food_nature: food_nature || 'cooked',
      prepared_at: new Date(prepared_at),
      expires_at: new Date(expires_at),
      location: {
        type: 'Point',
        coordinates: [lon, lat], // GeoJSON order: [longitude, latitude]
      },
      address,
      photo_url,
      status: 'available',
    });

    await listing.save();
    await listing.populate('donor_id', 'name organisation_name trust_score verified');

    // Notify recipients and volunteers via Socket.io
    notificationService.notifyNearbyRecipients(listing);

    return res.status(201).json({
      success: true,
      message: 'Surplus food listing published successfully.',
      data: {
        listing,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get nearby listings sorted by smart ranking
 * GET /api/listings/nearby
 */
const getNearbyListings = async (req, res, next) => {
  try {
    const {
      latitude,
      longitude,
      radius = 10, // Default 10km radius
      vegOnly,
      foodType,
      status = 'available',
    } = req.query;

    const lat = Number(latitude);
    const lon = Number(longitude);
    const hasCoordinates = !isNaN(lat) && !isNaN(lon);

    const filter = {
      status,
      expires_at: { $gt: new Date() },
    };

    if (vegOnly === 'true') {
      filter.veg_flag = true;
    }

    if (foodType) {
      filter.food_type = { $regex: foodType, $options: 'i' };
    }

    let listings = [];

    if (hasCoordinates) {
      const radiusMeters = Number(radius) * 1000;
      // Geospatial query
      try {
        listings = await Listing.find({
          ...filter,
          location: {
            $nearSphere: {
              $geometry: {
                type: 'Point',
                coordinates: [lon, lat],
              },
              $maxDistance: radiusMeters,
            },
          },
        }).populate('donor_id', 'name organisation_name trust_score verified');
      } catch (geoError) {
        // Fallback to normal query if 2dsphere index building is pending
        listings = await Listing.find(filter)
          .populate('donor_id', 'name organisation_name trust_score verified')
          .limit(100);
      }
    } else {
      listings = await Listing.find(filter)
        .populate('donor_id', 'name organisation_name trust_score verified')
        .sort({ expires_at: 1 })
        .limit(50);
    }

    // Apply Smart Ranking: 0.4 * proximity + 0.4 * urgency + 0.2 * quantityFit
    const userCoords = hasCoordinates ? [lon, lat] : [0, 0];
    const rankedListings = rankingService.rankListings(
      listings,
      userCoords,
      Number(radius) || 10
    );

    return res.status(200).json({
      success: true,
      count: rankedListings.length,
      data: {
        listings: rankedListings,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single listing by ID with dynamic privacy rules
 * GET /api/listings/:id
 */
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      'donor_id',
      'name organisation_name trust_score verified'
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    const listingObj = listing.toObject();

    // Check if claimed
    const activeClaim = await Claim.findOne({
      listing_id: listing._id,
      status: { $in: ['claimed', 'picked_up'] },
    }).populate('recipient_id', 'name organisation_name');

    // Phone disclosure rule: Phone is ONLY visible to matched parties
    const currentUserId = req.user ? req.user._id.toString() : null;
    const isDonor = currentUserId && listing.donor_id._id.toString() === currentUserId;
    const isClaimant =
      currentUserId &&
      activeClaim &&
      (activeClaim.recipient_id._id.toString() === currentUserId ||
        (activeClaim.volunteer_id && activeClaim.volunteer_id.toString() === currentUserId));

    if ((isDonor || isClaimant) && activeClaim) {
      // Reveal contact numbers
      const donorWithPhone = await User.findById(listing.donor_id._id).select('+phone');
      const recipientWithPhone = await User.findById(activeClaim.recipient_id._id).select('+phone');

      listingObj.donorContact = donorWithPhone?.phone || 'Not provided';
      listingObj.recipientContact = recipientWithPhone?.phone || 'Not provided';
      listingObj.activeClaim = activeClaim;
    }

    return res.status(200).json({
      success: true,
      data: {
        listing: listingObj,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update listing (Only donor can update own listing if status=available)
 * PUT /api/listings/:id
 */
const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    if (listing.donor_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit your own listings.',
      });
    }

    if (listing.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit listing because its status is already '${listing.status}'.`,
      });
    }

    const {
      food_type,
      description,
      servings,
      veg_flag,
      food_nature,
      prepared_at,
      expires_at,
      address,
      latitude,
      longitude,
    } = req.body;

    if (food_type) listing.food_type = food_type;
    if (description) listing.description = description;
    if (servings) listing.servings = Number(servings);
    if (veg_flag !== undefined) listing.veg_flag = veg_flag === 'true' || veg_flag === true;
    if (prepared_at) listing.prepared_at = new Date(prepared_at);
    if (expires_at) listing.expires_at = new Date(expires_at);
    if (address) listing.address = address;

    if (latitude !== undefined && longitude !== undefined) {
      listing.location = {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
      };
    }

    if (req.file) {
      listing.photo_url = req.file.path || req.file.secure_url || `/uploads/${req.file.filename}`;
    }

    await listing.save();

    notificationService.broadcastListingStatusChange(
      listing._id,
      'updated',
      listing
    );

    return res.status(200).json({
      success: true,
      message: 'Listing updated successfully.',
      data: {
        listing,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel listing (Donor cancels, set status=expired)
 * DELETE /api/listings/:id
 */
const cancelListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Listing not found.',
      });
    }

    if (listing.donor_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only cancel your own listings.',
      });
    }

    if (listing.status === 'picked_up') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a listing that has already been picked up.',
      });
    }

    listing.status = 'expired';
    await listing.save();

    // If there was an active claim, cancel it too
    await Claim.updateMany(
      { listing_id: listing._id, status: 'claimed' },
      { $set: { status: 'cancelled', cancelled_at: new Date() } }
    );

    notificationService.broadcastListingStatusChange(
      listing._id,
      'expired',
      listing
    );

    return res.status(200).json({
      success: true,
      message: 'Listing has been cancelled.',
      data: {
        listing,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current donor's own listings
 * GET /api/listings/my
 */
const getUserListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ donor_id: req.user._id })
      .sort({ created_at: -1 });

    // Populate active claims for each listing
    const listingIds = listings.map((l) => l._id);
    const claims = await Claim.find({
      listing_id: { $in: listingIds },
    }).populate('recipient_id', 'name organisation_name trust_score phone');

    const claimMap = {};
    claims.forEach((c) => {
      claimMap[c.listing_id.toString()] = c;
    });

    const listingsWithClaims = listings.map((l) => {
      const obj = l.toObject();
      obj.claim = claimMap[l._id.toString()] || null;
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: listingsWithClaims.length,
      data: {
        listings: listingsWithClaims,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getNearbyListings,
  getListingById,
  updateListing,
  cancelListing,
  getUserListings,
};
