const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);


// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/pos_system")
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
