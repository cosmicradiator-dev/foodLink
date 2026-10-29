const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Helper to set secure refresh token cookie
const setRefreshTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'Strict' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth',
  });
};

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input parameters',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { name, email, password, role, phone, address, coordinates, organisation_name } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Prepare GeoJSON location
    let userLocation = { type: 'Point', coordinates: [0, 0] };
    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      userLocation = {
        type: 'Point',
        coordinates: [Number(coordinates[0]), Number(coordinates[1])], // [lon, lat]
      };
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'donor',
      phone: phone || '',
      address: address || '',
      location: userLocation,
      organisation_name: organisation_name || '',
      verified: role === 'admin' ? true : false, // In production, admins verify orgs
      trust_score: 100,
    });

    const refreshToken = user.generateRefreshToken();
    user.refresh_token = refreshToken;
    await user.save();

    const accessToken = user.generateAccessToken();
    setRefreshTokenCookie(res, refreshToken);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organisation_name: user.organisation_name,
      location: user.location,
      address: user.address,
      verified: user.verified,
      trust_score: user.trust_score,
      created_at: user.created_at,
    };

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: userResponse,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input parameters',
        errors: errors.array().map((e) => e.msg),
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refresh_token = refreshToken;
    await user.save();

    setRefreshTokenCookie(res, refreshToken);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organisation_name: user.organisation_name,
      location: user.location,
      address: user.address,
      verified: user.verified,
      trust_score: user.trust_score,
      created_at: user.created_at,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token using httpOnly refresh token cookie
 * POST /api/auth/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!rawRefreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token missing. Please sign in again.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        rawRefreshToken,
        process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_foodlink_min_64_characters_long_string_here_now'
      );
    } catch (err) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please sign in again.',
      });
    }

    const user = await User.findById(decoded.id).select('+refresh_token');
    if (!user || !user.refresh_token) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({
        success: false,
        message: 'Session has ended. Please sign in again.',
      });
    }

    const isTokenValid = await user.compareRefreshToken(rawRefreshToken);
    if (!isTokenValid) {
      res.clearCookie('refreshToken', { path: '/api/auth' });
      return res.status(401).json({
        success: false,
        message: 'Compromised or obsolete refresh token. Please sign in again.',
      });
    }

    // Rotate refresh token
    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refresh_token = newRefreshToken;
    await user.save();

    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user: clears refresh token cookie and database entry
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refresh_token: null });
    }

    res.clearCookie('refreshToken', { path: '/api/auth' });

    return res.status(200).json({
      success: true,
      message: 'Successfully logged out.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
