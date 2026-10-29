'use strict';

const express = require('express');
const { getOpenTasks, acceptTask, getMyTasks } = require('../controllers/volunteer.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/tasks', authenticate, authorize('volunteer'), getOpenTasks);
router.post('/tasks/:claimId/accept', authenticate, authorize('volunteer'), acceptTask);
router.get('/my-tasks', authenticate, authorize('volunteer'), getMyTasks);

module.exports = router;

