/**
 * ProtectedRoute.jsx
 * Simple route wrapper that redirects unauthenticated or unauthorized users.
 */
import React from "react";
import { Navigate } from "react-router-dom";

// Usage: <ProtectedRoute allowedRoles={["admin"]}><YourComponent/></ProtectedRoute>
export default function ProtectedRoute({ allowedRoles = [], children }) {
  // Token and role are stored in localStorage after login; this is a simple
  // client-side guard (the server must still enforce auth & role checks).
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Redirect if not logged-in or if role is not allowed
  // `replace` avoids adding the redirect to the history stack
  if (!token) return <Navigate to="/" replace />;
  if (allowedRoles.length && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}
