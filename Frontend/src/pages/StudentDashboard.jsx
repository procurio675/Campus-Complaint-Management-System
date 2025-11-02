import React from "react";
import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaChevronDown, FaPlus } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import DashboardHome from "./DashboardHome";
import ProfilePage from "./ProfilePage";

import AddComplaintPage from "./AddComplaintPage"; 

const MyComplaintsPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h1 className="text-2xl font-bold">My Complaints</h1>
    <p className="mt-4">This page will list all complaints filed by you.</p>
  </div>
);

const AllComplaintsPage = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h1 className="text-2xl font-bold">All Complaints</h1>
    <p className="mt-4">
      This page will list all public complaints on campus.
    </p>
  </div>
);

export default function StudentDashboard() {
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
      <Sidebar />
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
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                  N
                </div>
                <span className="font-semibold text-gray-700 hidden md:block">
                  Name
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
                    to="/student-dashboard/profile"
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

        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="add-complaint" element={<AddComplaintPage />} />
            <Route path="my-complaints" element={<MyComplaintsPage />} />
            <Route path="all-complaints" element={<AllComplaintsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}