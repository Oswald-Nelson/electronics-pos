/**
 * ProtectedRoute.jsx
 * Simple route wrapper that redirects unauthenticated or unauthorized users.
 */
import React from "react";
import { Navigate } from "react-router-dom";

// Usage: <ProtectedRoute allowedRoles={["admin"]}><YourComponent/></ProtectedRoute>
export default function ProtectedRoute({ allowedRoles = [], children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Redirect if not logged-in or if role is not allowed

  if (!token) return <Navigate to="/" replace />;
  if (allowedRoles.length && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}
