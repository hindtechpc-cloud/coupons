// src/routes/cartRoutes.js
const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

const router = express.Router();

router.get('/cart/:userId', getCart);
router.post('/cart/:userId/items', addToCart);
router.put('/cart/:userId/items/:productId', updateCartItem);
router.delete('/cart/:userId/items/:productId', removeFromCart);
router.delete('/cart/:userId/clear', clearCart);

module.exports = router;