// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const logout = () => navigate("/login");

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow z-50 h-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold">
            CC
          </div>
          <div>
            <Link to="/dashboard" className="font-semibold text-lg text-blue-800">
              CCMS
            </Link>
            <div className="text-xs text-gray-500">
              Campus Complaint Management System
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
