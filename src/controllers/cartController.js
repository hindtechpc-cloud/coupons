// src/controllers/cartController.js
const R = require('ramda');
const Cart =require("../models/Cart")
const Product = require('../models/Product');
const { addToCartSchema, updateCartItemSchema } = require('../validators/cartValidators');

const handleAsyncError = (fn) => (req, res, next) => 
  Promise.resolve(fn(req, res, next)).catch(next);

// Get user's cart
const getCart = handleAsyncError(async (req, res) => {
  const { userId } = req.params;
  
  const cart = await Cart.findOne({ userId })
    .populate('items.productId', 'name description category price images')
    .select('-__v');

  if (!cart) {
    return res.json({
      success: true,
      data: {
        userId,
        items: [],
        totalValue: 0,
        totalItems: 0
      }
    });
  }

  // Transform cart items with product details
  const transformedItems = cart.items.map(item => ({
    productId: item.productId._id,
    name: item.productId.name,
    description: item.productId.description,
    category: item.productId.category,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.unitPrice * item.quantity,
    image: item.productId.images?.[0]
  }));

  res.json({
    success: true,
    data: {
      userId: cart.userId,
      items: transformedItems,
      totalValue: cart.totalValue,
      totalItems: cart.totalItems,
      lastUpdated: cart.lastUpdated
    }
  });
});

// Add item to cart
const addToCart = handleAsyncError(async (req, res) => {
  const { userId } = req.params;
  const { error, value } = addToCartSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  // Check if product exists and has stock
  const product = await Product.findOne({
    _id: value.productId,
    isActive: true,
    stock: { $gte: value.quantity }
  });

  if (!product) {
    return res.status(404).json({
      success: false,
      error: 'Product not found or insufficient stock'
    });
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // Create new cart
    cart = new Cart({
      userId,
      items: [{
        productId: value.productId,
        quantity: value.quantity,
        unitPrice: product.price,
        category: product.category
      }]
    });
  } else {
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === value.productId
    );

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      const newQuantity = cart.items[existingItemIndex].quantity + value.quantity;
      
      // Check stock availability for new quantity
      if (product.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock. Available: ${product.stock}`
        });
      }
      
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({
        productId: value.productId,
        quantity: value.quantity,
        unitPrice: product.price,
        category: product.category
      });
    }
  }

  await cart.save();
  await cart.populate('items.productId', 'name description category price images');

  // Transform response
  const transformedItems = cart.items.map(item => ({
    productId: item.productId._id,
    name: item.productId.name,
    description: item.productId.description,
    category: item.productId.category,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.unitPrice * item.quantity,
    image: item.productId.images?.[0]
  }));

  res.json({
    success: true,
    data: {
      userId: cart.userId,
      items: transformedItems,
      totalValue: cart.totalValue,
      totalItems: cart.totalItems,
      lastUpdated: cart.lastUpdated
    }
  });
});

// Update cart item quantity
const updateCartItem = handleAsyncError(async (req, res) => {
  const { userId, productId } = req.params;
  const { error, value } = updateCartItemSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  if (value.quantity === 0) {
    // Remove item if quantity is 0
    return removeFromCart(req, res);
  }

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.status(404).json({
      success: false,
      error: 'Cart not found'
    });
  }

  const itemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Item not found in cart'
    });
  }

  // Check stock availability
  const product = await Product.findOne({
    _id: productId,
    isActive: true,
    stock: { $gte: value.quantity }
  });

  if (!product) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient stock'
    });
  }

  cart.items[itemIndex].quantity = value.quantity;
  cart.items[itemIndex].unitPrice = product.price; // Update price in case it changed

  await cart.save();
  await cart.populate('items.productId', 'name description category price images');

  // Transform response
  const transformedItems = cart.items.map(item => ({
    productId: item.productId._id,
    name: item.productId.name,
    description: item.productId.description,
    category: item.productId.category,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.unitPrice * item.quantity,
    image: item.productId.images?.[0]
  }));

  res.json({
    success: true,
    data: {
      userId: cart.userId,
      items: transformedItems,
      totalValue: cart.totalValue,
      totalItems: cart.totalItems,
      lastUpdated: cart.lastUpdated
    }
  });
});

// Remove item from cart
const removeFromCart = handleAsyncError(async (req, res) => {
  const { userId, productId } = req.params;

  const cart = await Cart.findOne({ userId });
  if (!cart) {
    return res.status(404).json({
      success: false,
      error: 'Cart not found'
    });
  }

  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    item => item.productId.toString() !== productId
  );

  if (cart.items.length === initialLength) {
    return res.status(404).json({
      success: false,
      error: 'Item not found in cart'
    });
  }

  // If cart is empty after removal, delete the cart
  if (cart.items.length === 0) {
    await Cart.deleteOne({ userId });
    return res.json({
      success: true,
      data: {
        userId,
        items: [],
        totalValue: 0,
        totalItems: 0,
        message: 'Cart is now empty'
      }
    });
  }

  await cart.save();
  await cart.populate('items.productId', 'name description category price images');

  // Transform response
  const transformedItems = cart.items.map(item => ({
    productId: item.productId._id,
    name: item.productId.name,
    description: item.productId.description,
    category: item.productId.category,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: item.unitPrice * item.quantity,
    image: item.productId.images?.[0]
  }));

  res.json({
    success: true,
    data: {
      userId: cart.userId,
      items: transformedItems,
      totalValue: cart.totalValue,
      totalItems: cart.totalItems,
      lastUpdated: cart.lastUpdated
    }
  });
});

// Clear entire cart
const clearCart = handleAsyncError(async (req, res) => {
  const { userId } = req.params;

  const result = await Cart.deleteOne({ userId });

  if (result.deletedCount === 0) {
    return res.status(404).json({
      success: false,
      error: 'Cart not found'
    });
  }

  res.json({
    success: true,
    message: 'Cart cleared successfully',
    data: {
      userId,
      items: [],
      totalValue: 0,
      totalItems: 0
    }
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};