// =============================================
// DATABASE SEED SCRIPT
// =============================================
// Run this script to populate the database with sample data.
// Usage: npm run seed (or: node seed.js)
//
// This creates:
// - 1 admin user (admin@shop.com / admin123)
// - 2 customer users for testing
// - 12 sample products across different categories

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ---- CREATE USERS ----
    const salt = await bcrypt.genSalt(10);

    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@shop.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Ali Hassan',
        email: 'ali@test.com',
        password: 'test1234',
        role: 'customer',
      },
      {
        name: 'Sara Ahmed',
        email: 'sara@test.com',
        password: 'test1234',
        role: 'customer',
      },
    ]);

    console.log('👤 Created users:');
    console.log('   Admin: admin@shop.com / admin123');
    console.log('   Customer: ali@test.com / test1234');
    console.log('   Customer: sara@test.com / test1234');

    const adminUser = users[0];

    // ---- CREATE PRODUCTS ----
    const products = await Product.create([
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and crystal-clear audio quality.',
        price: 8999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        stock: 50,
        createdBy: adminUser._id,
      },
      {
        name: 'Smart Watch Pro',
        description: 'Feature-packed smartwatch with health tracking, GPS, water resistance, and a stunning AMOLED display.',
        price: 15999,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=400&h=300&fit=crop',
        stock: 30,
        createdBy: adminUser._id,
      },
      {
        name: 'Mechanical Gaming Keyboard',
        description: 'RGB backlit mechanical keyboard with Cherry MX switches and programmable macro keys for gaming.',
        price: 6499,
        category: 'Electronics',
        image: 'https://images.unsplash.com/photo-1541140532154-b024d1b22e3d?w=400&h=300&fit=crop',
        stock: 25,
        createdBy: adminUser._id,
      },
      {
        name: 'Premium Cotton T-Shirt',
        description: 'Ultra-soft 100% organic cotton t-shirt available in multiple colors. Perfect for everyday wear.',
        price: 1499,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
        stock: 100,
        createdBy: adminUser._id,
      },
      {
        name: 'Denim Jacket Classic',
        description: 'Timeless denim jacket crafted from premium Japanese selvedge denim. A wardrobe essential.',
        price: 4999,
        category: 'Clothing',
        image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400&h=300&fit=crop',
        stock: 40,
        createdBy: adminUser._id,
      },
      {
        name: 'Running Sneakers Air',
        description: 'Lightweight running shoes with air cushion technology and breathable mesh upper for ultimate comfort.',
        price: 7999,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
        stock: 60,
        createdBy: adminUser._id,
      },
      {
        name: 'JavaScript: The Good Parts',
        description: 'The essential guide to JavaScript by Douglas Crockford. A must-read for every web developer.',
        price: 899,
        category: 'Books',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
        stock: 75,
        createdBy: adminUser._id,
      },
      {
        name: 'Learn React in 30 Days',
        description: 'Comprehensive React guide from zero to hero. Covers hooks, context, routing, and real-world projects.',
        price: 1299,
        category: 'Books',
        image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=300&fit=crop',
        stock: 45,
        createdBy: adminUser._id,
      },
      {
        name: 'Stainless Steel Water Bottle',
        description: 'Double-walled vacuum insulated bottle that keeps drinks cold 24 hours and hot 12 hours.',
        price: 1999,
        category: 'Home & Kitchen',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=300&fit=crop',
        stock: 80,
        createdBy: adminUser._id,
      },
      {
        name: 'Non-Stick Cookware Set',
        description: 'Premium 5-piece non-stick cookware set with heat-resistant handles. Dishwasher safe.',
        price: 5499,
        category: 'Home & Kitchen',
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        stock: 20,
        createdBy: adminUser._id,
      },
      {
        name: 'Yoga Mat Premium',
        description: 'Extra-thick 6mm yoga mat with non-slip surface and carrying strap. Perfect for all levels.',
        price: 2499,
        category: 'Sports',
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=300&fit=crop',
        stock: 55,
        createdBy: adminUser._id,
      },
      {
        name: 'Building Blocks Creative Set',
        description: 'Educational building blocks set with 500+ pieces. Develops creativity and motor skills in kids.',
        price: 2999,
        category: 'Toys',
        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400&h=300&fit=crop',
        stock: 35,
        createdBy: adminUser._id,
      },
    ]);

    console.log(`📦 Created ${products.length} products`);
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 You can now log in with:');
    console.log('   Admin → admin@shop.com / admin123');
    console.log('   Customer → ali@test.com / test1234');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
