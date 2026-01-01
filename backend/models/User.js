/**
 * User model
 * Minimal user schema with roles (admin, teller, client) and authentication fields.
 */

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["admin", "teller", "client"],
    default: "client"
  }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
