'use strict';

const express = require('express');
const { body } = require('express-validator');
const {
  claimListing,
  confirmPickup,
  cancelClaim,
  getUserClaims,
  getListingClaim,
} = require('../controllers/claim.controller');
const { acceptTask } = require('../controllers/volunteer.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const verifyPickupValidation = [
  body('pickupCode')
    .trim()
    .notEmpty()
    .withMessage('Pickup code is required')
    .isLength({ min: 4, max: 6 })
    .withMessage('Pickup code must be a 4-digit code (e.g. 4729)'),
];

// Claim a listing
router.post('/:listingId', authenticate, authorize('recipient', 'volunteer'), claimListing);
router.patch('/:listingId/claim', authenticate, authorize('recipient', 'volunteer'), claimListing);

// Verify pickup code (supports both endpoints from Section 12.5 and legacy)
router.patch('/:claimId/pickup', authenticate, authorize('donor', 'admin'), verifyPickupValidation, confirmPickup);
router.post('/:claimId/confirm-pickup', authenticate, authorize('donor', 'admin'), verifyPickupValidation, confirmPickup);

// Accept volunteer task
router.post('/:claimId/volunteer', authenticate, authorize('volunteer'), acceptTask);

// Cancel claim
router.post('/:claimId/cancel', authenticate, authorize('recipient', 'volunteer', 'admin'), cancelClaim);
router.patch('/:claimId/cancel', authenticate, authorize('recipient', 'volunteer', 'admin'), cancelClaim);

// Retrieve claims
router.get('/my', authenticate, authorize('recipient', 'volunteer'), getUserClaims);
router.get('/listing/:listingId', authenticate, authorize('donor', 'admin'), getListingClaim);

module.exports = router;
