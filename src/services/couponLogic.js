// src/services/couponLogic.js
const R = require('ramda');
const Coupon = require('../models/Coupon');
const CouponUsage = require('../models/CouponUsage');

// Pure utility functions
const pipeAsync = R.pipeWith((f, res) => 
  res && typeof res.then === 'function' ? res.then(f) : f(res)
);

// Cart calculations
const calculateCartValue = R.pipe(
  R.map(item => item.unitPrice * item.quantity),
  R.sum
);

const getCartItemCategories = R.pipe(
  R.map(R.prop('category')),
  R.uniq
);

const getTotalItemsCount = R.pipe(
  R.map(R.prop('quantity')),
  R.sum
);

// Eligibility validators (pure functions)
const validateDateRange = (now) => (coupon) => 
  new Date(coupon.startDate) <= now && now <= new Date(coupon.endDate);

const validateUsageLimit = (usageCount, coupon) => 
  !coupon.usageLimitPerUser || usageCount < coupon.usageLimitPerUser;

const validateUserTier = (userContext, coupon) => 
  !coupon.eligibility?.allowedUserTiers?.length || 
  coupon.eligibility.allowedUserTiers.includes(userContext.userTier);

const validateLifetimeSpend = (userContext, coupon) => 
  !coupon.eligibility?.minLifetimeSpend || 
  userContext.lifetimeSpend >= coupon.eligibility.minLifetimeSpend;

const validateOrdersPlaced = (userContext, coupon) => 
  !coupon.eligibility?.minOrdersPlaced || 
  userContext.ordersPlaced >= coupon.eligibility.minOrdersPlaced;

const validateFirstOrder = (userContext, coupon) => 
  !coupon.eligibility?.firstOrderOnly || 
  userContext.ordersPlaced === 0;

const validateCountry = (userContext, coupon) => 
  !coupon.eligibility?.allowedCountries?.length || 
  coupon.eligibility.allowedCountries.includes(userContext.country);

const validateCartValue = (cart, coupon) => {
  const cartValue = calculateCartValue(cart);
  return !coupon.eligibility?.minCartValue || 
         cartValue >= coupon.eligibility.minCartValue;
};

const validateCategories = (cart, coupon) => {
  const cartCategories = getCartItemCategories(cart);
  const { applicableCategories, excludedCategories } = coupon.eligibility || {};
  
  const hasApplicableCategories = !applicableCategories?.length || 
    cartCategories.some(cat => applicableCategories.includes(cat));
    
  const hasNoExcludedCategories = !excludedCategories?.length || 
    !cartCategories.some(cat => excludedCategories.includes(cat));
    
  return hasApplicableCategories && hasNoExcludedCategories;
};

const validateItemsCount = (cart, coupon) => 
  !coupon.eligibility?.minItemsCount || 
  getTotalItemsCount(cart) >= coupon.eligibility.minItemsCount;

// Compose all validators
const createEligibilityValidator = (userContext, cart, usageCount, now) => 
  R.allPass([
    validateDateRange(now),
    R.partial(validateUsageLimit, [usageCount]),
    R.partial(validateUserTier, [userContext]),
    R.partial(validateLifetimeSpend, [userContext]),
    R.partial(validateOrdersPlaced, [userContext]),
    R.partial(validateFirstOrder, [userContext]),
    R.partial(validateCountry, [userContext]),
    R.partial(validateCartValue, [cart]),
    R.partial(validateCategories, [cart]),
    R.partial(validateItemsCount, [cart])
  ]);

// Discount calculation (pure function)
const calculateDiscount = (coupon, cart) => {
  const cartValue = calculateCartValue(cart);
  
  if (coupon.discountType === 'FLAT') {
    return Math.min(coupon.discountValue, cartValue);
  }
  
  if (coupon.discountType === 'PERCENT') {
    const discount = cartValue * (coupon.discountValue / 100);
    return coupon.maxDiscountAmount 
      ? Math.min(discount, coupon.maxDiscountAmount)
      : discount;
  }
  
  return 0;
};

// Best coupon selection (pure function)
const compareCoupons = (cart) => (couponA, couponB) => {
  const discountA = calculateDiscount(couponA, cart);
  const discountB = calculateDiscount(couponB, cart);
  
  // Highest discount first
  if (discountB !== discountA) {
    return discountB - discountA;
  }
  
  // Earliest endDate
  const dateDiff = new Date(couponA.endDate) - new Date(couponB.endDate);
  if (dateDiff !== 0) {
    return dateDiff;
  }
  
  // Lexicographically smaller code
  return couponA.code.localeCompare(couponB.code);
};

const selectBestCoupon = (cart, eligibleCoupons) => 
  R.pipe(
    R.sort(compareCoupons(cart)),
    R.head
  )(eligibleCoupons);

// Main service function
const findBestCoupon = async (userContext, cart) => {
  const now = new Date();
  
  // Get all active coupons within date range
  const activeCoupons = await Coupon.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  });
  
  if (R.isEmpty(activeCoupons)) {
    return null;
  }
  
  // Get usage counts for user
  const usageCounts = await CouponUsage.aggregate([
    {
      $match: {
        userId: userContext.userId,
        couponId: { $in: activeCoupons.map(c => c._id) }
      }
    },
    {
      $group: {
        _id: '$couponId',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const usageMap = R.fromPairs(
    usageCounts.map(uc => [uc._id.toString(), uc.count])
  );
  
  // Filter eligible coupons
  const eligibleCoupons = activeCoupons.filter(coupon => {
    const validator = createEligibilityValidator(
      userContext, 
      cart, 
      usageMap[coupon._id.toString()] || 0, 
      now
    );
    return validator(coupon);
  });
  
  if (R.isEmpty(eligibleCoupons)) {
    return null;
  }
  
  // Select best coupon
  const bestCoupon = selectBestCoupon(cart, eligibleCoupons);
  const discountAmount = calculateDiscount(bestCoupon, cart);
  
  return {
    coupon: R.pick([
      'code', 'description', 'discountType', 'discountValue', 
      'maxDiscountAmount', 'endDate'
    ], bestCoupon),
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalAmount: calculateCartValue(cart) - discountAmount
  };
};

module.exports = {
  calculateCartValue,
  calculateDiscount,
  findBestCoupon,
  createEligibilityValidator,
  selectBestCoupon
};