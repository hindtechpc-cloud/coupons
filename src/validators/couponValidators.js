// src/validators/couponValidators.js
const Joi = require('joi');

const couponSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(20).required(),
  description: Joi.string().min(10).max(200).required(),
  discountType: Joi.string().valid('FLAT', 'PERCENT').required(),
  discountValue: Joi.number().positive().required(),
  maxDiscountAmount: Joi.number().positive().allow(null),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  usageLimitPerUser: Joi.number().integer().positive().allow(null),
  eligibility: Joi.object({
    allowedUserTiers: Joi.array().items(Joi.string()),
    minLifetimeSpend: Joi.number().positive().allow(null),
    minOrdersPlaced: Joi.number().integer().positive().allow(null),
    firstOrderOnly: Joi.boolean(),
    allowedCountries: Joi.array().items(Joi.string().length(2)),
    minCartValue: Joi.number().positive().allow(null),
    applicableCategories: Joi.array().items(Joi.string()),
    excludedCategories: Joi.array().items(Joi.string()),
    minItemsCount: Joi.number().integer().positive().allow(null)
  }).default({})
});

const bestCouponSchema = Joi.object({
  userContext: Joi.object({
    userId: Joi.string().required(),
    userTier: Joi.string().valid('BRONZE', 'SILVER', 'GOLD', 'PLATINUM').required(),
    country: Joi.string().length(2).required(),
    lifetimeSpend: Joi.number().min(0).required(),
    ordersPlaced: Joi.number().integer().min(0).required()
  }).required(),
  cart: Joi.array().items(Joi.object({
    productId: Joi.string().required(),
    category: Joi.string().required(),
    unitPrice: Joi.number().positive().required(),
    quantity: Joi.number().integer().positive().required()
  })).min(1).required()
});

module.exports = {
  couponSchema,
  bestCouponSchema
};