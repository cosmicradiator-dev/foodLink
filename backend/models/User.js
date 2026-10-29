const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pointSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['donor', 'recipient', 'volunteer', 'admin'],
      default: 'donor',
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      select: false, // Protected: only revealed to matched parties
    },
    location: {
      type: pointSchema,
      default: () => ({ type: 'Point', coordinates: [0, 0] }),
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    trust_score: {
      type: Number,
      default: 100,
      min: [0, 'Trust score cannot be below 0'],
      max: [100, 'Trust score cannot exceed 100'],
    },
    refresh_token: {
      type: String,
      select: false,
    },
    avatar_url: {
      type: String,
      default: '',
    },
    organisation_name: {
      type: String,
      trim: true,
      default: '',
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Geospatial 2dsphere index for location matching
userSchema.index({ location: '2dsphere' });

// Pre-save hook: Hash password and refresh_token
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  if (this.isModified('refresh_token') && this.refresh_token) {
    const salt = await bcrypt.genSalt(10);
    this.refresh_token = await bcrypt.hash(this.refresh_token, salt);
  }

  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Compare raw refresh token with hashed refresh token
userSchema.methods.compareRefreshToken = async function (candidateToken) {
  if (!this.refresh_token) return false;
  return bcrypt.compare(candidateToken, this.refresh_token);
};

// Generate JWT Access Token (15 min)
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role, email: this.email, name: this.name },
    process.env.JWT_ACCESS_SECRET || 'default_access_secret_foodlink_min_64_characters_long_string_here_now',
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

// Generate JWT Refresh Token (7 days)
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_foodlink_min_64_characters_long_string_here_now',
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);
