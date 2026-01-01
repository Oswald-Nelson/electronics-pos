/**
 * Product model
 * Schema for products stored in the database.
 * Fields: name, price, category, brand, image, quantityInStock, description
 */

const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  brand: { type: String },
  image: { type: String },
  quantityInStock: { type: Number, default: 0 },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
