// src/routes/couponRoutes.js
const express = require('express');
const {
  createCoupon,
  getBestCoupon,
  getCoupons
} = require('../controllers/couponController');

const router = express.Router();

router.post('/coupons', createCoupon);
router.post('/best-coupon', getBestCoupon);
router.get('/coupons', getCoupons);

module.exports = router;