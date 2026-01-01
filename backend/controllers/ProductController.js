/**
 * ProductController.js
 * Product CRUD and image management (uploading, listing, and auto-assignment).
 * Brief inline comments added for clarity (Option A).
 */

const Product = require("../models/Product");
const fs = require('fs')
const path = require('path')
const multer = require('multer')

// Multer setup for uploads to backend/public/products
const productsDir = path.join(__dirname, '..', 'public', 'products')
if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true })
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, productsDir)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

exports.uploadMiddleware = upload.single('image')

// List available product images
exports.getProductImages = async (req, res) => {
  try {
    const files = fs.readdirSync(productsDir)
    res.json(files)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Upload an image (admin)
exports.uploadProductImage = async (req, res) => {
  try {
    // multer will have saved the file to productsDir
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    res.json({ filename: req.file.originalname, url: `/uploads/products/${req.file.originalname}` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Assign images to existing products based on filename matching
exports.assignImagesToProducts = async (req, res) => {
  try {
    const files = fs.readdirSync(productsDir)
    const products = await Product.find()
    const updates = []
    for (const p of products) {
      const name = (p.name || '').toLowerCase()
      const match = files.find(f => f.toLowerCase().includes(name.split(' ')[0])) || files.find(f => f.toLowerCase().includes(name))
      if (match) {
        p.image = `/uploads/products/${match}`
        await p.save()
        updates.push({ product: p._id, image: p.image })
      }
    }
    res.json({ updated: updates.length, details: updates })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Create Product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Product (Admin only)
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};