import React from "react";
import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useNavigate, NavLink } from "react-router-dom";
import {
  FaBell,
  FaUserCircle,
  FaChevronDown,
  FaTachometerAlt,
  FaTasks,
  FaChartBar,
  FaFileAlt,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

// Import shared pages (like Profile)
import ProfilePage from "./ProfilePage";

// --- 1. Sidebar Component (defined in the same file) ---

// Helper component for the navigation links
const SidebarLink = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      end // Use 'end' for the dashboard link to only match the base path
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

// Main Sidebar Component
const CommitteeSidebar = () => {
  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-white border-r flex flex-col z-10">
      <div className="h-20 flex items-center justify-center px-8 border-b">
        <h1 className="text-xl font-bold text-blue-700">Committee Portal</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <SidebarLink
          to="/committee-dashboard"
          icon={<FaTachometerAlt size={18} />}
          label="Dashboard"
        />
        {/* C2: View & manage assigned complaints */}
        <SidebarLink
          to="/committee-dashboard/assigned-complaints"
          icon={<FaTasks size={18} />}
          label="Assigned Complaints"
        />
        {/* C4: Department/committee analytics */}
        <SidebarLink
          to="/committee-dashboard/analytics"
          icon={<FaChartBar size={18} />}
          label="Analytics"
        />
        {/* C5: Generate monthly reports */}
        <SidebarLink
          to="/committee-dashboard/reports"
          icon={<FaFileAlt size={18} />}
          label="Reports"
        />
      </nav>
      
      <div className="p-4 border-t">
         <p className="text-xs text-gray-500">Logged in as Handler</p>
      </div>
    </aside>
  );
};

// --- 2. Placeholder Pages for Committee Features ---

// C2: View & manage assigned complaints
const AssignedComplaintsPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h1 className="text-2xl font-bold">Assigned Complaints</h1>
    <p className="mt-4">
      This page will list all complaints assigned to your committee.
    </p>
    {/* Handlers would list, filter, search, and manage complaints here */}
  </div>
);

// C4: Department/committee analytics dashboard
const AnalyticsDashboardPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
    <p className="mt-4">
      This page will show department-level metrics, counts, and average resolution time.
    </p>
  </div>
);

// C5: Generate monthly committee reports (Convener)
const ReportsPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h1 className="text-2xl font-bold">Generate Reports</h1>
    <p className="mt-4">
      This page will allow Conveners to generate and publish pre-built monthly reports.
    </p>
  </div>
);

// A simple dashboard home for the committee
const CommitteeDashboardHome = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h1 className="text-2xl font-bold">Committee Dashboard</h1>
    <p className="mt-4">Welcome. You have [X] complaints pending review.</p>
  </div>
);

// --- 3. Main Committee Dashboard Component (Exported) ---

export default function CommitteeDashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="flex h-screen bg-white">
      {/* Use the CommitteeSidebar defined above */}
      <CommitteeSidebar />
      <div className="flex-1 flex flex-col pl-64">
        
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8 border-b">
          <h1 className="text-lg font-semibold text-gray-800">
            Campus Complaint Management System
          </h1>
          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-800 transition-colors">
              <FaBell size={22} />
            </button>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
                  C
                </div>
                <span className="font-semibold text-gray-700 hidden md:block">
                  Committee Name
                </span>
                <FaChevronDown
                  size={12}
                  className={`text-gray-500 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden border">
                  <Link
                    to="/committee-dashboard/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FaUserCircle />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content area with Committee-specific routes */}
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<CommitteeDashboardHome />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="assigned-complaints"
              element={<AssignedComplaintsPage />}
            />
            <Route path="analytics" element={<AnalyticsDashboardPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}