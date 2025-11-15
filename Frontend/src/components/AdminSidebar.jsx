import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaListAlt,
  FaChartBar,
  FaClipboardList,
  FaUserPlus, // 1. RE-ADDED THE ICON IMPORT
} from "react-icons/fa";

const Logo = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-3 mb-8 focus:outline-none group"
    aria-label="Go to admin dashboard"
  >
    <div className="bg-blue-600 h-11 w-11 rounded-full text-white font-black text-lg tracking-tight flex items-center justify-center shadow-md">
      CCR
    </div>
    <span className="text-gray-500 text-sm font-semibold group-hover:text-gray-700 transition-colors">
      Admin Portal
    </span>
  </button>
);

const NavItem = ({ to, icon, children }) => {
  const activeClass = "bg-blue-50 text-blue-600";
  const inactiveClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
          isActive ? activeClass : inactiveClass
        }`
      }
    >
      {icon}
      <span className="font-medium">{children}</span>
    </NavLink>
  );
};

export default function AdminSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-64 h-screen bg-white shadow-xl flex flex-col fixed">
      <div className="p-6">
        <Logo onClick={() => navigate("/admin-dashboard")} />
        <nav className="flex flex-col gap-2">
          <NavItem to="/admin-dashboard" icon={<FaHome size={18} />}>
            Home
          </NavItem>
          <NavItem
            to="/admin-dashboard/all-complaints"
            icon={<FaListAlt size={18} />}
          >
            All Complaints
          </NavItem>

          <NavItem
            to="/admin-dashboard/general-complaints"
            icon={<FaClipboardList size={18} />}
          >
            General Complaints
          </NavItem>

          <NavItem
            to="/admin-dashboard/analytics"
            icon={<FaChartBar size={18} />}
          >
            Analytics
          </NavItem>
          
          {/* 2. RE-ADDED THE NAVITEM LINK */}
          <NavItem
            to="/admin-dashboard/create-account"
            icon={<FaUserPlus size={18} />}
          >
            Create/Delete Account
          </NavItem>
        </nav>
      </div>
    </aside>
  );
}
