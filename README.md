# Coupon Management System

A functional programming-based coupon management system built with Node.js, Express, and MongoDB.

## Features

- Create and manage coupons with complex eligibility rules
- Find the best applicable coupon for a user's cart
- Functional programming paradigm with pure functions
- Comprehensive validation and error handling
- MongoDB persistence with efficient queries

## API Endpoints

### POST /api/coupons
Create a new coupon.

**Body:**
```json
{
  "code": "SUMMER20",
  "description": "20% off summer sale",
  "discountType": "PERCENT",
  "discountValue": 20,
  "maxDiscountAmount": 1000,
  "startDate": "2024-06-01T00:00:00Z",
  "endDate": "2024-08-31T23:59:59Z",
  "usageLimitPerUser": 2,
  "eligibility": {
    "minCartValue": 2000,
    "allowedUserTiers": ["SILVER", "GOLD", "PLATINUM"],
    "applicableCategories": ["clothing", "shoes"]
  }
}


## Product & Cart Management

### Product Endpoints

#### POST /api/products
Create a new product.

**Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "category": "clothing",
  "price": 999,
  "stock": 50,
  "images": ["https://example.com/image.jpg"],
  "tags": ["men", "cotton"]
}



## 📸 Screenshots

### Create Coupon
![Create Coupon](public/create-coupon.png)

### Create Coupon Response
![Create Coupon Response](public/create-coupon-response.png)

### Duplicate Coupon Code Error
![Duplicate Coupon Code](public/duplicate-coupon-code.png)

### Create Product
![Create Product](public/create-product.png)

### Add to Cart
![Add to Cart](public/add-to-cart.png)

### Get All Coupons
![Get All Coupons](public/get-coupons.png)

### Get Best Coupon
![Get Best Coupon](public/get-best-coupon.png)
