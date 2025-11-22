// src/scripts/seed.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MONGODB_URI } = require('../config/env');
const Coupon = require('../models/Coupon');

const seedCoupons = [
  {
    code: 'WELCOME10',
    description: '10% off on first order for new customers',
    discountType: 'PERCENT',
    discountValue: 10,
    maxDiscountAmount: 500,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    usageLimitPerUser: 1,
    eligibility: {
      firstOrderOnly: true,
      minCartValue: 1000
    }
  },
  {
    code: 'FLAT100',
    description: 'Flat ₹100 off on orders above ₹500',
    discountType: 'FLAT',
    discountValue: 100,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    eligibility: {
      minCartValue: 500
    }
  },
  {
    code: 'PREMIUM20',
    description: '20% off for premium users',
    discountType: 'PERCENT',
    discountValue: 20,
    maxDiscountAmount: 1000,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    eligibility: {
      allowedUserTiers: ['GOLD', 'PLATINUM'],
      minLifetimeSpend: 5000
    }
  },
  {
    code: 'FASHION15',
    description: '15% off on fashion items',
    discountType: 'PERCENT',
    discountValue: 15,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    eligibility: {
      applicableCategories: ['clothing', 'shoes', 'accessories'],
      minCartValue: 2000
    }
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing coupons
    await Coupon.deleteMany({});
    console.log('Cleared existing coupons');
    
    // Insert seed coupons
    await Coupon.insertMany(seedCoupons);
    console.log('Seed coupons inserted successfully');
    
    console.log('\nSample coupons created:');
    seedCoupons.forEach(coupon => {
      console.log(`- ${coupon.code}: ${coupon.description}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();