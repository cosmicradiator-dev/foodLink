'use strict';

const Listing = require('../models/Listing');
const Claim = require('../models/Claim');
const User = require('../models/User');

/**
 * Get overall platform impact statistics
 * GET /api/dashboard/impact
 */
const getImpactStats = async (req, res, next) => {
  try {
    // Meals saved = sum of servings from all picked_up listings
    const mealsSavedResult = await Listing.aggregate([
      { $match: { status: 'picked_up' } },
      { $group: { _id: null, totalServings: { $sum: '$servings' } } },
    ]);
    const mealsSaved = mealsSavedResult[0]?.totalServings || 0;

    // kg diverted: 1 serving ≈ 0.35 kg
    const kgDiverted = parseFloat((mealsSaved * 0.35).toFixed(1));

    // Top 5 donors by number of picked_up listings
    const topDonors = await Listing.aggregate([
      { $match: { status: 'picked_up' } },
      { $group: { _id: '$donor_id', count: { $sum: 1 }, totalServings: { $sum: '$servings' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'donor',
        },
      },
      { $unwind: '$donor' },
      {
        $project: {
          _id: 1,
          count: 1,
          totalServings: 1,
          'donor.name': 1,
          'donor.organisation_name': 1,
          'donor.avatar_url': 1,
          'donor.trust_score': 1,
        },
      },
    ]);

    // Peak waste hours: group picked_up claims by hour of the day
    const peakHoursRaw = await Claim.aggregate([
      { $match: { status: 'picked_up' } },
      { $group: { _id: { $hour: '$picked_up_at' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Build full 24-hour array (fill missing hours with 0)
    const peakHours = Array.from({ length: 24 }, (_, hour) => {
      const found = peakHoursRaw.find((h) => h._id === hour);
      return { hour, count: found ? found.count : 0 };
    });

    // Listing counts by status
    const statusCountsRaw = await Listing.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusCounts = { available: 0, claimed: 0, picked_up: 0, expired: 0 };
    statusCountsRaw.forEach((s) => {
      if (s._id in statusCounts) statusCounts[s._id] = s.count;
    });

    // Total donors and recipients counts
    const [totalDonors, totalRecipients, totalVolunteers] = await Promise.all([
      User.countDocuments({ role: 'donor', verified: true }),
      User.countDocuments({ role: 'recipient' }),
      User.countDocuments({ role: 'volunteer' }),
    ]);

    // Recent picked_up listings (last 10)
    const recentPickups = await Listing.find({ status: 'picked_up' })
      .populate('donor_id', 'name organisation_name')
      .sort({ updated_at: -1 })
      .limit(10)
      .select('food_type servings veg_flag updated_at');

    return res.status(200).json({
      success: true,
      data: {
        mealsSaved,
        kgDiverted,
        topDonors,
        peakHours,
        statusCounts,
        totalDonors,
        totalRecipients,
        totalVolunteers,
        recentPickups,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user-specific impact stats (for donor profile)
 * GET /api/dashboard/my-impact
 */
const getMyImpact = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const myListings = await Listing.aggregate([
      { $match: { donor_id: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalServings: { $sum: '$servings' },
        },
      },
    ]);

    const summary = { available: 0, claimed: 0, picked_up: 0, expired: 0, totalServings: 0 };
    myListings.forEach((l) => {
      if (l._id in summary) summary[l._id] = l.count;
      if (l._id === 'picked_up') summary.totalServings = l.totalServings;
    });

    const mealsDonated = summary.totalServings;
    const kgDiverted = parseFloat((mealsDonated * 0.35).toFixed(1));

    const user = await User.findById(userId).select('trust_score name');

    return res.status(200).json({
      success: true,
      data: {
        mealsDonated,
        kgDiverted,
        listingCounts: summary,
        trustScore: user?.trust_score || 100,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getImpactStats, getMyImpact };

