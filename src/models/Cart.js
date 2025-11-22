// src/models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true 
  },
  items: [cartItemSchema],
  totalValue: {
    type: Number,
    default: 0
  },
  totalItems: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update totals before saving
cartSchema.pre('save', function(next) {
  this.totalValue = this.items.reduce((total, item) => 
    total + (item.unitPrice * item.quantity), 0);
  this.totalItems = this.items.reduce((total, item) => 
    total + item.quantity, 0);
  this.lastUpdated = new Date();
  next;
});

module.exports = mongoose.model('Cart', cartSchema);