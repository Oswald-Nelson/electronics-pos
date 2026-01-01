/**
 * Sale model
 * Stores completed sales including items, amounts, teller/client references and payment breakdown.
 */

const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema({
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    qty: { type: Number, required: true },
    price: { type: Number, required: true }
  }],
  teller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  client: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  totalAmount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ["cash", "momo", "card", "other"], default: "cash" },
  paymentBreakdown: {
    cash: { type: Number, default: 0 },
    momo: { type: Number, default: 0 },
    card: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Sale", SaleSchema);
