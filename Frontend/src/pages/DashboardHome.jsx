import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import ComplaintsTable from "../components/ComplaintsTable";

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
  const [upvoting, setUpvoting] = useState({});
  const overviewTitle = "Complaint Overview";
  const overviewSubtitle = "Here's an overview of your recent complaint activity.";

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
        axios.get(`${API_BASE_URL}/complaints/my-complaints/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        axios.get(`${API_BASE_URL}/complaints/public`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      setStats(statsResponse.data);
      // Get only the 10 most recent complaints, sorted by date (newest first)
      const allComplaints = complaintsResponse.data.complaints || [];
      const sortedComplaints = [...allComplaints].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA; // Newest first
      });
      const normalizedRecent = sortedComplaints
        .slice(0, 10)
        .map((complaint) => ({
          ...complaint,
          upvoteCount:
            complaint?.upvoteCount ?? complaint?.upvotes?.length ?? 0,
          hasUpvoted: complaint?.hasUpvoted ?? false,
        }));
      setRecentComplaints(normalizedRecent);
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

  const handleUpvote = async (complaintId) => {
    if (!complaintId) return;

    try {
      setUpvoting((prev) => ({ ...prev, [complaintId]: true }));

      const token = localStorage.getItem("ccms_token");
      if (!token) {
        alert("You are not logged in. Please login again.");
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

      setRecentComplaints((prev) =>
        prev.map((complaint) =>
          complaint._id === complaintId
            ? {
                ...complaint,
                upvoteCount: data.upvoteCount,
                hasUpvoted: data.hasUpvoted,
              }
            : complaint
        )
      );
    } catch (err) {
      console.error("Dashboard Upvote Error:", err);
      const message =
        err?.response?.data?.message ||
        "Failed to upvote complaint. Please try again.";
      alert(message);
    } finally {
      setUpvoting((prev) => ({ ...prev, [complaintId]: false }));
    }
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
      testId: "dashboard-card-total",
    },
    {
      label: "Resolved",
      value: stats.resolved,
      color: "green",
      testId: "dashboard-card-resolved",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      color: "yellow",
      testId: "dashboard-card-inprogress",
    },
    {
      label: "Pending",
      value: stats.pending,
      color: "red",
      testId: "dashboard-card-pending",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-gray-800">{overviewTitle}</h1>
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-gray-800">{overviewTitle}</h1>
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
        <h1 className="text-3xl font-bold text-gray-800">{overviewTitle}</h1>
        <p className="text-gray-600 mt-2">{overviewSubtitle}</p>
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
            <p
              className="text-3xl font-bold text-gray-800 mt-2"
              data-testid={stat.testId}
            >
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
        <ComplaintsTable
          complaints={recentComplaints}
          config={{
            showId: true,
            showTitle: true,
            showCommittee: true,
            showStatus: true,
            showUpvotes: true,
            showDate: true,
            showActions: true,
            actionType: "view-only",
            viewLinkBase: "/student-dashboard/complaint",
            onUpvote: handleUpvote,
            upvoting: upvoting,
            emptyMessage: (
              <>
                You haven't filed any complaints yet.{" "}
                <Link
                  to="/student-dashboard/add-complaint"
                  className="text-blue-600 hover:underline"
                >
                  File your first complaint
                </Link>
              </>
            ),
          }}
        />
      </div>
    </div>
  );
}