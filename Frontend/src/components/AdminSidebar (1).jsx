import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaListAlt,
  // FaUsers, // REMOVED
  FaChartBar,
  FaClipboardList,
} from "react-icons/fa";

const Logo = () => (
  <div className="flex items-center gap-2 mb-8">
    <div className="bg-blue-600 p-2 rounded-full text-white">
      <span className="font-bold text-xl">AD</span>
    </div>
    <span className="text-gray-700 font-semibold text-lg">Admin</span>
  </div>
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
  return (
    <aside className="w-64 h-screen bg-white shadow-xl flex flex-col fixed">
      <div className="p-6">
        <Logo />
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

          {/* REMOVED NAV ITEM
          <NavItem
            to="/admin-dashboard/committee-dashboard"
            icon={<FaUsers size={18} />}
          >
            Committee Dashboard
          </NavItem> 
          */}
          
          <NavItem
            to="/admin-dashboard/analytics"
            icon={<FaChartBar size={18} />}
          >
            Analytics
          </NavItem>
        </nav>
      </div>
    </aside>
  );
}