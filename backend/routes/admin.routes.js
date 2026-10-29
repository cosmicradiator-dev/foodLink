'use strict';

const express = require('express');
const {
  getPendingUsers, getAllUsers, verifyUser, deactivateUser,
  getReports, resolveReport, removeListing, getAllListings, getAdminStats,
} = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users/pending', getPendingUsers);
router.get('/users', getAllUsers);
router.patch('/users/:id/verify', verifyUser);
router.patch('/users/:id/deactivate', deactivateUser);
router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);
router.get('/listings', getAllListings);
router.delete('/listings/:id', removeListing);

module.exports = router;

