// src/components/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar({ role }) {
  const navigate = useNavigate();
  const handleLogout = () => navigate("/login");

  return (
    <aside
      className="w-64 bg-white shadow-md fixed left-0 top-[4.5rem] h-[calc(100vh-4.5rem)] flex flex-col border-r z-40 "
    >
      

      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        <NavLink
          to="/student-dashboard"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-md hover:bg-blue-50 ${
              isActive
                ? "bg-blue-100 text-blue-800 font-medium"
                : "text-gray-700"
            }`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/complaints/new"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-md hover:bg-blue-50 ${
              isActive
                ? "bg-blue-100 text-blue-800 font-medium"
                : "text-gray-700"
            }`
          }
        >
          Add New Complaint
        </NavLink>
        <NavLink
          to="/complaints"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-md hover:bg-blue-50 ${
              isActive
                ? "bg-blue-100 text-blue-800 font-medium"
                : "text-gray-700"
            }`
          }
        >
          My Complaints
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-md hover:bg-blue-50 ${
              isActive
                ? "bg-blue-100 text-blue-800 font-medium"
                : "text-gray-700"
            }`
          }
        >
          Profile
        </NavLink>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
