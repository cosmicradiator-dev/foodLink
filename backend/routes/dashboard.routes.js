'use strict';

const express = require('express');
const { getImpactStats, getMyImpact } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/impact', authenticate, getImpactStats);
router.get('/my-impact', authenticate, getMyImpact);

module.exports = router;

