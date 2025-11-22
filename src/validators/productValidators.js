// src/validators/productValidators.js
const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  category: Joi.string().min(2).max(50).required(),
  price: Joi.number().positive().precision(2).required(),
  stock: Joi.number().integer().min(0).default(0),
  images: Joi.array().items(Joi.string().uri()),
  isActive: Joi.boolean().default(true),
  tags: Joi.array().items(Joi.string())
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().min(10).max(1000),
  category: Joi.string().min(2).max(50),
  price: Joi.number().positive().precision(2),
  stock: Joi.number().integer().min(0),
  images: Joi.array().items(Joi.string().uri()),
  isActive: Joi.boolean(),
  tags: Joi.array().items(Joi.string())
}).min(1);

module.exports = {
  productSchema,
  updateProductSchema
};