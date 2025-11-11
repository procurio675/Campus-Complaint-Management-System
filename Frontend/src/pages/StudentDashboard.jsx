import React from "react";
import { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaChevronDown, FaPlus, FaEye, FaThumbsUp } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

import Sidebar from "../components/Sidebar";
import DashboardHome from "./DashboardHome";
import ProfilePage from "./ProfilePage";

import AddComplaintPage from "./AddComplaintPage"; 

const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("ccms_token");
      if (!token) {
        setError("You are not logged in. Please login again.");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(
        `${API_BASE_URL}/complaints/my-complaints`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Fetch Complaints Error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to fetch complaints. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          priorityStyles[priority] || "bg-gray-100 text-gray-800"
        }`}
      >
        {priority}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getComplaintId = (id) => {
    if (!id) return "N/A";
    return `CC${id.slice(-6).toUpperCase()}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Complaints</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading complaints...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">My Complaints</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchComplaints}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Complaints</h1>
        <button
          onClick={fetchComplaints}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            You haven't filed any complaints yet.
          </p>
          <Link
            to="/student-dashboard/add-complaint"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            File a New Complaint
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Complaint ID
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Title
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Committee
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Priority
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Date
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr
                  key={complaint._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-gray-700 font-mono text-sm">
                    {getComplaintId(complaint._id)}
                  </td>
                  <td className="p-3 text-gray-700 max-w-xs truncate">
                    {complaint.title}
                  </td>
                  <td className="p-3 text-gray-700">{complaint.category}</td>
                  <td className="p-3">{getPriorityBadge(complaint.priority)}</td>
                  <td className="p-3">{getStatusBadge(complaint.status)}</td>
                  <td className="p-3 text-gray-600 text-sm">
                    {formatDate(complaint.createdAt)}
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/student-dashboard/complaint/${complaint._id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      <FaEye />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Complaint Detail Page with Status History
const ComplaintDetailPage = () => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get complaint ID from URL
  const complaintId = window.location.pathname.split('/').pop();

  useEffect(() => {
    fetchComplaintDetails();
  }, [complaintId]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("ccms_token");
      if (!token) {
        setError("You are not logged in. Please login again.");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(
        `${API_BASE_URL}/complaints/${complaintId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setComplaint(data.complaint);
    } catch (err) {
      console.error("Fetch Complaint Details Error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to fetch complaint details. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getComplaintId = (id) => {
    if (!id) return "N/A";
    return `CC${id.slice(-6).toUpperCase()}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Complaint Details</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading complaint details...</div>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Complaint Details</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || "Complaint not found"}</p>
          <button
            onClick={() => navigate("/student-dashboard/my-complaints")}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Back to My Complaints
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Complaint Details</h1>
            <p className="text-sm text-gray-600 mt-1">
              ID: {getComplaintId(complaint._id)}
            </p>
          </div>
          <button
            onClick={() => navigate("/student-dashboard/my-complaints")}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to My Complaints
          </button>
        </div>

        {/* Complaint Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 font-semibold">Title</p>
            <p className="text-gray-800">{complaint.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Status</p>
            <div className="mt-1">{getStatusBadge(complaint.status)}</div>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Committee</p>
            <p className="text-gray-800">{complaint.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Priority</p>
            <p className="text-gray-800">{complaint.priority}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-semibold">Filed On</p>
            <p className="text-gray-800">{formatDate(complaint.createdAt)}</p>
          </div>
          {complaint.location && (
            <div>
              <p className="text-sm text-gray-600 font-semibold">Location</p>
              <p className="text-gray-800">{complaint.location}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 font-semibold mb-2">Description</p>
          <p className="text-gray-800 whitespace-pre-wrap">{complaint.description}</p>
        </div>
      </div>

      {/* Status History */}
      {complaint.statusHistory && complaint.statusHistory.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Status Updates</h2>
          <div className="space-y-4">
            {complaint.statusHistory.map((history, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded-r-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(history.status)}
                  <span className="text-sm text-gray-600">
                    {formatDate(history.updatedAt)}
                  </span>
                </div>
                {history.description && (
                  <p className="text-gray-700 text-sm">{history.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show message if no status updates yet */}
      {(!complaint.statusHistory || complaint.statusHistory.length === 0) && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Status Updates</h2>
          <p className="text-gray-500 text-center py-8">
            No status updates yet. You will be notified when there are updates on your complaint.
          </p>
        </div>
      )}
    </div>
  );
};

const AllComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upvoting, setUpvoting] = useState({}); // Track which complaint is being upvoted

  useEffect(() => {
    fetchPublicComplaints();
  }, []);

  const fetchPublicComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("ccms_token");
      if (!token) {
        setError("You are not logged in. Please login again.");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(
        `${API_BASE_URL}/complaints/public`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Fetch Public Complaints Error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to fetch public complaints. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (complaintId) => {
    try {
      setUpvoting({ ...upvoting, [complaintId]: true });
      
      const token = localStorage.getItem("ccms_token");
      if (!token) {
        setError("You are not logged in. Please login again.");
        return;
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/complaints/${complaintId}/upvote`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the complaint in the list
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) => {
          if (complaint._id === complaintId) {
            return {
              ...complaint,
              upvoteCount: data.upvoteCount,
              hasUpvoted: data.hasUpvoted,
              priority: data.priority, // Update priority if it changed
            };
          }
          return complaint;
        })
      );

      // Re-sort complaints by upvote count
      setComplaints((prevComplaints) => {
        const sorted = [...prevComplaints].sort((a, b) => {
          const aUpvotes = a.upvoteCount || 0;
          const bUpvotes = b.upvoteCount || 0;
          if (bUpvotes !== aUpvotes) {
            return bUpvotes - aUpvotes;
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        return sorted;
      });
    } catch (err) {
      console.error("Upvote Error:", err);
      const errorMsg = err?.response?.data?.message || "Failed to upvote complaint. Please try again.";
      alert(errorMsg);
    } finally {
      setUpvoting((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          statusStyles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityStyles = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          priorityStyles[priority] || "bg-gray-100 text-gray-800"
        }`}
      >
        {priority}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getComplaintId = (id) => {
    if (!id) return "N/A";
    return `CC${id.slice(-6).toUpperCase()}`;
  };

  const getUserName = (userId) => {
    if (!userId) return "Unknown";
    return userId.name || "Unknown";
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">All Complaints</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading public complaints...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">All Complaints</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchPublicComplaints}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Complaints</h1>
          <p className="text-sm text-gray-600 mt-1">
            Public complaints filed by students across campus
          </p>
        </div>
        <button
          onClick={fetchPublicComplaints}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No public complaints have been filed yet.
          </p>
          <Link
            to="/student-dashboard/add-complaint"
            className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            File a New Complaint
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Complaint ID
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Title
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Committee
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Priority
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Filed By
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Date
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Upvotes
                </th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((complaint) => (
                <tr
                  key={complaint._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-gray-700 font-mono text-sm">
                    {getComplaintId(complaint._id)}
                  </td>
                  <td className="p-3 text-gray-700 max-w-xs truncate">
                    {complaint.title}
                  </td>
                  <td className="p-3 text-gray-700">{complaint.category}</td>
                  <td className="p-3">{getPriorityBadge(complaint.priority)}</td>
                  <td className="p-3">{getStatusBadge(complaint.status)}</td>
                  <td className="p-3 text-gray-600 text-sm">
                    {getUserName(complaint.userId)}
                  </td>
                  <td className="p-3 text-gray-600 text-sm">
                    {formatDate(complaint.createdAt)}
                  </td>
                  <td className="p-3 text-gray-600 text-sm text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span>{complaint.upvoteCount || complaint.upvotes?.length || 0}</span>
                      <button
                        onClick={() => handleUpvote(complaint._id)}
                        disabled={upvoting[complaint._id]}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                          complaint.hasUpvoted
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } ${upvoting[complaint._id] ? "opacity-50 cursor-not-allowed" : ""}`}
                        title={complaint.hasUpvoted ? "Remove upvote" : "Upvote this complaint"}
                      >
                        <FaThumbsUp size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function StudentDashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // load logged-in user (stored at login) and derive display values
  let _storedUser = null;
  try {
    _storedUser = JSON.parse(localStorage.getItem("ccms_user"));
  } catch (e) {
    _storedUser = null;
  }
  const profileName = (_storedUser && _storedUser.name) || "Name";
  const profileInitial = profileName ? profileName.charAt(0).toUpperCase() : "N";

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem("ccms_token");
    localStorage.removeItem("ccms_user");
    
    // Navigate to login and replace history to prevent back button access
    navigate("/login", { replace: true });
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
         
          <h1 className="text-xl font-semibold text-gray-800">
            Campus Complaint Resolve
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
                  {profileInitial}
                </div>
                <span className="font-semibold text-gray-700 hidden md:block">
                  {profileName}
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
            <Route path="complaint/:id" element={<ComplaintDetailPage />} />
            <Route path="all-complaints" element={<AllComplaintsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}