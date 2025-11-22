// src/validators/cartValidators.js
const Joi = require('joi');

const addToCartSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).max(100).default(1)
});

const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(0).max(100).required()
});

const cartItemResponseSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().positive().required(),
  subtotal: Joi.number().positive().required(),
  image: Joi.string().uri().optional()
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  cartItemResponseSchema
};