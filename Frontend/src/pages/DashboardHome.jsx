import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const stats = [
  {
    label: "Total Complaints",
    value: "6", // (3+2+1)
    color: "blue",
  },
  {
    label: "Resolved",
    value: "3",
    color: "green",
  },
  {
    label: "In Progress",
    value: "2",
    color: "yellow",
  },
  {
    label: "Pending",
    value: "1",
    color: "red",
  },
];

const recentComplaints = [
  {
    id: "#124",
    department: "Maintenance",
    status: "Resolved",
    date: "29 Oct 2025",
  },
  {
    id: "#125",
    department: "IT Department",
    status: "In Progress",
    date: "30 Oct 2025",
  },
];

const announcements = [
  "The maintenance department will be closed on Sunday (Nov 3).",
  "Your complaint #124 has been marked as resolved.",
  "New system update coming next week with improved tracking.",
];

const StatusBadge = ({ status }) => {
  let colorClass = "";
  if (status === "Resolved") colorClass = "text-green-600";
  if (status === "In Progress") colorClass = "text-yellow-600";
  if (status === "Pending") colorClass = "text-red-600";
  return <span className={`font-medium ${colorClass}`}>{status}</span>;
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

    const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();

        if (res.ok) {
          setUserName(data.name);
        } else {
          console.error("Error fetching profile:", data.message);
        }
      } catch (err) {
        console.error("Network error:", err);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="flex flex-col gap-8">
    
      <h1 className="text-3xl font-bold text-gray-800"> Hii, {userName}!! </h1>
      <p className="text-gray-600 -mt-6">
        Here's an overview of your recent complaint activity.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Complaints
        </h2>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-sm font-semibold text-gray-600">
                Complaint ID
              </th>
              <th className="p-3 text-sm font-semibold text-gray-600">
                Department
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
              <tr key={complaint.id} className="border-b">
                <td className="p-3 text-gray-700">{complaint.id}</td>
                <td className="p-3 text-gray-700">{complaint.department}</td>
                <td className="p-3">
                  <StatusBadge status={complaint.status} />
                </td>
                <td className="p-3 text-gray-700">{complaint.date}</td>
                <td className="p-3">
                  <Link
                    to={`/complaint/${complaint.id}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    
  );
}