import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaPlusCircle,
  FaListAlt,
  FaUserCircle,
  FaListUl,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

const Logo = () => (
  <div className="flex items-center gap-2 mb-8">
    <div className="bg-blue-600 p-2 rounded-full text-white">
      <span className="font-bold text-xl">CC</span>
    </div>
    <div className="flex flex-col">
      <span className="text-gray-700 font-semibold text-lg">CCMS</span>
      <span className="text-gray-500 text-sm font-medium">Student Portal</span>
    </div>
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

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-white shadow-xl flex flex-col fixed">
      <div className="p-6">
        <Logo />
        <nav className="flex flex-col gap-2">
          <NavItem to="/student-dashboard" icon={<FaHome size={18} />}>
            Home
          </NavItem>
          <NavItem
            to="/student-dashboard/add-complaint"
            icon={<FaPlusCircle size={18} />}
          >
            Add New Complaint
          </NavItem>
          <NavItem
            to="/student-dashboard/my-complaints"
            icon={<FaListAlt size={18} />}
          >
            My Complaints
          </NavItem>

          <NavItem
            to="/student-dashboard/all-complaints"
            icon={<FaListUl size={18} />}
          >
            All Complaints
          </NavItem>
        </nav>
      </div>
    </aside>
  );
}