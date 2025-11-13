import React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
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
import API_BASE_URL from "../config/api.js";

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



// --- Component Start ---

const AssignedComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusDescription, setStatusDescription] = useState("");
  const [updating, setUpdating] = useState(false);

  // --- STATE FOR SEARCH, SORTING, AND FILTERING ---
  const [sortConfig, setSortConfig] = useState(null); 
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: [], 
    priority: [], 
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState(""); 
  // --- END STATE ---

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
        `${API_BASE_URL}/complaints/assigned`,
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
      await fetchAssignedComplaints();
      
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

  // --- HELPER FUNCTIONS ---
  const getComplaintId = (id) => {
    if (!id) return "N/A";
    return `CC${id.slice(-6).toUpperCase()}`;
  };

  const getUserName = (userId) => {
    if (!userId) return "Unknown";
    // CRASH FIX: Ensure userId.name is checked before access
    return userId.name || "Unknown";
  };
  
  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      "in-progress": "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    if (!status) return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800`}>N/A</span>
    );

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

    if (!priority) return (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800`}>N/A</span>
    );


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

  const getSortLabel = () => {
    if (!sortConfig) return "Sort By";
    
    if (sortConfig.key === "priority" && sortConfig.direction === "ascending") {
        return "Priority: Low ↓";
    }
    if (sortConfig.key === "priority" && sortConfig.direction === "descending") {
        return "Priority: High ↑";
    }
    if (sortConfig.key === "createdAt" && sortConfig.direction === "ascending") {
        return "Date: Oldest ↓";
    }
    if (sortConfig.key === "createdAt" && sortConfig.direction === "descending") {
        return "Date: Newest ↑";
    }

    return "Sort By";
  };
  // --- END HELPER FUNCTIONS ---

  // --- DYNAMIC SORTING, FILTERING, AND SEARCH LOGIC ---
  const sortComplaints = (key, newDirection) => {
    setSortConfig({ key, direction: newDirection });
  };

  const sortedAndFilteredComplaints = useMemo(() => {
    let processableComplaints = [...complaints];

    // 1. Search Filtering (Robust Name Matching logic retained)
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase().trim();
      const searchWords = lowerCaseSearch.split(/\s+/).filter(word => word.length > 0);

      processableComplaints = processableComplaints.filter(c => {
        if (!c) return false;
        
        // Fields for direct substring search (Safe access implemented here)
        const title = (c.title || "").toLowerCase();
        const category = (c.category || "").toLowerCase();
        const complaintId = getComplaintId(c._id).toLowerCase();
        const userName = (c.userId?.name || "").toLowerCase();
        
        // Check for direct substring match
        const directMatch = 
          title.includes(lowerCaseSearch) ||
          category.includes(lowerCaseSearch) ||
          complaintId.includes(lowerCaseSearch);

        if (directMatch) return true;
        
        // Check for flexible word match for User Name
        if (searchWords.length > 0) {
            const wordMatch = searchWords.every(word => userName.includes(word));
            if (wordMatch) return true;
        }

        return false;
      });
    }

    // 2. Filter Modal Filtering
    if (filters.status.length > 0) {
      processableComplaints = processableComplaints.filter(c => c && filters.status.includes(c.status));
    }
    if (filters.priority.length > 0) {
      processableComplaints = processableComplaints.filter(c => c && filters.priority.includes(c.priority));
    }

    // 3. Sorting (Stable sorting logic retained)
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
  // --- END DYNAMIC LOGIC ---

  // --- FILTER MODAL HANDLERS ---
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
    const defaultFilters = { status: [], priority: [] };
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
    setShowFilterModal(false);
  };
  // --- END FILTER MODAL HANDLERS ---
  

  // --- RENDERING BLOCK (Loading/Error) ---
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
  // --- END RENDERING BLOCK ---

  // --- MAIN RENDER ---
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assigned Complaints</h1>
          <p className="text-sm text-gray-600 mt-1">
            Showing: {sortedAndFilteredComplaints.length} complaints (Filtered from {complaints.length})
          </p>
        </div>
        
        {/* NEW/UPDATED CONTROLS */}
        <div className="flex gap-3 items-center">
            {/* SEARCH INPUT */}
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
            
            {/* DYNAMIC SORT DROPDOWN */}
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
                    className="px-6 py-1.5 border border-gray-300 rounded-lg text-sm bg-white shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
                >
                    <option value="" className="text-gray-500">{getSortLabel()}</option>
                    <option value="priority-descending">Priority: High to Low</option>
                    <option value="priority-ascending">Priority: Low to High</option>
                    <option value="createdAt-descending">Date: New to Old</option>
                    <option value="createdAt-ascending">Date: Old to New</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>

            {/* FILTER BUTTON (Amazon-style icon) */}
            <button
                onClick={() => {
                    setTempFilters(filters);
                    setShowFilterModal(true);
                }}
                className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg shadow-sm font-medium transition-colors border ${
                    (filters.status.length > 0 || filters.priority.length > 0)
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"></path>
                </svg>
                { (filters.status.length > 0 || filters.priority.length > 0) && (
                    <span className={`text-xs font-bold ${ (filters.status.length > 0 || filters.priority.length > 0) ? 'text-white' : 'text-blue-600'}`}>
                        ({filters.status.length + filters.priority.length})
                    </span>
                )}
            </button>

            {/* REFRESH BUTTON (Original structure retained) */}
            <button
              onClick={fetchAssignedComplaints}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Refresh
            </button>
        </div>
      </div>

      {sortedAndFilteredComplaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No complaints found matching current criteria.
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
                  Upvotes
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
              {sortedAndFilteredComplaints.map((complaint) => (
                <tr
                  key={complaint?._id || Math.random()}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-gray-700 font-mono text-sm">
                    {getComplaintId(complaint?._id)}
                  </td>
                  <td className="p-3 text-gray-700 max-w-xs truncate">
                    {/* CRASH FIX: Optional chaining used here */}
                    {complaint?.title}
                  </td>
                  <td className="p-3 text-gray-700 text-sm text-center">
                    {/* CRASH FIX: Optional chaining used here */}
                    {complaint?.upvoteCount || complaint?.upvotes?.length || 0}
                  </td>
                  <td className="p-3">{getPriorityBadge(complaint?.priority)}</td>
                  <td className="p-3">{getStatusBadge(complaint?.status)}</td>
                  <td className="p-3 text-gray-600 text-sm">
                    {/* CRASH FIX: Optional chaining used here */}
                    {getUserName(complaint?.userId)}
                  </td>
                  <td className="p-3 text-gray-600 text-sm">
                    {/* CRASH FIX: Optional chaining used here */}
                    {formatDate(complaint?.createdAt)}
                  </td>
                  <td className="p-3">
                    <button
                      // CRASH FIX: Ensure complaint object is safe before passing to modal
                      onClick={() => complaint && openStatusModal(complaint)}
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

      {/* Status Update Modal (Original structure retained) */}
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

      {/* FILTER MODAL (Includes Status and Priority filters) */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
              Filter Complaints
            </h2>

            <div className="space-y-6">
              {/* Filter by Status */}
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

              {/* Filter by Priority */}
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

// C4: Department/committee analytics dashboard (committee-scoped, cached, refreshable)
const AnalyticsDashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // read committeeType from stored user
  let committeeType = null;
  try {
    const u = typeof window !== 'undefined' ? localStorage.getItem('ccms_user') : null;
    const parsed = u ? JSON.parse(u) : null;
    committeeType = parsed?.committeeType || parsed?.committee || null;
  } catch (e) {
    committeeType = null;
  }

  const CACHE_KEY = "committee_analytics";
  const [complaintsList, setComplaintsList] = useState([]);

  const readCache = (ct) => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const obj = JSON.parse(raw);
      return obj?.[ct] || null;
    } catch (e) {
      return null;
    }
  };

  const writeCache = (ct, data) => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      obj[ct] = { ...data, fetchedAt: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(obj));
    } catch (e) {
      // ignore cache write errors
      console.warn("Failed to write analytics cache", e);
    }
  };

  const fetchMetrics = async (opts = { showLoading: true }) => {
    if (!committeeType) {
      setError("Committee type not found in profile. Please re-login or contact admin.");
      setMetrics(null);
      return;
    }

    const token = localStorage.getItem("ccms_token");
    if (!token) {
      setError("Missing auth token. Please login again.");
      setMetrics(null);
      return;
    }

    try {
      if (opts.showLoading) setLoading(true);
      setError("");

      const url = `${API_BASE_URL}/committee-analytics/${encodeURIComponent(
        committeeType
      )}`;

      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // normalize shape defensively
      const normalized = {
        total: Number(data.total) || 0,
        resolved: Number(data.resolved) || 0,
        avgResolutionTimeDays:
          data.avgResolutionTimeDays == null ? 0 : Number(data.avgResolutionTimeDays),
        resolutionRate: data.resolutionRate == null ? 0 : Number(data.resolutionRate),
      };

      setMetrics(normalized);
      writeCache(committeeType, normalized);
    } catch (err) {
      console.error("Fetch committee analytics error:", err);
      setError(
        err?.response?.data?.message || "Failed to load analytics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchComplaintsList = async () => {
    try {
      const token = localStorage.getItem('ccms_token');
      if (!token) return;
      const { data } = await axios.get(`${API_BASE_URL}/complaints/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaintsList(data.complaints || []);
    } catch (e) {
      console.warn('Failed to fetch complaints list for analytics:', e?.response?.data || e.message || e);
      setComplaintsList([]);
    }
  };

  // On mount: load cache immediately, then fetch fresh in background
  useEffect(() => {
    if (!committeeType) {
      setError("Committee type not found in profile.");
      return;
    }

    const cached = readCache(committeeType);
    if (cached) {
      setMetrics({
        total: cached.total || 0,
        resolved: cached.resolved || 0,
        avgResolutionTimeDays: cached.avgResolutionTimeDays || 0,
        resolutionRate: cached.resolutionRate || 0,
      });
    }

    // fetch fresh but don't block UI if we showed cache
    fetchMetrics({ showLoading: !cached });
    // also fetch the complaints list so we can compute month-to-date counts client-side
    fetchComplaintsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = () => fetchMetrics({ showLoading: true });

  // small helpers for display
  const formatDays = (d) => (d == null ? "—" : `${Number(d).toFixed(1)} days`);
  const formatPct = (p) => (p == null ? "—" : `${Number(p).toFixed(0)}%`);

  // compute month-to-date counts from complaint details (client-side)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyTotalLocal = complaintsList.filter((c) => {
    try {
      const created = new Date(c.createdAt);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    } catch (e) {
      return false;
    }
  }).length;

  const monthlyResolvedLocal = complaintsList.filter((c) => {
    try {
      // check statusHistory for a resolved entry in this month
      if (c.statusHistory && Array.isArray(c.statusHistory)) {
        const found = c.statusHistory.find((s) => {
          if (!s || !s.status) return false;
          if (s.status !== 'resolved') return false;
          const dt = s.updatedAt ? new Date(s.updatedAt) : null;
          return dt && dt.getMonth() === currentMonth && dt.getFullYear() === currentYear;
        });
        if (found) return true;
      }

      // fallback: if complaint.status === 'resolved' and updatedAt is in this month
      if (c.status === 'resolved') {
        const ua = c.updatedAt ? new Date(c.updatedAt) : null;
        if (ua && ua.getMonth() === currentMonth && ua.getFullYear() === currentYear) return true;
      }

      return false;
    } catch (e) {
      return false;
    }
  }).length;

  // Prefer client-side computed month-to-date counts when available,
  // otherwise fall back to backend-provided metrics if present.
  const displayMonthlyTotal = (typeof monthlyTotalLocal === 'number' && !isNaN(monthlyTotalLocal))
    ? monthlyTotalLocal
    : (metrics?.monthlyTotal != null ? metrics.monthlyTotal : null);

  const displayMonthlyResolved = (typeof monthlyResolvedLocal === 'number' && !isNaN(monthlyResolvedLocal))
    ? monthlyResolvedLocal
    : (metrics?.monthlyResolved != null ? metrics.monthlyResolved : null);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{committeeType || 'Committee'} Analytics</h1>
          <p className="mt-2 text-gray-600">Overview of complaints handled by your committee.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2 text-gray-600">
                <FaSpinner className="animate-spin" /> Refreshing...
              </span>
            ) : (
              "Refresh"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        <div className="p-6 rounded-lg shadow-lg border-l-8 bg-blue-50 border-blue-500">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-700">Total Complaints</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics ? metrics.total : '—'}</p>
          {displayMonthlyTotal != null && (
            <p className="text-sm text-gray-600 mt-1">{displayMonthlyTotal} in current month</p>
          )}
        </div>

        <div className="p-6 rounded-lg shadow-lg border-l-8 bg-green-50 border-green-500">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-700">Resolved</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics ? metrics.resolved : '—'}</p>
          {displayMonthlyResolved != null && (
            <p className="text-sm text-gray-600 mt-1">{displayMonthlyResolved} in current month</p>
          )}
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

      <div className="mt-6 text-sm text-gray-500">
        {metrics && (
          <span>
            Last fetched: {
              (() => {
                try {
                  const raw = localStorage.getItem(CACHE_KEY);
                  const obj = raw ? JSON.parse(raw) : {};
                  const entry = obj?.[committeeType];
                  if (entry?.fetchedAt) return new Date(entry.fetchedAt).toLocaleString();
                } catch (e) {}
                return 'Now';
              })()
            }
          </span>
        )}
      </div>
    </div>
  );
};

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
        axios.get(`${API_BASE_URL}/complaints/assigned/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        axios.get(`${API_BASE_URL}/complaints/assigned`, {
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

  // Read profile from localStorage and derive display values
  const userStr = typeof window !== 'undefined' ? localStorage.getItem('ccms_user') : null;
  let currentUser = null;
  try {
    currentUser = userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    currentUser = null;
  }
  const profileInitial = currentUser?.committeeType
    ? currentUser.committeeType.charAt(0).toUpperCase()
    : currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : 'C';
  const profileName = currentUser?.committeeType ?? currentUser?.name ?? 'Committee Name';

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
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
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