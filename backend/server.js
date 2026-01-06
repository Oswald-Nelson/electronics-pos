/**
 * server.js
 * Express server entrypoint for the POS backend. Registers middleware, routes and static assets.
 * NOTE: For production, move sensitive values (DB URL, JWT secret, PORT) to environment variables.
 */
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Authentication routes (register/login/change-password)
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);


// Connect to MongoDB (uses MONGODB_URI env var in production, falls back to local DB)
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pos_system")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Default Route
app.get("/", (req, res) => {
  res.send("POS System Backend Running");
});

const path = require('path');
// Serve product images
app.use('/uploads/products', express.static(path.join(__dirname, 'public', 'products')));

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const productRoutes = require("./routes/products");
app.use("/api/products", productRoutes);

const saleRoutes = require("./routes/sales");
app.use("/api/sales", saleRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);
