import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../services/AuthContext";

export default function RequireAuth({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; 
  if (!token) return <Navigate to="/" replace state={{ from: location }} />;
  return children;
}
