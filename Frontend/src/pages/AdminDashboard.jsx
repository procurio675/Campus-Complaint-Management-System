import React, { useState, useRef, useEffect, useMemo } from "react";
import { Routes, Route, Link, useNavigate, Navigate, useLocation } from "react-router-dom";
import { FaBell, FaUserCircle, FaChevronDown } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';

import AdminSidebar from "../components/AdminSidebar";
import ProfilePage from "./ProfilePage";
import CreateAccountPage from "./CreateAccountPage"; // <--- 1. IMPORT ADDED

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
        pending: complaints.filter((c) => c.status === "pending").length,
        inProgress: complaints.filter((c) => c.status === "in-progress").length,
        resolved: complaints.filter((c) => c.status === "resolved").length,
        rejected: complaints.filter((c) => c.status === "rejected").length,
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
      pending: "bg-yellow-50 text-yellow-700",
      "in-progress": "bg-blue-50 text-blue-700",
      resolved: "bg-green-50 text-green-700",
      rejected: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
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
                <th className="p-3 text-sm font-semibold text-gray-600 w-36">
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
                  <td className="p-3 whitespace-nowrap">{getStatusBadge(complaint.status)}</td>
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
  const [showViewModal, setShowViewModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusDescription, setStatusDescription] = useState("");
  const [updating, setUpdating] = useState(false);
  const [sortConfig, setSortConfig] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    committee: [],
    priority: [],
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState("");


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

      await fetchAllComplaints();

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

  // --- MERGE CONFLICT WAS HERE ---
  // I have kept the new `openViewModal` function from the pull
  // and removed the conflict markers.
  const openViewModal = (complaint) => {
    setSelectedComplaint(complaint);
    setShowViewModal(true);
  };

  const getComplaintId = (id) => {
    if (!id) return "";
    return `CC${id.slice(-6).toUpperCase()}`;
  };
  // --- END OF CONFLICT RESOLUTION ---

  const sortComplaints = (key, newDirection) => {
    setSortConfig({ key, direction: newDirection });
  };

  const sortedAndFilteredComplaints = useMemo(() => {
    let processableComplaints = [...complaints];
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase().trim();
      const searchWords = lowerCaseSearch.split(/\s+/).filter(word => word.length > 0);

      processableComplaints = processableComplaints.filter(c => {
        if (!c) return false;

        const title = (c.title || "").toLowerCase();
        const category = (c.category || "").toLowerCase();
        const complaintId = getComplaintId(c._id).toLowerCase();
        const userName = (c.userId?.name || "").toLowerCase();
        const directMatch =
          title.includes(lowerCaseSearch) ||
          category.includes(lowerCaseSearch) ||
          complaintId.includes(lowerCaseSearch);

        if (directMatch) return true;


        if (searchWords.length > 0) {

          const wordMatch = searchWords.every(word => userName.includes(word));
          if (wordMatch) return true;
        }

        return false;
      });
    }


    if (filters.status.length > 0) {
      processableComplaints = processableComplaints.filter(c => c && filters.status.includes(c.status));
    }
    if (filters.committee.length > 0) {
      processableComplaints = processableComplaints.filter(c => c && filters.committee.includes(c.category));
    }
    if (filters.priority.length > 0) {
      processableComplaints = processableComplaints.filter(c => c && filters.priority.includes(c.priority));
    }

    if (sortConfig && sortConfig.key) {
      processableComplaints.sort((a, b) => {
        if (!a) return sortConfig.direction === "ascending" ? 1 : -1;
        if (!b) return sortConfig.direction === "ascending" ? -1 : 1;

        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];


        if (sortConfig.key === "priority") {
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          aVal = priorityOrder[aVal] || 0;
          bVal = priorityOrder[bVal] || 0;
        }

        if (aVal == null) return sortConfig.direction === "ascending" ? 1 : -1;
        if (bVal == null) return sortConfig.direction === "ascending" ? -1 : 1;


        if (aVal < bVal) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return processableComplaints;
  }, [complaints, sortConfig, filters, searchTerm]);

  const handleFilterChange = (filterType, value, isChecked) => {
    setTempFilters(prev => {
      const currentValues = prev[filterType];
      if (isChecked) {
        return { ...prev, [filterType]: [...currentValues, value] };
      } else {
        return { ...prev, [filterType]: currentValues.filter(v => v !== value) };
      }
    });
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    const defaultFilters = { status: [], committee: [], priority: [] };
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
    setShowFilterModal(false);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-50 text-yellow-700",
      "in-progress": "bg-blue-50 text-blue-700",
      resolved: "bg-green-50 text-green-700",
      rejected: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
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

  const getSortLabel = () => {
    if (!sortConfig) return "Sort By";

    if (sortConfig.key === "priority") {
      return `Priority: ${sortConfig.direction === "ascending" ? "Low ↓" : "High ↑"}`;
    }
    if (sortConfig.key === "createdAt") {
      return `Date: ${sortConfig.direction === "ascending" ? "Oldest ↓" : "Newest ↑"}`;
    }

    return "Sort By";
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
            Total: {sortedAndFilteredComplaints.length} complaints (Filtered from {complaints.length})
          </p>
        </div>


        <div className="flex gap-3 items-center">

          <div className="relative">
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 w-48 sm:w-64"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>


          <div className="relative">
            <select
              value={sortConfig ? `${sortConfig.key}-${sortConfig.direction}` : ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  const [key, direction] = value.split('-');
                  sortComplaints(key, direction);
                } else {
                  setSortConfig(null);
                }
              }}
              className="px-6 py-1.5 border border-gray-300 rounded-lg text-sm bg-white shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="" className="text-gray-500">{getSortLabel()}</option>
              <option value="priority-descending">Priority: High to Low</option>
              <option value="priority-ascending">Priority: Low to High</option>
              <option value="createdAt-descending">Date: New to Old</option>
              <option value="createdAt-ascending">Date: Old to New</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>


          <button
            onClick={() => {
              setTempFilters(filters);
              setShowFilterModal(true);
            }}
            className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg shadow-sm font-medium transition-colors border ${
              (filters.status.length > 0 || filters.committee.length > 0 || filters.priority.length > 0)
                ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"></path>
            </svg>
            {(filters.status.length > 0 || filters.committee.length > 0 || filters.priority.length > 0) && (
              <span className={`text-xs font-bold ${ (filters.status.length > 0 || filters.committee.length > 0 || filters.priority.length > 0) ? 'text-white' : 'text-blue-600'}`}>
                ({filters.status.length + filters.committee.length + filters.priority.length})
              </span>
            )}
          </button>

          <button
            onClick={fetchAllComplaints}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {sortedAndFilteredComplaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No complaints found matching current criteria.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 text-sm font-semibold text-gray-600">ID</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Title</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Priority</th>
                <th className="p-3 text-sm font-semibold text-gray-600 w-36">Status</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Filed By</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Committee</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndFilteredComplaints.map((complaint) => (
                <tr

                  key={complaint?._id || Math.random()}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-gray-700 font-mono text-sm">
                    {getComplaintId(complaint?._id)}
                  </td>
                  <td className="p-3 text-gray-700 max-w-xs truncate">
                    {complaint?.title}
                  </td>
                  <td className="p-3">{getPriorityBadge(complaint?.priority)}</td>
                  <td className="p-3 whitespace-nowrap">{getStatusBadge(complaint?.status)}</td>
                  <td className="p-3 text-gray-600 text-sm">
                    {complaint?.userId?.name || "Unknown"}
                  </td>
                  <td className="p-3 text-gray-600 text-sm">
                    {formatDate(complaint?.createdAt)}
                  </td>
                  <td className="p-3 text-gray-600 text-sm">
                    {complaint?.category}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openStatusModal(complaint)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Update Status
                      </button>
                      <button
                        onClick={() => openViewModal(complaint)}
                        className="px-3 py-1 bg-white border border-gray-200 text-blue-600 text-sm rounded hover:bg-gray-50"
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showViewModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Complaint Details</h2>
                <p className="text-sm text-gray-600 mt-1">ID: {getComplaintId(selectedComplaint._id)}</p>
              </div>
              <div>
                <button
                  onClick={() => { setShowViewModal(false); setSelectedComplaint(null); }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Title</h3>
                <p className="text-gray-800 mb-3">{selectedComplaint.title}</p>

                <h3 className="text-sm font-semibold text-gray-700">Description</h3>
                <p className="text-gray-700 mb-3 whitespace-pre-line">{selectedComplaint.description}</p>

                <div className="flex flex-wrap gap-3 mt-2">
                  <div className="text-sm text-gray-600 flex items-center gap-2"><strong>Status:</strong><span>{getStatusBadge(selectedComplaint.status)}</span></div>
                  <div className="text-sm text-gray-600"><strong>Priority:</strong> {selectedComplaint.priority || 'N/A'}</div>
                  <div className="text-sm text-gray-600"><strong>Committee:</strong> {selectedComplaint.category || 'N/A'}</div>
                  <div className="text-sm text-gray-600"><strong>Filed By:</strong> {selectedComplaint.userId?.name || 'Anonymous'}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700">Attachments</h3>
                <div className="mt-2 space-y-3">
                  {(selectedComplaint.attachments || []).length === 0 && (
                    <p className="text-gray-500">No attachments uploaded.</p>
                  )}

                  {(selectedComplaint.attachments || []).map((url, idx) => {
                    const lower = (url || '').toLowerCase();
                    const ext = lower.split('.').pop() || '';
                    const isImage = /^(jpg|jpeg|png|gif|webp)$/i.test(ext);
                    const isVideo = /^(mp4|webm|ogg|mov)$/i.test(ext);
                    return (
                      <div key={idx} className="border rounded p-2">
                        {isImage && (
                          <img src={url} alt={`attachment-${idx}`} className="max-w-full h-48 object-contain rounded" />
                        )}
                        {isVideo && (
                          <video controls className="w-full h-48 bg-black rounded">
                            <source src={url} />
                            Your browser does not support the video tag.
                          </video>
                        )}
                        {!isImage && !isVideo && (
                          <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Download / Open attachment</a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
              Filter Complaints
            </h2>

            <div className="space-y-6">

              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Complaint Status
                </h3>
                <div className="flex flex-wrap gap-4">
                  {["pending", "in-progress", "resolved", "rejected"].map((status) => (
                    <label key={status} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempFilters.status.includes(status)}
                        onChange={(e) =>
                          handleFilterChange("status", status, e.target.checked)
                        }
                        className="form-checkbox h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-700 text-sm">
                        {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Priority
                </h3>
                <div className="flex flex-wrap gap-4">
                  {["High", "Medium", "Low"].map((priority) => (
                    <label key={priority} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempFilters.priority.includes(priority)}
                        onChange={(e) =>
                          handleFilterChange("priority", priority, e.target.checked)
                        }
                        className="form-checkbox h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-gray-700 text-sm">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Committee
                </h3>
                <div className="flex flex-wrap gap-4">
                  {[...new Set(complaints.map(c => c.category).filter(c => c))]
                    .filter(category => category !== "Canteen")
                    .filter(category => category !== "Tech Committee")
                    .sort()
                    .map((category) => (
                      <label key={category} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempFilters.committee.includes(category)}
                          onChange={(e) =>
                            handleFilterChange("committee", category, e.target.checked)
                          }
                          className="form-checkbox h-4 w-4 text-blue-600 rounded"
                        />
                        <span className="text-gray-700 text-sm">{category}</span>
                      </label>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8 pt-4 border-t">
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
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


const AnalyticsPage = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [topStats, setTopStats] = React.useState({
    total: 0,
    resolved: 0,
    avgResolutionDays: 0,
    pending: 0,
    monthDeltaPct: null,
  });
  const [committeeStats, setCommitteeStats] = React.useState([]);

  const committeeNameMap = {
    Canteen: "Cafeteria Management Committee",
    Hostel: "Hostel Management Committee",
    Academic: "Academic Committee",
    Sports: "Sports Committee",
    Tech: "Tech-Support Committee",
    'Internal Complaints': "Internal Complaints Committee",
    'Annual Fest': "Annual Fest Committee",
    Cultural: "Cultural Committee",
    Placement: "Student Placement Cell",
    // legacy / alternate keys
    "Anti-Ragging": "Internal Complaints Committee",
  };

  useEffect(() => {
    fetchAnalytics();
    // No automatic refresh — user must press Refresh button
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem('ccms_token');
      if (!token) throw new Error('Missing auth token');

      const { data } = await axios.get(`${API_BASE_URL}/complaints/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const complaints = data.complaints || [];

      const total = complaints.length;
      const resolved = complaints.filter(c => c.status === 'resolved').length;
      const pending = complaints.filter(c => c.status === 'pending').length;

      // average resolution time in days
      const resolvedTimes = complaints.map((c) => {
        try {
          // find resolved timestamp from statusHistory or updatedAt
          let resolvedAt = null;
          if (Array.isArray(c.statusHistory)) {
            const found = c.statusHistory.find(s => s && s.status === 'resolved');
            if (found && found.updatedAt) resolvedAt = new Date(found.updatedAt);
          }
          if (!resolvedAt && c.status === 'resolved' && c.updatedAt) resolvedAt = new Date(c.updatedAt);
          if (resolvedAt && c.createdAt) {
            const created = new Date(c.createdAt);
            return (resolvedAt - created) / (1000*60*60*24);
          }
        } catch (e) { }
        return null;
      }).filter(v => v != null && !isNaN(v));

      const avgResolutionDays = resolvedTimes.length ? (resolvedTimes.reduce((a,b)=>a+b,0)/resolvedTimes.length) : 0;

      // month-over-month delta for total complaints (simple)
      const now = new Date();
      const currMonth = now.getMonth();
      const currYear = now.getFullYear();
      const prev = new Date(now.getFullYear(), now.getMonth()-1, 1);
      const prevMonth = prev.getMonth();
      const prevYear = prev.getFullYear();

      const countThisMonth = complaints.filter(c => {
        try { const d = new Date(c.createdAt); return d.getMonth()===currMonth && d.getFullYear()===currYear; } catch(e){ return false; }
      }).length;
      const countPrevMonth = complaints.filter(c => {
        try { const d = new Date(c.createdAt); return d.getMonth()===prevMonth && d.getFullYear()===prevYear; } catch(e){ return false; }
      }).length;
      const monthDeltaPct = countPrevMonth === 0 ? null : Math.round(((countThisMonth - countPrevMonth)/countPrevMonth)*100);

      // group by category/committee
      // Only include committees that are registered in the backend (canonical list)
      const registeredCommittees = [
        'Canteen',
        'Hostel',
        'Sports',
        'Tech',
        'Academic',
        'Internal Complaints',
        'Annual Fest',
        'Cultural',
        'Placement',
      ];

      const group = {};
      for (const c of complaints) {
        const raw = (c.category || '').toString().trim();
        if (!raw) continue;

        // Try to resolve the complaint's category to one of the registered committee keys.
        let matchedKey = null;
        for (const key of registeredCommittees) {
          // Exact match (most common)
          if (raw === key) {
            matchedKey = key;
            break;
          }
          // Some stored values may use display names like "Hostel Management" or "Cafeteria"
          const display = committeeNameMap[key] || key;
          if (raw === display) {
            matchedKey = key;
            break;
          }
          // Loose contains match (case-insensitive)
          if (raw.toLowerCase().includes(key.toLowerCase()) || display.toLowerCase().includes(raw.toLowerCase())) {
            matchedKey = key;
            break;
          }
        }

        // If we couldn't match this complaint's category to a registered committee, skip it.
        if (!matchedKey) continue;

        const mapped = committeeNameMap[matchedKey] || matchedKey;
        // store by canonical key but include display name
        if (!group[matchedKey]) group[matchedKey] = { committeeKey: matchedKey, committee: mapped, total: 0, resolved: 0, pending: 0 };
        group[matchedKey].total += 1;
        if (c.status === 'resolved') group[matchedKey].resolved += 1;
        if (c.status === 'pending') group[matchedKey].pending += 1;
      }

      const committeeArr = Object.values(group).map(item => ({
        ...item,
        resolutionRate: item.total ? Math.round((item.resolved / item.total) * 100) : 0,
      })).sort((a, b) => b.total - a.total);

      setTopStats({ total, resolved, avgResolutionDays: Number(avgResolutionDays.toFixed(1)), pending, monthDeltaPct, monthCount: countThisMonth });
      setCommitteeStats(committeeArr);
    } catch (err) {
      console.error('Fetch analytics failed', err);
      setError(err?.response?.data?.message || err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Committee Analytics</h1>
      <div className="flex items-center justify-center py-12 text-gray-500">Loading analytics...</div>
    </div>
  );

  if (error) return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Committee Analytics</h1>
      <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800">{error}</div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Committee Analytics</h1>
          <p className="mt-2 text-gray-600">A visual overview of complaint trends, committee performance, and system statistics.</p>
        </div>
        <div>
          <button onClick={fetchAnalytics} className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="p-6 bg-blue-50 rounded-xl">
          <h2 className="font-semibold text-lg">Total Complaints</h2>
          <p className="text-3xl font-bold text-blue-700 mt-2">{topStats.total}</p>
          <p className="text-sm text-gray-600 mt-1">{topStats.monthCount} in current month</p>
        </div>

        <div className="p-6 bg-green-50 rounded-xl">
          <h2 className="font-semibold text-lg">Resolved Complaints</h2>
          <p className="text-3xl font-bold text-green-700 mt-2">{topStats.resolved}</p>
          <p className="text-sm text-gray-600 mt-1">{topStats.total?`${Math.round((topStats.resolved/topStats.total)*100)}% resolution rate`:'—'}</p>
        </div>

        <div className="p-6 bg-yellow-50 rounded-xl">
          <h2 className="font-semibold text-lg">Avg. Resolution Time</h2>
          <p className="text-3xl font-bold text-yellow-700 mt-2">{topStats.avgResolutionDays} days</p>
        </div>

        <div className="p-6 bg-purple-50 rounded-xl">
          <h2 className="font-semibold text-lg">Pending Complaints</h2>
          <p className="text-3xl font-bold text-purple-700 mt-2">{topStats.pending}</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-semibold text-lg text-gray-800 mb-3">Committee-wise Analytics</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 border">Committee</th>
                <th className="p-3 border">Total Complaints</th>
                <th className="p-3 border">Resolved</th>
                <th className="p-3 border">Pending</th>
                <th className="p-3 border">Resolution Rate</th>
                <th className="p-3 border">View Analytics</th>
              </tr>
            </thead>
            <tbody>
              {committeeStats.map((r) => (
                <tr key={r.committee}>
                  <td className="p-3 border">{r.committee}</td>
                  <td className="p-3 border">{r.total}</td>
                  <td className="p-3 border">{r.resolved}</td>
                  <td className="p-3 border">{r.pending}</td>
                  <td className="p-3 border">{r.resolutionRate}%</td>
                  <td className="p-3 border">
                      <Link
                        to={`/admin-dashboard/committee-analytics?ct=${encodeURIComponent(r.committeeKey)}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        View
                      </Link>
                  </td>
                </tr>
              ))}
              {committeeStats.length === 0 && (
                <tr>
                  <td className="p-3 border" colSpan={5}>No data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Admin-only view for a single committee's analytics.
const AdminCommitteeAnalytics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  // read committee type from query param `ct`
  let committeeType = null;
  try {
    const params = new URLSearchParams(location.search);
    committeeType = params.get('ct') || null;
  } catch (e) {
    committeeType = null;
  }

  const fetchMetrics = async () => {
    if (!committeeType) {
      setError('No committee selected');
      return;
    }
    const token = localStorage.getItem('ccms_token');
    if (!token) {
      setError('Missing auth token. Please login again.');
      return;
    }

    try {
      setLoading(true);
      setError("");
      const url = `${API_BASE_URL}/committee-analytics/${encodeURIComponent(committeeType)}`;
      const { data } = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });

      const normalized = {
        total: Number(data.total) || 0,
        resolved: Number(data.resolved) || 0,
        avgResolutionTimeDays: data.avgResolutionTimeDays == null ? 0 : Number(data.avgResolutionTimeDays),
        resolutionRate: data.resolutionRate == null ? 0 : Number(data.resolutionRate),
      };
      setMetrics(normalized);

      // normalize analytics data
      let subArr = [];
      if (data.subcategoryCounts && typeof data.subcategoryCounts === 'object' && !Array.isArray(data.subcategoryCounts)) {
        subArr = Object.keys(data.subcategoryCounts).map(k => ({ category: k, count: data.subcategoryCounts[k] }));
      } else if (Array.isArray(data.categoryCounts)) {
        subArr = data.categoryCounts;
      }

      setAnalyticsData({
        subcategoryCounts: subArr,
        priorityCounts: data.priorityCounts || { High: 0, Medium: 0, Low: 0 },
        statusCounts: data.statusCounts || { pending: 0, 'in-progress': 0, resolved: 0 },
        dailyCounts30Days: data.dailyCounts30Days || [],
      });
    } catch (err) {
      console.error('Admin committee analytics fetch failed', err);
      setError(err?.response?.data?.message || 'Failed to load committee analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!committeeType) return;
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committeeType]);

  const handleChartClick = (type, value) => {
    try {
      localStorage.setItem('analytics_filter', JSON.stringify({ type, value }));
      navigate('/admin-dashboard/all-complaints');
    } catch (e) {
      console.warn('Failed to apply chart filter', e);
    }
  };

  const formatDays = (d) => (d == null ? "—" : `${Number(d).toFixed(1)} days`);
  const formatPct = (p) => (p == null ? "—" : `${Number(p).toFixed(0)}%`);

  if (loading) return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800">{committeeType || 'Committee'} Analytics</h1>
      <div className="flex items-center justify-center py-12 text-gray-500">Loading analytics...</div>
    </div>
  );

  if (error) return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold text-gray-800">{committeeType || 'Committee'} Analytics</h1>
      <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800">{error}</div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{committeeType || 'Committee'} Analytics</h1>
          <p className="mt-2 text-gray-600">Overview of complaints handled by this committee.</p>
        </div>
        <div>
          <button onClick={fetchMetrics} className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50">Refresh</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="p-6 rounded-lg shadow-lg border-l-8 bg-blue-50 border-blue-500">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-700">Total Complaints</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics ? metrics.total : '—'}</p>
        </div>

        <div className="p-6 rounded-lg shadow-lg border-l-8 bg-green-50 border-green-500">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-700">Resolved</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics ? metrics.resolved : '—'}</p>
        </div>

        <div className="p-6 rounded-lg shadow-lg border-l-8 bg-yellow-50 border-yellow-500">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-yellow-700">Avg. Resolution Time</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics ? formatDays(metrics.avgResolutionTimeDays) : '—'}</p>
        </div>

        <div className="p-6 rounded-lg shadow-lg border-l-8 bg-purple-50 border-purple-500">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-700">Resolution Rate</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics ? formatPct(metrics.resolutionRate) : '—'}</p>
        </div>
      </div>

      {analyticsData && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Category Breakdown</h3>
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={(analyticsData.subcategoryCounts || []).filter(d => d.count > 0)}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count">
                    {(analyticsData.subcategoryCounts || []).filter(d => d.count > 0).map((entry, idx) => (
                      <Cell key={`cell-${idx}`} onClick={() => handleChartClick('category', entry.category)} fill={"#4F46E5"} cursor="pointer" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Priority Breakdown</h3>
            <div className="flex items-center gap-4">
              <div style={{ width: '100%', height: 220 }} className="flex-1">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'High', value: analyticsData.priorityCounts.High || 0 },
                        { name: 'Medium', value: analyticsData.priorityCounts.Medium || 0 },
                        { name: 'Low', value: analyticsData.priorityCounts.Low || 0 },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={80}
                      innerRadius={40}
                      onClick={(e) => e && handleChartClick('priority', e.name)}
                      cursor="pointer"
                    >
                      <Cell fill="#DC2626" />
                      <Cell fill="#F59E0B" />
                      <Cell fill="#10B981" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-48">
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'High', color: '#DC2626', value: analyticsData.priorityCounts.High || 0 },
                    { label: 'Medium', color: '#F59E0B', value: analyticsData.priorityCounts.Medium || 0 },
                    { label: 'Low', color: '#10B981', value: analyticsData.priorityCounts.Low || 0 },
                  ].map((item) => (
                    item.value > 0 && (
                      <div key={item.label} className="flex items-center gap-2">
                          <span style={{ width: 12, height: 12, background: item.color, borderRadius: 4, display: 'inline-block' }} />
                          <span className="text-sm text-gray-700">{item.label} :</span>
                          <span className="ml-auto font-bold">{item.value}</span>
                        </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Last 30 Days Trend</h3>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <LineChart data={analyticsData.dailyCounts30Days} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#4F46E5" dot={{ r: 2 }} onClick={(d) => { if (d && d.activePayload && d.activePayload[0]) handleChartClick('date', d.activePayload[0].payload.date); }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};


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

  // Read profile from localStorage and derive display values
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('ccms_user') : null;
  let currentUser = null;
  try {
    currentUser = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    currentUser = null;
  }
  const profileInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A';
  const profileName = currentUser?.name ? currentUser.name : 'Admin';

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
              <Route path="committee-analytics" element={<AdminCommitteeAnalytics />} />
            <Route path="profile" element={<ProfilePage />} />
            
            {/* <--- 2. ROUTE ADDED ---> */}
            <Route path="create-account" element={<CreateAccountPage />} />

            <Route path="*" element={<Navigate to="/admin-dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}