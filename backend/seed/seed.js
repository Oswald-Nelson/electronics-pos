/**
 * seed/seed.js
 * Database seeding script for local development. Resets users and products.
 * Usage: node seed/seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const Product = require("../models/Product");

const seed = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/pos_system");
    console.log("MongoDB connected");

    // Clear collections
    await User.deleteMany({});
    await Product.deleteMany({});

    const password = await bcrypt.hash("password123", 10);

    // Create users
    await User.create([
      { name: "Admin", email: "admin@store.com", password, role: "admin" },
      { name: "Teller", email: "teller@store.com", password, role: "teller" },
      { name: "Client", email: "client@store.com", password, role: "client" }
    ]);

    // Create products
    await Product.create([
      { name: "Smartphone X", price: 300, category: "Phones", brand: "BrandA", quantityInStock: 10 },
      { name: "Laptop Pro", price: 1200, category: "Computers", brand: "BrandB", quantityInStock: 5 },
      { name: "Wireless Headphones", price: 80, category: "Accessories", brand: "BrandC", quantityInStock: 25 }
    ]);

    console.log("Database seeded!");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();