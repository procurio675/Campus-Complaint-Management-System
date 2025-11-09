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
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";

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
const AssignedComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  const fetchAssignedComplaints = async () => {
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
        "http://localhost:5000/api/complaints/assigned",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error("Fetch Assigned Complaints Error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to fetch assigned complaints. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateComplaintStatus = async (complaintId, newStatus) => {
    try {
      setUpdatingStatus(complaintId);
      const token = localStorage.getItem("ccms_token");
      
      // TODO: Create update status endpoint
      // For now, just refresh the list
      await fetchAssignedComplaints();
    } catch (err) {
      console.error("Update Status Error:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(null);
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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Assigned Complaints</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading assigned complaints...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Assigned Complaints</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchAssignedComplaints}
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
          <h1 className="text-2xl font-bold text-gray-800">Assigned Complaints</h1>
          <p className="text-sm text-gray-600 mt-1">
            Complaints assigned to your committee
          </p>
        </div>
        <button
          onClick={fetchAssignedComplaints}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No complaints have been assigned to your committee yet.
          </p>
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
                  Actions
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
                  <td className="p-3">{getPriorityBadge(complaint.priority)}</td>
                  <td className="p-3">{getStatusBadge(complaint.status)}</td>
                  <td className="p-3 text-gray-600 text-sm">
                    {getUserName(complaint.userId)}
                  </td>
                  <td className="p-3 text-gray-600 text-sm">
                    {formatDate(complaint.createdAt)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/committee-dashboard/complaint/${complaint._id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        <FaEye />
                        View
                      </Link>
                      {complaint.status === 'pending' && (
                        <button
                          onClick={() => updateComplaintStatus(complaint._id, 'in-progress')}
                          disabled={updatingStatus === complaint._id}
                          className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-medium text-sm disabled:opacity-50"
                        >
                          {updatingStatus === complaint._id ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaCheckCircle />
                          )}
                          Start
                        </button>
                      )}
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
const CommitteeDashboardHome = () => {
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

      // Fetch stats and recent complaints in parallel
      const [statsResponse, complaintsResponse] = await Promise.all([
        axios.get("http://localhost:5000/api/complaints/assigned/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        axios.get("http://localhost:5000/api/complaints/assigned", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      setStats(statsResponse.data);
      // Get only the 5 most recent complaints
      setRecentComplaints(complaintsResponse.data.complaints?.slice(0, 5) || []);
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
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Committee Dashboard</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Committee Dashboard</h1>
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
        <h1 className="text-3xl font-bold text-gray-800">Committee Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome. You have {stats.pending} complaint{stats.pending !== 1 ? 's' : ''} pending review.
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
            to="/committee-dashboard/assigned-complaints"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </Link>
        </div>
        {recentComplaints.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No complaints assigned to your committee yet.
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
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Action
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
                  <td className="p-3">
                    <Link
                      to={`/committee-dashboard/complaint/${complaint._id}`}
                      className="text-blue-600 font-medium hover:underline text-sm"
                    >
                      View
                    </Link>
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

// --- 3. Main Committee Dashboard Component (Exported) ---

export default function CommitteeDashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear stored auth data like the student dashboard does
    localStorage.removeItem("ccms_token");
    localStorage.removeItem("ccms_user");
    // Use replace to prevent navigating back into a protected route
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