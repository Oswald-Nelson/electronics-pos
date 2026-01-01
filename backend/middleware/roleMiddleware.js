/**
 * roleMiddleware.js
 * Checks that the authenticated user has one of the allowed roles for a route.
 */
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Ensure there is an authenticated user
    if (!req.user) return res.status(401).json({ message: "Not authorized" });
    // Verify user's role is allowed to access the resource
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    next();
  };
};
