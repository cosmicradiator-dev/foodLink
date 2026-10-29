'use strict';

const User = require('../models/User');
const Listing = require('../models/Listing');
const Claim = require('../models/Claim');
const Report = require('../models/Report');
const notificationService = require('../services/notification.service');

/**
 * Get all users pending verification
 * GET /api/admin/users/pending
 */
const getPendingUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const roleFilter = req.query.role;

    const query = { verified: false };
    if (roleFilter) query.role = roleFilter;

    const [users, total] = await Promise.all([
      User.find(query).sort({ created_at: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: total,
      data: { users, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (admin view with pagination & search)
 * GET /api/admin/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { search, role, verified } = req.query;

    const query = {};
    if (role) query.role = role;
    if (verified !== undefined) query.verified = verified === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organisation_name: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ created_at: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: total,
      data: { users, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify a user (donor or NGO)
 * PATCH /api/admin/users/:id/verify
 */
const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.verified = true;
    await user.save();

    notificationService.notifyUser(user._id, 'account:verified', {
      message: 'Your account has been verified by an admin. You can now post listings.',
    });

    return res.status(200).json({
      success: true,
      message: `User "${user.name}" has been verified.`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate / suspend a user
 * PATCH /api/admin/users/:id/deactivate
 */
const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot deactivate another admin.' });
    }

    user.verified = false;
    user.trust_score = 0;
    user.refresh_token = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User "${user.name}" has been deactivated.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reports
 * GET /api/admin/reports
 */
const getReports = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'pending';

    const [reports, total] = await Promise.all([
      Report.find({ status })
        .populate('reporter_id', 'name email role')
        .populate('reported_user_id', 'name email role')
        .populate('reported_listing_id', 'food_type status')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments({ status }),
    ]);

    return res.status(200).json({
      success: true,
      count: total,
      data: { reports, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve a report
 * PATCH /api/admin/reports/:id/resolve
 */
const resolveReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    report.status = 'resolved';
    report.resolved_by = req.user._id;
    report.resolved_at = new Date();
    report.resolution_note = req.body.resolution_note || '';
    await report.save();

    return res.status(200).json({ success: true, message: 'Report resolved.', data: { report } });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin removes a fake/inappropriate listing
 * DELETE /api/admin/listings/:id
 */
const removeListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    listing.status = 'expired';
    await listing.save();

    await Claim.updateMany(
      { listing_id: listing._id, status: 'claimed' },
      { $set: { status: 'cancelled', cancelled_at: new Date() } }
    );

    notificationService.broadcastListingStatusChange(listing._id, 'expired', listing);

    return res.status(200).json({
      success: true,
      message: 'Listing has been removed by admin.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all listings (admin view)
 * GET /api/admin/listings
 */
const getAllListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const { status } = req.query;

    const query = {};
    if (status) query.status = status;

    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate('donor_id', 'name email organisation_name verified trust_score')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      count: total,
      data: { listings, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin dashboard quick stats
 * GET /api/admin/stats
 */
const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      pendingVerification,
      totalListings,
      activeListings,
      totalClaims,
      pendingReports,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ verified: false }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: 'available' }),
      Claim.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          pendingVerification,
          totalListings,
          activeListings,
          totalClaims,
          pendingReports,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingUsers,
  getAllUsers,
  verifyUser,
  deactivateUser,
  getReports,
  resolveReport,
  removeListing,
  getAllListings,
  getAdminStats,
};

