const Claim = require('../models/Claim');
const Listing = require('../models/Listing');
const notificationService = require('../services/notification.service');
const { calculateDistanceKm } = require('../services/ranking.service');

/**
 * Get open delivery tasks available for volunteers
 * GET /api/volunteer/tasks
 */
const getOpenTasks = async (req, res, next) => {
  try {
    const { latitude, longitude, maxDistance = 10 } = req.query;

    const lat = Number(latitude);
    const lon = Number(longitude);
    const hasCoordinates = !isNaN(lat) && !isNaN(lon);

    // Find all active claims where no volunteer is assigned yet
    const openClaims = await Claim.find({
      status: 'claimed',
      volunteer_id: null,
    })
      .populate({
        path: 'listing_id',
        populate: {
          path: 'donor_id',
          select: 'name organisation_name address phone location trust_score',
        },
      })
      .populate('recipient_id', 'name organisation_name address phone location trust_score')
      .sort({ claimed_at: -1 });

    let tasks = openClaims.map((claim) => {
      const claimObj = claim.toObject();
      let distanceKm = null;

      if (
        hasCoordinates &&
        claimObj.listing_id &&
        claimObj.listing_id.location &&
        claimObj.listing_id.location.coordinates
      ) {
        const [listLon, listLat] = claimObj.listing_id.location.coordinates;
        distanceKm = calculateDistanceKm(lat, lon, listLat, listLon);
      }

      return {
        ...claimObj,
        distanceKm: distanceKm !== null ? Number(distanceKm.toFixed(2)) : null,
      };
    });

    // Filter by maxDistance if coordinates are provided
    if (hasCoordinates) {
      tasks = tasks.filter((t) => t.distanceKm === null || t.distanceKm <= Number(maxDistance));
      tasks.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    }

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept delivery task
 * POST /api/volunteer/tasks/:claimId/accept
 */
const acceptTask = async (req, res, next) => {
  try {
    const { claimId } = req.params;

    const claim = await Claim.findOne({
      _id: claimId,
      status: 'claimed',
      volunteer_id: null,
    }).populate('listing_id');

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: 'This delivery task is no longer available or has already been accepted.',
      });
    }

    claim.volunteer_id = req.user._id;
    await claim.save();

    await claim.populate([
      {
        path: 'listing_id',
        populate: {
          path: 'donor_id',
          select: 'name organisation_name address phone trust_score',
        },
      },
      {
        path: 'recipient_id',
        select: 'name organisation_name address phone trust_score',
      },
    ]);

    // Notify recipient and donor
    notificationService.notifyRecipient(claim.recipient_id._id, 'volunteer:assigned', {
      message: `Volunteer ${req.user.name} has accepted to deliver your food!`,
      volunteer: {
        name: req.user.name,
        phone: req.user.phone || 'Available on request',
      },
      claimId: claim._id,
    });

    notificationService.notifyDonor(claim.listing_id.donor_id._id, 'volunteer:assigned', {
      message: `Volunteer ${req.user.name} will arrive to pick up "${claim.listing_id.food_type}".`,
      volunteer: {
        name: req.user.name,
        phone: req.user.phone || 'Available on request',
      },
      claimId: claim._id,
    });

    return res.status(200).json({
      success: true,
      message: 'Delivery task accepted! Contact info has been unlocked.',
      data: {
        task: claim,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get volunteer's assigned tasks
 * GET /api/volunteer/my-tasks
 */
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Claim.find({ volunteer_id: req.user._id })
      .populate({
        path: 'listing_id',
        populate: {
          path: 'donor_id',
          select: 'name organisation_name address phone trust_score',
        },
      })
      .populate('recipient_id', 'name organisation_name address phone trust_score')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOpenTasks,
  acceptTask,
  getMyTasks,
};
