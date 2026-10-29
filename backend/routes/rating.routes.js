'use strict';

const express = require('express');
const { body } = require('express-validator');
const { submitRating, getUserRatings } = require('../controllers/rating.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, [
  body('claim_id').isMongoId().withMessage('Valid claim ID is required'),
  body('to_user').isMongoId().withMessage('Valid user ID to rate is required'),
  body('score').isInt({ min: 1, max: 5 }).withMessage('Score must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 300 }).withMessage('Comment cannot exceed 300 characters'),
], submitRating);

router.get('/user/:userId', authenticate, getUserRatings);

module.exports = router;

