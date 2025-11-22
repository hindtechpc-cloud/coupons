// src/scripts/seedProducts.js
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../config/env');
const Product = require('../models/Product');

const seedProducts = [
  {
    name: "Men's Cotton T-Shirt",
    description: "Comfortable cotton t-shirt for everyday wear",
    category: "clothing",
    price: 599,
    stock: 50,
    images: ["https://example.com/tshirt1.jpg"],
    tags: ["men", "cotton", "casual"]
  },
  {
    name: "Wireless Bluetooth Headphones",
    description: "High-quality wireless headphones with noise cancellation",
    category: "electronics",
    price: 2999,
    stock: 25,
    images: ["https://example.com/headphones1.jpg"],
    tags: ["wireless", "bluetooth", "audio"]
  },
  {
    name: "Running Shoes",
    description: "Lightweight running shoes with cushioning",
    category: "shoes",
    price: 3499,
    stock: 30,
    images: ["https://example.com/shoes1.jpg"],
    tags: ["running", "sports", "men", "women"]
  },
  {
    name: "Leather Wallet",
    description: "Genuine leather wallet with multiple card slots",
    category: "accessories",
    price: 1299,
    stock: 40,
    images: ["https://example.com/wallet1.jpg"],
    tags: ["leather", "wallet", "men"]
  },
  {
    name: "Smartphone Case",
    description: "Protective case for latest smartphones",
    category: "electronics",
    price: 499,
    stock: 100,
    images: ["https://example.com/case1.jpg"],
    tags: ["mobile", "protection", "accessory"]
  },
  {
    name: "Women's Summer Dress",
    description: "Beautiful floral summer dress for women",
    category: "clothing",
    price: 1999,
    stock: 20,
    images: ["https://example.com/dress1.jpg"],
    tags: ["women", "summer", "floral", "dress"]
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert seed products
    await Product.insertMany(seedProducts);
    console.log('Seed products inserted successfully');
    
    console.log('\nSample products created:');
    seedProducts.forEach(product => {
      console.log(`- ${product.name}: ₹${product.price} (${product.category})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();