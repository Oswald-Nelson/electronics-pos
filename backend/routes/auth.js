/**
 * auth routes
 * Authentication endpoints: register, login, and protected change-password.
 */

const express = require("express");
const router = express.Router();
const { register, login, changePassword } = require("../controllers/AuthController");
const { protect } = require("../middleware/authMiddleware");

// Register Route
router.post("/register", register);

// Login Route
router.post("/login", login);

// Change password (protected)
router.post('/change-password', protect, changePassword);

module.exports = router;
