import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("ccms_token");
    const userStr = localStorage.getItem("ccms_user");

    if (!token || !userStr) {
      // No token or user data, redirect to login
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(userStr);
      
      // Check if the user's role matches the allowed role
      if (user.role !== allowedRole) {
        // User is logged in but trying to access wrong dashboard
        navigate("/login", { replace: true });
        return;
      }
    } catch (error) {
      // Invalid user data in localStorage
      console.error("Invalid user data:", error);
      localStorage.removeItem("ccms_token");
      localStorage.removeItem("ccms_user");
      navigate("/login", { replace: true });
    }
  }, [navigate, allowedRole]);

  // Check authentication before rendering
  const token = localStorage.getItem("ccms_token");
  const userStr = localStorage.getItem("ccms_user");

  if (!token || !userStr) {
    return null; // Don't render anything while redirecting
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role !== allowedRole) {
      return null; // Don't render anything while redirecting
    }
  } catch (error) {
    return null; // Don't render anything while redirecting
  }

  return children;
};

export default ProtectedRoute;
