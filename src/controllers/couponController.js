// src/controllers/couponController.js
const R = require('ramda');
const Coupon = require('../models/Coupon');
const { couponSchema, bestCouponSchema } = require('../validators/couponValidators');
const { findBestCoupon } = require('../services/couponLogic');

// Functional error handler
const handleAsyncError = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

const createCoupon = handleAsyncError(async (req, res) => {
  const { error, value } = couponSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  // Check for duplicate code
  const existingCoupon = await Coupon.findOne({ code: value.code });
  if (existingCoupon) {
    return res.status(409).json({
      success: false,
      error: `Coupon code '${value.code}' already exists`
    });
  }
  
  const coupon = await Coupon.create(value);
  
  res.status(201).json({
    success: true,
    data: R.omit(['__v'], coupon.toObject())
  });
});

const getBestCoupon = handleAsyncError(async (req, res) => {
  const { error, value } = bestCouponSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }
  
  const result = await findBestCoupon(value.userContext, value.cart);
  
  res.json({
    success: true,
    data: result
  });
});

const getCoupons = handleAsyncError(async (req, res) => {
  const coupons = await Coupon.find({ isActive: true })
    .select('-__v')
    .sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: coupons
  });
});

module.exports = {
  createCoupon,
  getBestCoupon,
  getCoupons
};