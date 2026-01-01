/**
 * products routes
 * Routes for product CRUD and image utilities. Protected endpoints for admin-only actions.
 */

const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct
  ,getProductById
} = require("../controllers/ProductController");
const { getProductImages, uploadProductImage, uploadMiddleware } = require('../controllers/ProductController')
const { assignImagesToProducts } = require('../controllers/ProductController')

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Public route to get products (all users)
router.get("/", protect, getProducts);
router.get("/:id", protect, getProductById);
// list available product images
router.get('/images', protect, getProductImages);

// upload an image (admin)
router.post('/upload', protect, authorizeRoles('admin'), uploadMiddleware, uploadProductImage);

// admin utility: match filenames to products and set product.image
router.post('/assign-images', protect, authorizeRoles('admin'), assignImagesToProducts);

// Admin-only routes
router.post("/", protect, authorizeRoles("admin"), createProduct);
router.put("/:id", protect, authorizeRoles("admin"), updateProduct);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct);

module.exports = router;
