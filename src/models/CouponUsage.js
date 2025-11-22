// src/models/CouponUsage.js
const mongoose = require('mongoose');

const couponUsageSchema = new mongoose.Schema({
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  usedAt: {
    type: Date,
    default: Date.now
  },
  orderId: {
    type: String,
    required: true
  },
  discountApplied: {
    type: Number,
    required: true
  }
});

// Compound index for efficient usage tracking
couponUsageSchema.index({ couponId: 1, userId: 1 });

module.exports = mongoose.model('CouponUsage', couponUsageSchema);