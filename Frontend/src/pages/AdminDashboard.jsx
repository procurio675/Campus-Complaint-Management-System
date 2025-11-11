import React, { useState, useRef, useEffect } from "react";
import { Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaChevronDown } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

import AdminSidebar from "../components/AdminSidebar";
import ProfilePage from "./ProfilePage";

// Admin Dashboard Home with real-time complaints
const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const token = localStorage.getItem("ccms_token");
      if (!token) {
        setError("You are not logged in. Please login again.");
        setLoading(false);
        return;
      }

      // Fetch all complaints for admin
      const { data } = await axios.get(
        `${API_BASE_URL}/complaints/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const complaints = data.complaints || [];
      
      // Calculate stats
      const statsData = {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'pending').length,
        inProgress: complaints.filter(c => c.status === 'in-progress').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        rejected: complaints.filter(c => c.status === 'rejected').length,
      };
      
      setStats(statsData);
      // Get only the 5 most recent complaints
      setRecentComplaints(complaints.slice(0, 5));
    } catch (err) {
      console.error("Fetch Dashboard Data Error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to fetch dashboard data. Please try again."
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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      label: "Total Complaints",
      value: stats.total,
      color: "blue",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "red",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      color: "yellow",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      color: "green",
    },
  ];

  const getBorderColor = (color) => {
    switch (color) {
      case "blue":
        return "border-blue-500";
      case "green":
        return "border-green-500";
      case "yellow":
        return "border-yellow-500";
      case "red":
        return "border-red-500";
      default:
        return "border-gray-500";
    }
  };

  const getBackgroundColor = (color) => {
    switch (color) {
      case "blue":
        return "bg-blue-50";
      case "green":
        return "bg-green-50";
      case "yellow":
        return "bg-yellow-50";
      case "red":
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
  };

  const getLabelColor = (color) => {
    switch (color) {
      case "blue":
        return "text-blue-700";
      case "green":
        return "text-green-700";
      case "yellow":
        return "text-yellow-700";
      case "red":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome, College Admin 👋</h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your recent complaint activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className={`p-6 rounded-lg shadow-lg border-l-8 ${getBackgroundColor(
              stat.color
            )} ${getBorderColor(stat.color)}`}
          >
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-medium ${getLabelColor(stat.color)}`}
              >
                {stat.label}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Recent Complaints
          </h2>
          <Link
            to="/admin-dashboard/all-complaints"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </Link>
        </div>
        {recentComplaints.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No complaints have been filed yet.
          </p>
        ) : (
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
                  Status
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Filed By
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints.map((complaint) => (
                <tr key={complaint._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-gray-700 font-mono text-sm">
                    {getComplaintId(complaint._id)}
                  </td>
                  <td className="p-3 text-gray-700 max-w-xs truncate">
                    {complaint.title}
                  </td>
                  <td className="p-3">{getStatusBadge(complaint.status)}</td>
                  <td className="p-3 text-gray-600 text-sm">
                    {getUserName(complaint.userId)}
                  </td>
                  <td className="p-3 text-gray-600 text-sm">
                    {formatDate(complaint.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const AllComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusDescription, setStatusDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const fetchAllComplaints = async () => {
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
        `${API_BASE_URL}/complaints/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Fetch All Complaints Error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to fetch complaints. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || !statusDescription.trim()) {
      alert("Please select a status and provide a description.");
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem("ccms_token");

      await axios.patch(
        `${API_BASE_URL}/complaints/${selectedComplaint._id}/status`,
        {
          status: newStatus,
          description: statusDescription.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh complaints list
      await fetchAllComplaints();
      
      // Close modal and reset
      setShowStatusModal(false);
      setSelectedComplaint(null);
      setNewStatus("");
      setStatusDescription("");
      
      alert("Status updated successfully!");
    } catch (err) {
      console.error("Update Status Error:", err);
      alert(
        err?.response?.data?.message ||
          "Failed to update status. Please try again."
      );
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusDescription("");
    setShowStatusModal(true);
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
    });
  };

  const getComplaintId = (id) => {
    if (!id) return "N/A";
    return `CC${id.slice(-6).toUpperCase()}`;
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">All Complaints</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading complaints...</div>
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
            onClick={fetchAllComplaints}
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
            Total: {complaints.length} complaints
          </p>
        </div>
        <button
          onClick={fetchAllComplaints}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No complaints found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-sm font-semibold text-gray-600">ID</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Title</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Priority</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Filed By</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Committee</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
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
                  <td className="p-3">{getPriorityBadge(complaint.priority)}</td>
                  <td className="p-3">{getStatusBadge(complaint.status)}</td>
                  <td className="p-3 text-gray-600 text-sm">
                    {complaint.userId?.name || "Unknown"}
                  </td>
                  <td className="p-3 text-gray-600 text-sm">
                    {formatDate(complaint.createdAt)}
                  </td>
                  <td className="p-3 text-gray-600 text-sm">
                    {complaint.category}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openStatusModal(complaint)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Update Complaint Status
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Complaint:</strong> {selectedComplaint.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>ID:</strong> {getComplaintId(selectedComplaint._id)}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (Required)
              </label>
              <textarea
                value={statusDescription}
                onChange={(e) => setStatusDescription(e.target.value)}
                placeholder="e.g., Assigned to maintenance team, expected resolution in 2 hours."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update"}
              </button>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedComplaint(null);
                  setNewStatus("");
                  setStatusDescription("");
                }}
                disabled={updating}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


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
            <Route path="/" element={<AdminDashboardHome />} />
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
