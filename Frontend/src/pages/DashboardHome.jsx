import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

const StatusBadge = ({ status }) => {
  const statusStyles = {
    pending: "text-red-600",
    "in-progress": "text-yellow-600",
    resolved: "text-green-600",
    rejected: "text-gray-600",
  };

  const statusLabels = {
    pending: "Pending",
    "in-progress": "In Progress",
    resolved: "Resolved",
    rejected: "Rejected",
  };

  return (
    <span className={`font-medium ${statusStyles[status] || "text-gray-600"}`}>
      {statusLabels[status] || status}
    </span>
  );
};

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

export default function DashboardHome() {
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
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Get user name from localStorage
    const userData = localStorage.getItem("ccms_user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setUserName(user.name || "User");
      } catch (e) {
        setUserName("User");
      }
    }
    
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
        axios.get(`${API_BASE_URL}/complaints/my-complaints/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        axios.get(`${API_BASE_URL}/complaints/my-complaints`, {
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

  const statsCards = [
    {
      label: "Total Complaints",
      value: stats.total,
      color: "blue",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      color: "green",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      color: "yellow",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "red",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {userName} 👋</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {userName} 👋</h1>
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {userName} 👋</h1>
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
            to="/student-dashboard/all-complaints"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All →
          </Link>
        </div>
        {recentComplaints.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            You haven't filed any complaints yet.{" "}
            <Link
              to="/student-dashboard/add-complaint"
              className="text-blue-600 hover:underline"
            >
              File your first complaint
            </Link>
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
                  Committee
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
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
                  <td className="p-3 text-gray-700">{complaint.category}</td>
                  <td className="p-3">
                    <StatusBadge status={complaint.status} />
                  </td>
                  <td className="p-3 text-gray-700 text-sm">
                    {formatDate(complaint.createdAt)}
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/student-dashboard/complaint/${complaint._id}`}
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
}