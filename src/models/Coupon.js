// src/models/Coupon.js
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  discountType: {
    type: String,
    enum: ['FLAT', 'PERCENT'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    min: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimitPerUser: {
    type: Number,
    min: 1
  },
  eligibility: {
    allowedUserTiers: [String],
    minLifetimeSpend: Number,
    minOrdersPlaced: Number,
    firstOrderOnly: Boolean,
    allowedCountries: [String],
    minCartValue: Number,
    applicableCategories: [String],
    excludedCategories: [String],
    minItemsCount: Number
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Coupon', couponSchema);