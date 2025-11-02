import React from "react";
import Sidebar from "../components/Sidebar";

export default function StudentDashboard() {
  return (
    <div className="flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar role="student" />

      {/* Main content */}
      <div className="flex-1 ml-32 mt-16 h-[calc(100vh-4rem)] overflow-y-auto px-6 py-6">
        {/* Welcome Section */}
        <section className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome, Krutant 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Here’s an overview of your recent complaint activity.
          </p>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-lg shadow-sm">
            <h2 className="text-gray-700 text-sm font-medium">Resolved</h2>
            <p className="text-xl font-bold text-green-700 mt-1">3</p>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-lg shadow-sm">
            <h2 className="text-gray-700 text-sm font-medium">In Progress</h2>
            <p className="text-xl font-bold text-yellow-700 mt-1">2</p>
          </div>
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg shadow-sm">
            <h2 className="text-gray-700 text-sm font-medium">Pending</h2>
            <p className="text-xl font-bold text-red-700 mt-1">1</p>
          </div>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg shadow-sm">
            <h2 className="text-gray-700 text-sm font-medium">
              Avg. Resolution Time
            </h2>
            <p className="text-xl font-bold text-blue-700 mt-1">4 Days</p>
          </div>
        </section>

        {/* Recent Complaints */}
        <section className="bg-white rounded-lg shadow-sm p-5 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Recent Complaints
          </h3>
          <table className="min-w-full text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-3 text-left">Complaint ID</th>
                <th className="py-2 px-3 text-left">Department</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Date</th>
                <th className="py-2 px-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">#124</td>
                <td className="py-2 px-3">Maintenance</td>
                <td className="py-2 px-3 text-green-700 font-medium">Resolved</td>
                <td className="py-2 px-3">29 Oct 2025</td>
                <td className="py-2 px-3">
                  <button className="text-blue-600 hover:underline">View</button>
                </td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">#125</td>
                <td className="py-2 px-3">IT Department</td>
                <td className="py-2 px-3 text-yellow-700 font-medium">
                  In Progress
                </td>
                <td className="py-2 px-3">30 Oct 2025</td>
                <td className="py-2 px-3">
                  <button className="text-blue-600 hover:underline">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Quick Actions + Announcements */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Quick Actions */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
                ➕ Add New Complaint
              </button>
              <button className="w-full bg-gray-100 text-gray-800 py-2 rounded-md hover:bg-gray-200 transition">
                🔍 Track Complaint Status
              </button>
              <button className="w-full bg-gray-100 text-gray-800 py-2 rounded-md hover:bg-gray-200 transition">
                📄 View All Complaints
              </button>
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Announcements
            </h3>
            <ul className="list-disc pl-5 text-gray-700 space-y-1">
              <li>The maintenance department will be closed on Sunday (Nov 3).</li>
              <li>Your complaint #124 has been marked as resolved.</li>
              <li>New system update coming next week with improved tracking.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
