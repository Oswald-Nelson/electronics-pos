/**
 * authMiddleware.js
 * Protect routes by verifying JWT and attaching user to req.user.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  let token; // token will be read from Authorization header (Bearer <token>)

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // Verify token using configured secret (falls back to the local dev secret)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRETKEY123");
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
