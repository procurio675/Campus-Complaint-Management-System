import React, { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaChevronDown } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

import AdminSidebar from "../components/AdminSidebar";
import DashboardHome from "./DashboardHome";
import ProfilePage from "./ProfilePage";


const AllComplaintsPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h1 className="text-2xl font-bold text-gray-800">All Complaints</h1>
    <p className="mt-4 text-gray-600">
      This page will list all complaints across the system. <br />
      Admins can view, assign, or manage them here.
    </p>
  </div>
);


const AnalyticsPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h1 className="text-2xl font-bold text-gray-800">Committee Analytics</h1>
    <p className="mt-4 text-gray-600">
      A visual overview of complaint trends, committee performance, and system statistics.
    </p>

    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      <div className="p-6 bg-blue-50 rounded-xl">
        <h2 className="font-semibold text-lg">Total Complaints</h2>
        <p className="text-3xl font-bold text-blue-700 mt-2">1,248</p>
        <p className="text-sm text-gray-600 mt-1">+12% from last month</p>
      </div>

      <div className="p-6 bg-green-50 rounded-xl">
        <h2 className="font-semibold text-lg">Resolved Complaints</h2>
        <p className="text-3xl font-bold text-green-700 mt-2">982</p>
        <p className="text-sm text-gray-600 mt-1">78% resolution rate</p>
      </div>

      <div className="p-6 bg-yellow-50 rounded-xl">
        <h2 className="font-semibold text-lg">Avg. Resolution Time</h2>
        <p className="text-3xl font-bold text-yellow-700 mt-2">3.4 days</p>
      </div>

      <div className="p-6 bg-purple-50 rounded-xl">
        <h2 className="font-semibold text-lg">Pending Complaints</h2>
        <p className="text-3xl font-bold text-purple-700 mt-2">266</p>
      </div>
    </div>

    {/* Department Breakdown */}
    <div className="mt-10">
      <h2 className="font-semibold text-lg text-gray-800 mb-3">
        Committee-wise Analytics
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 border">Committee</th>
              <th className="p-3 border">Total Complaints</th>
              <th className="p-3 border">Resolved</th>
              <th className="p-3 border">Pending</th>
              <th className="p-3 border">Resolution Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border">Academic Committee</td>
              <td className="p-3 border">312</td>
              <td className="p-3 border">287</td>
              <td className="p-3 border">25</td>
              <td className="p-3 border">92%</td>
            </tr>
            <tr>
              <td className="p-3 border">Hostel Management</td>
              <td className="p-3 border">205</td>
              <td className="p-3 border">164</td>
              <td className="p-3 border">41</td>
              <td className="p-3 border">80%</td>
            </tr>
            <tr>
              <td className="p-3 border">Cafeteria</td>
              <td className="p-3 border">178</td>
              <td className="p-3 border">132</td>
              <td className="p-3 border">46</td>
              <td className="p-3 border">74%</td>
            </tr>
            <tr>
              <td className="p-3 border">Sports Committee</td>
              <td className="p-3 border">123</td>
              <td className="p-3 border">108</td>
              <td className="p-3 border">15</td>
              <td className="p-3 border">88%</td>
            </tr>
            <tr>
              <td className="p-3 border">Anti-Ragging</td>
              <td className="p-3 border">56</td>
              <td className="p-3 border">56</td>
              <td className="p-3 border">0</td>
              <td className="p-3 border">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
);


const generalComplaintsData = [
  {
    id: 1,
    title: "Monkey menace near academic block",
    description: "Monkeys continue to roam near the academic block; students have been bitten or chased.",
    committee: "General",
    priority: "High",
    type: "General",
    anonymous: "No",
  },
  {
    id: 2,
    title: "Streetlights not working",
    description: "The streetlights between the hostel and main gate stop working after 9 PM.",
    committee: "General",
    priority: "High",
    type: "General",
    anonymous: "No",
  },
  {
    id: 5,
    title: "Unclean water from coolers",
    description: "Water coolers near the CEP area are dispensing bad-smelling, unclean water.",
    committee: "General",
    priority: "High",
    type: "General",
    anonymous: "No",
  },
  {
    id: 3,
    title: "Garbage overflow near LT-2",
    description: "The garbage bins near LT-2 overflow regularly and attract stray animals.",
    committee: "General",
    priority: "Medium",
    type: "General",
    anonymous: "No",
  },
  {
    id: 6,
    title: "Parking area congestion",
    description: "The student parking area lacks proper markings; vehicles often get blocked.",
    committee: "General",
    priority: "Medium",
    type: "General",
    anonymous: "No",
  },
  {
    id: 7,
    title: "Library air-conditioning not working",
    description: "The air-conditioning in the library reading room isn’t functioning.",
    committee: "General",
    priority: "Medium",
    type: "General",
    anonymous: "No",
  },
  {
    id: 4,
    title: "Construction noise near library",
    description: "There’s loud construction noise near the library during study hours.",
    committee: "General",
    priority: "Low",
    type: "General",
    anonymous: "No",
  },
];

const PriorityBadge = ({ priority }) => {
  let colors = "bg-gray-100 text-gray-800";
  if (priority === "High") colors = "bg-red-100 text-red-800";
  else if (priority === "Medium") colors = "bg-yellow-100 text-yellow-800";
  else if (priority === "Low") colors = "bg-green-100 text-green-800";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors}`}>
      {priority} Priority
    </span>
  );
};

const ComplaintCard = ({ complaint }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
    <div className="flex justify-between items-start mb-3">
      <h2 className="text-xl font-bold text-gray-800">{complaint.title}</h2>
      <PriorityBadge priority={complaint.priority} />
    </div>
    <p className="text-gray-600 mb-4">{complaint.description}</p>
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <span className="text-gray-500">
        <strong>Committee:</strong> {complaint.committee}
      </span>
      <span className="text-gray-500">
        <strong>Type:</strong> {complaint.type}
      </span>
      <span className="text-gray-500">
        <strong>Anonymous:</strong> {complaint.anonymous}
      </span>
    </div>
    <div className="mt-4 pt-4 border-t border-gray-100">
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
        Take Action
      </button>
      <button className="ml-3 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium">
        View Details
      </button>
    </div>
  </div>
);

const GeneralComplaintsPage = () => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold text-gray-800">Other / General Complaints</h1>
    <p className="text-gray-600">
      A dedicated queue for general campus issues that fall outside specific committee responsibilities.
    </p>

    <div className="space-y-5">
      {generalComplaintsData.map((complaint) => (
        <ComplaintCard key={complaint.id} complaint={complaint} />
      ))}
    </div>
  </div>
);

export default function AdminDashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    // remove jwt token from local storage
    localStorage.removeItem("ccms_token");
    localStorage.removeItem("ccms_user");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Section */}
      <div className="flex-1 flex flex-col pl-64">
        {/* Header */}
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
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  A
                </div>
                <span className="font-semibold text-gray-700 hidden md:block">
                  Admin
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
                    to="/admin-dashboard/profile"
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="all-complaints" element={<AllComplaintsPage />} />
            <Route path="general-complaints" element={<GeneralComplaintsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
