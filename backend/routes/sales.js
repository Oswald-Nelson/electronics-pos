/**
 * sales routes
 * Endpoints for creating and retrieving sales. Access is role-aware.
 */

const express = require("express");
const router = express.Router();
const { createSale, getSales } = require("../controllers/SaleController");
const { protect } = require("../middleware/authMiddleware");

// All logged-in users can access sales
router.get("/", protect, getSales);
router.post("/", protect, createSale);

module.exports = router;
