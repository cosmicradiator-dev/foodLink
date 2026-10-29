const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for authentication routes (login, register, refresh)
 * Limits to 10 requests per 15 minutes per IP to prevent brute-force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes.',
  },
});

/**
 * General rate limiter for general API routes
 * Limits to 100 requests per 15 minutes per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

module.exports = {
  authLimiter,
  apiLimiter,
};
