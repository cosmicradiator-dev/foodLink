'use strict';

const express = require('express');
const { body } = require('express-validator');
const { register, login, refresh, logout, getMe } = require('../controllers/auth.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ── Validation Rules ──────────────────────────────────────────────────────────
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter').matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('role').optional().isIn(['donor', 'recipient', 'volunteer']).withMessage('Role must be donor, recipient, or volunteer'),
  body('phone').optional().trim().isMobilePhone().withMessage('Please provide a valid phone number'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Routes ────────────────────────────────────────────────────────────────────
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refresh);
router.post('/logout', optionalAuth, logout);
router.get('/me', authenticate, getMe);

module.exports = router;

