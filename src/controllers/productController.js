// src/controllers/productController.js
const R = require('ramda');
const Product = require('../models/Product');
const { productSchema, updateProductSchema } = require('../validators/productValidators');

const handleAsyncError = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

// Create product
const createProduct = handleAsyncError(async (req, res) => {
  const { error, value } = productSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  const product = await Product.create(value);
  
  res.status(201).json({
    success: true,
    data: R.omit(['__v'], product.toObject())
  });
});

// Get all products with filtering and pagination
const getProducts = handleAsyncError(async (req, res) => {
  const { 
    category, 
    search, 
    minPrice, 
    maxPrice, 
    page = 1, 
    limit = 10,
    inStock = true 
  } = req.query;

  const filter = { isActive: true };
  
  if (category) filter.category = new RegExp(category, 'i');
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }
  if (inStock === 'true') filter.stock = { $gt: 0 };
  
  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Product.countDocuments(filter)
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Get single product
const getProduct = handleAsyncError(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isActive: true
  }).select('-__v');

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: product
  });
});

// Update product
const updateProduct = handleAsyncError(async (req, res) => {
  const { error, value } = updateProductSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, isActive: true },
    value,
    { new: true, runValidators: true }
  ).select('-__v');

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  res.json({
    success: true,
    data: product
  });
});

// Delete product (soft delete)
const deleteProduct = handleAsyncError(async (req, res) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, isActive: true },
    { isActive: false },
    { new: true }
  );

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found'
    });
  }

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct
};