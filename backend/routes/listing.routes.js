'use strict';

const express = require('express');
const { body, query } = require('express-validator');
const {
  createListing,
  getNearbyListings,
  getListingById,
  updateListing,
  cancelListing,
  getUserListings,
} = require('../controllers/listing.controller');
const { claimListing } = require('../controllers/claim.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// ── Validation ────────────────────────────────────────────────────────────────
const createListingValidation = [
  body('food_type').trim().notEmpty().withMessage('Food type is required').isLength({ max: 100 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 1000 }),
  body('servings').isInt({ min: 1 }).withMessage('Servings must be a positive integer'),
  body('veg_flag').optional().isBoolean().withMessage('veg_flag must be boolean'),
  body('prepared_at').isISO8601().withMessage('Prepared time must be a valid date'),
  body('expires_at')
    .isISO8601()
    .withMessage('Expiry time must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.prepared_at)) {
        throw new Error('Expiry time must be after preparation time');
      }
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry time must be in the future');
      }
      return true;
    }),
  body('address').trim().notEmpty().withMessage('Pickup address is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude is required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude is required'),
];

const nearbyValidation = [
  query('latitude').optional().isFloat({ min: -90, max: 90 }),
  query('longitude').optional().isFloat({ min: -180, max: 180 }),
  query('radius').optional().isFloat({ min: 0.1, max: 50 }),
];

// ── Routes ────────────────────────────────────────────────────────────────────
router.get('/nearby', authenticate, nearbyValidation, getNearbyListings);
router.get('/my', authenticate, authorize('donor'), getUserListings);
router.get('/:id', optionalAuth, getListingById);
router.patch('/:listingId/claim', authenticate, authorize('recipient', 'volunteer'), claimListing);
router.post('/', authenticate, authorize('donor'), upload.single('photo'), createListingValidation, createListing);
router.put('/:id', authenticate, authorize('donor'), upload.single('photo'), updateListing);
router.delete('/:id', authenticate, authorize('donor', 'admin'), cancelListing);

module.exports = router;

