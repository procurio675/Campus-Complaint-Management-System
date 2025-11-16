import React from "react";
import { useState, useRef, useEffect, useMemo  } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { FaBell, FaUserCircle, FaChevronDown, FaPlus, FaEye, FaThumbsUp, FaTrash, FaTimes } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

import Sidebar from "../components/Sidebar";
import DashboardHome from "./DashboardHome";
import ProfilePage from "./ProfilePage";
import ComplaintsTable from "../components/ComplaintsTable";

import AddComplaintPage from "./AddComplaintPage"; 

const DeleteConfirmationModal = ({
  isOpen,
  title = "Delete Complaint",
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 transition hover:text-gray-600"
            aria-label="Close delete confirmation"
          >
            <FaTimes />
          </button>
        </div>
        <p className="mb-6 text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
              loading ? "bg-red-300" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Deleting..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const MyComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [upvoting, setUpvoting] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "descending" }); 
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: [], 
    committee: [], 
    priority: [], // ADDED PRIORITY TO FILTERS
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState(""); 
  // --- END UPDATED STATE ---

  const currentUserId = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ccms_user"));
      return stored?._id || null;
    } catch (err) {
      return null;
    }
  }, []);

  const resolveIdString = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id) return value._id.toString();
      if (value.id) return value.id.toString();
    }
    return value.toString ? value.toString() : null;
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (!actionMessage) {
      return;
    }

    const timeout = setTimeout(() => setActionMessage(""), 4000);
    return () => clearTimeout(timeout);
  }, [actionMessage]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");
      setActionError("");
      
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

      const normalizedComplaints = (data.complaints || []).map((complaint) => {
        const upvotesArray = Array.isArray(complaint?.upvotes)
          ? complaint.upvotes
          : [];
        const upvoteCount = complaint?.upvoteCount ?? upvotesArray.length;
        const hasUpvoted = currentUserId
          ? upvotesArray.some(
              (upvoteId) => resolveIdString(upvoteId) === currentUserId
            )
          : false;

        return {
          ...complaint,
          upvoteCount,
          hasUpvoted,
        };
      });

      setComplaints(normalizedComplaints);
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

  const openDeleteModal = (complaintId) => {
    const target = complaints.find((complaint) => complaint?._id === complaintId) || null;
    setDeleteTarget(target);
    setActionError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleUpvote = async (complaintId) => {
    if (!complaintId) return;

    try {
      setUpvoting((prev) => ({ ...prev, [complaintId]: true }));

      const token = localStorage.getItem("ccms_token");
      if (!token) {
        setActionError("You are not logged in. Please login again.");
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

      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
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
      console.error("Upvote Complaint Error:", err);
      const message =
        err?.response?.data?.message ||
        "Failed to upvote the complaint. Please try again.";
      setActionError(message);
    } finally {
      setUpvoting((prev) => ({ ...prev, [complaintId]: false }));
    }
  };

  const handleDelete = async () => {
    const complaintId = deleteTarget?._id;
    if (!complaintId) {
      closeDeleteModal();
      return;
    }

    const token = localStorage.getItem("ccms_token");
    if (!token) {
      setActionError("You are not logged in. Please login again.");
      return;
    }

    try {
      setDeletingId(complaintId);
      setActionError("");
      await axios.delete(`${API_BASE_URL}/complaints/${complaintId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setComplaints((prevComplaints) =>
        prevComplaints.filter((complaint) => complaint._id !== complaintId)
      );
      setActionMessage("Complaint deleted successfully.");
      closeDeleteModal();
    } catch (err) {
      console.error("Delete Complaint Error:", err);
      setActionMessage("");
      setActionError(
        err?.response?.data?.message ||
          "Failed to delete the complaint. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };
  
  // --- DYNAMIC SORTING, FILTERING, AND SEARCH LOGIC ---
  const sortComplaints = (key, newDirection) => {
    setSortConfig({ key, direction: newDirection });
  };

  const getComplaintId = (id) => {
    if (!id) return "N/A";
    return `CC${id.slice(-6).toUpperCase()}`;
  };

  const sortedAndFilteredComplaints = useMemo(() => {
    let processableComplaints = [...complaints];

    // 1. Search Filtering
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase().trim();
      
      processableComplaints = processableComplaints.filter(c => {
        if (!c) return false;
        
        const title = (c.title || "").toLowerCase();
        const category = (c.category || "").toLowerCase();
        const complaintId = getComplaintId(c._id).toLowerCase();
        
        return (
          title.includes(lowerCaseSearch) ||
          category.includes(lowerCaseSearch) ||
          complaintId.includes(lowerCaseSearch)
        );
      });
    }

    // 2. Filter Modal Filtering
    if (filters.status.length > 0) {
      processableComplaints = processableComplaints.filter(c => c && filters.status.includes(c.status));
    }
    if (filters.committee.length > 0) {
      processableComplaints = processableComplaints.filter(c => c && filters.committee.includes(c.category));
    }
    // APPLY PRIORITY FILTER HERE
    if (filters.priority.length > 0) {
      processableComplaints = processableComplaints.filter(c => c && filters.priority.includes(c.priority));
    }


    // 3. Sorting
    if (sortConfig && sortConfig.key) {
      processableComplaints.sort((a, b) => {
        if (!a) return sortConfig.direction === "ascending" ? 1 : -1;
        if (!b) return sortConfig.direction === "ascending" ? -1 : 1;
        
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Custom logic for Priority
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
    // Resetting state to include priority filter
    const defaultFilters = { status: [], committee: [], priority: [] }; 
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
    setShowFilterModal(false);
  };
  // --- END FILTER MODAL HANDLERS ---
  
  // --- HELPER FUNCTIONS (Secured with optional chaining) ---
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
        <div>
            <h1 className="text-2xl font-bold text-gray-800">My Complaints</h1>
             <p className="text-sm text-gray-600 mt-1">
                Showing: {sortedAndFilteredComplaints.length} complaints (Filtered from {complaints.length})
            </p>
        </div>
        
        {/* CONTROLS (Search, Sort, Filter, Refresh) */}
        <div className="flex gap-3 items-center">
            {/* SEARCH INPUT */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by ID, Title, Committee..."
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

            {/* FILTER BUTTON (Updated to count priority filter) */}
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
                { (filters.status.length > 0 || filters.committee.length > 0 || filters.priority.length > 0) && (
                    <span className={`text-xs font-bold ${ (filters.status.length > 0 || filters.committee.length > 0 || filters.priority.length > 0) ? 'text-white' : 'text-blue-600'}`}>
                        ({filters.status.length + filters.committee.length + filters.priority.length})
                    </span>
                )}
            </button>
            
            {/* REFRESH BUTTON (Original structure retained) */}
            <button
                onClick={fetchComplaints}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                Refresh
            </button>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionError}
        </div>
      )}

      {sortedAndFilteredComplaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            You haven't filed any complaints yet, or none match your filters.
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
        <ComplaintsTable
          complaints={sortedAndFilteredComplaints}
          config={{
            showId: true,
            showTitle: true,
            showCommittee: true,
            showStatus: true,
            showDate: true,
            showUpvotes: true,
            showActions: true,
            actionType: "view-delete",
            onDelete: openDeleteModal,
            onUpvote: handleUpvote,
            upvoting: upvoting,
            deletingId: deletingId,
            viewLinkBase: "/student-dashboard/complaint",
            emptyMessage: "You haven't filed any complaints yet, or none match your filters.",
            canDeleteComplaint: (complaint) => complaint?.status === "pending",
          }}
        />
      )}
      
      {/* FILTER MODAL (PRIORITY ADDED) */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
              Filter My Complaints
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
              
              {/* FILTER BY PRIORITY (NEW BLOCK) */}
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


              {/* Filter by Committee/Category */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Committee
                </h3>
                <div className="flex flex-wrap gap-4">
                  {[...new Set(complaints.map(c => c.category).filter(c => c))]
                    .filter(category => category !== "Canteen") // Exclude Canteen
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

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Complaint"
        message={`Are you sure you want to delete "${deleteTarget?.title || "this complaint"}"? This action cannot be undone.`}
        onCancel={closeDeleteModal}
        onConfirm={handleDelete}
        loading={Boolean(deletingId && deleteTarget && deletingId === deleteTarget._id)}
      />
    </div>
  );
};
// Complaint Detail Page with Status History
const ComplaintDetailPage = () => {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();

  // Get complaint ID from URL
  const complaintId = window.location.pathname.split('/').pop();

  const currentUserId = useMemo(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("ccms_user"));
      return stored?._id || null;
    } catch (err) {
      return null;
    }
  }, []);

  const isOwner = useMemo(() => {
    if (!complaint || !currentUserId) return false;
    const complaintUserId = typeof complaint.userId === "string"
      ? complaint.userId
      : complaint.userId?._id || complaint.userId?.id || "";
    return complaintUserId && complaintUserId.toString() === currentUserId;
  }, [complaint, currentUserId]);

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
      if (err?.response?.status === 404) {
        setError(
          err?.response?.data?.message ||
            "This complaint either does not exist or you do not have access to view it."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Failed to fetch complaint details. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!complaint?._id) {
      setShowDeleteModal(false);
      return;
    }

    if (complaint?.status !== "pending") {
      setError("Only pending complaints can be deleted.");
      setShowDeleteModal(false);
      return;
    }

    if (!isOwner) {
      setError("You can only delete complaints that you created.");
      setShowDeleteModal(false);
      return;
    }

    const token = localStorage.getItem("ccms_token");
    if (!token) {
      setError("You are not logged in. Please login again.");
      return;
    }

    try {
      setDeleting(true);
      await axios.delete(`${API_BASE_URL}/complaints/${complaintId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setShowDeleteModal(false);
      navigate("/student-dashboard/my-complaints", { replace: true });
    } catch (err) {
      console.error("Delete Complaint Error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to delete the complaint. Please try again."
      );
    } finally {
      setDeleting(false);
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
            onClick={() => navigate("/student-dashboard/all-complaints")}
            className="mt-2 text-sm text-red-600 hover:underline"
          >
            Back to All Complaints
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/student-dashboard/all-complaints")}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to All Complaints
            </button>
            {complaint.status === "pending" && isOwner && (
              <button
                onClick={() => {
                  setError("");
                  setShowDeleteModal(true);
                }}
                disabled={deleting}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  deleting
                    ? "bg-red-300 text-white cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                <FaTrash size={14} />
                {deleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
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

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Complaint"
        message={`Are you sure you want to delete "${complaint?.title || "this complaint"}"? This action cannot be undone.`}
        onCancel={() => {
          if (!deleting) {
            setShowDeleteModal(false);
          }
        }}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
};

const AllComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [upvoting, setUpvoting] = useState({}); 
  const [sortConfig, setSortConfig] = useState({ key: "upvoteCount", direction: "descending" }); 
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: [], 
    committee: [], 
    priority: [],
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [searchTerm, setSearchTerm] = useState(""); 
  // --- END NEW STATE ---

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

      // Initial sort by upvote count after fetch
      const sortedData = (data.complaints || []).sort((a, b) => {
        const aUpvotes = a.upvoteCount || a.upvotes?.length || 0;
        const bUpvotes = b.upvoteCount || b.upvotes?.length || 0;
        return bUpvotes - aUpvotes; 
      });

      setComplaints(sortedData);
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
      setComplaints((prevComplaints) => {
        const updatedComplaints = prevComplaints.map((complaint) => {
          if (complaint._id === complaintId) {
            return {
              ...complaint,
              upvoteCount: data.upvoteCount,
              hasUpvoted: data.hasUpvoted,
              
            };
          }
          return complaint;
        });

        // Re-sort complaints by upvote count (maintaining sorting preference)
        const sorted = [...updatedComplaints]
          .sort((a, b) => {
          const aUpvotes = a.upvoteCount || a.upvotes?.length || 0;
          const bUpvotes = b.upvoteCount || b.upvotes?.length || 0;
          
          // Use default sorting (UpvoteCount > Date) when upvoting/unupvoting
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

  // --- DYNAMIC SORTING, FILTERING, AND SEARCH LOGIC ---
  const sortComplaints = (key, newDirection) => {
    setSortConfig({ key, direction: newDirection });
  };

  const getComplaintId = (id) => {
    if (!id) return "";
    return `CC${id.slice(-6).toUpperCase()}`;
  };

  const sortedAndFilteredComplaints = useMemo(() => {
    let processableComplaints = [...complaints];

    // 1. Search Filtering (Robust Name Matching)
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase().trim();
      const searchWords = lowerCaseSearch.split(/\s+/).filter(word => word.length > 0);

      processableComplaints = processableComplaints.filter(c => {
        if (!c) return false;
        
        // Fields for direct substring search
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
    if (filters.committee.length > 0) {
      processableComplaints = processableComplaints.filter(c => c && filters.committee.includes(c.category));
    }
    if (filters.priority.length > 0) {
      processableComplaints = processableComplaints.filter(c => c && filters.priority.includes(c.priority));
    }

    // 3. Sorting
    if (sortConfig && sortConfig.key) {
      processableComplaints.sort((a, b) => {
        if (!a) return sortConfig.direction === "ascending" ? 1 : -1;
        if (!b) return sortConfig.direction === "ascending" ? -1 : 1;
        
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (sortConfig.key === "upvoteCount") {
            aVal = a.upvoteCount || a.upvotes?.length || 0;
            bVal = b.upvoteCount || b.upvotes?.length || 0;
        }

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
        
       
        return new Date(b.createdAt) - new Date(a.createdAt);
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
    const defaultFilters = { status: [], committee: [],priority: [] };
    setFilters(defaultFilters);
    setTempFilters(defaultFilters);
    setShowFilterModal(false);
  };
  // --- END FILTER MODAL HANDLERS ---
  
  // --- HELPER FUNCTIONS ---
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

  const getUserName = (userId) => {
    if (!userId) return "Unknown";
    return userId.name || "Unknown";
  };
  
  const getSortLabel = () => {
    if (!sortConfig) return "Sort By";
    
    if (sortConfig.key === "upvoteCount" && sortConfig.direction === "descending") {
        return "Popularity: High ↓";
    }
    if (sortConfig.key === "upvoteCount" && sortConfig.direction === "ascending") {
        return "Popularity: Low ↑";
    }
    if (sortConfig.key === "priority" && sortConfig.direction === "descending") {
        return "Priority: High ↓";
    }
    if (sortConfig.key === "priority" && sortConfig.direction === "ascending") {
        return "Priority: Low ↑";
    }
    if (sortConfig.key === "createdAt" && sortConfig.direction === "descending") {
        return "Date: Newest ↓";
    }
    if (sortConfig.key === "createdAt" && sortConfig.direction === "ascending") {
        return "Date: Oldest ↑";
    }

    return "Sort By";
  };
  // --- END HELPER FUNCTIONS ---


  // --- RENDERING BLOCK (Loading/Error) ---
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
  // --- END RENDERING BLOCK ---

  // --- MAIN RENDER ---
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Complaints</h1>
          <p className="text-sm text-gray-600 mt-1">
            Showing: {sortedAndFilteredComplaints.length} complaints (Filtered from {complaints.length})
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
                    className="px-6 py-1.5 border border-gray-300 rounded-lg text-sm bg-white shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
                >
                    <option value="" className="text-gray-500">{getSortLabel()}</option>
                    <option value="upvoteCount-descending">Popularity: High to Low</option>
                    <option value="upvoteCount-ascending">Popularity: Low to High</option>
                    <option value="priority-descending">Priority: High to Low</option>
                    <option value="priority-ascending">Priority: Low to High</option>
                    <option value="createdAt-descending">Date: New to Old</option>
                    <option value="createdAt-ascending">Date: Old to New</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>

            <button
                onClick={() => {
                    setTempFilters(filters);
                    setShowFilterModal(true);
                }}
                className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg shadow-sm font-medium transition-colors border ${
                    (filters.status.length > 0 || filters.committee.length > 0)
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"></path>
                </svg>
                { (filters.status.length > 0 || filters.committee.length > 0) && (
                    <span className={`text-xs font-bold ${ (filters.status.length > 0 || filters.committee.length > 0) ? 'text-white' : 'text-blue-600'}`}>
                        ({filters.status.length + filters.committee.length})
                    </span>
                )}
            </button>

            <button
              onClick={fetchPublicComplaints}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Refresh
            </button>
        </div>
      </div>

      {sortedAndFilteredComplaints.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No public complaints found matching current criteria.
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
        <ComplaintsTable
          complaints={sortedAndFilteredComplaints}
          config={{
            showId: true,
            showTitle: true,
            showCommittee: true,
            showStatus: true,
            showDate: true,
            showUpvotes: true,
            showActions: true,
            actionType: "view-only",
            viewLinkBase: "/student-dashboard/complaint",
            onUpvote: handleUpvote,
            upvoting: upvoting,
            emptyMessage: "No public complaints found matching current criteria.",
          }}
        />
      )}

      {/* FILTER MODAL */}
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

              {/* Filter by Committee/Category */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3">
                  Committee
                </h3>
                <div className="flex flex-wrap gap-4">
                  {[...new Set(complaints.map(c => c.category).filter(c => c))]
                    .filter(category => category !== "Canteen") 
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

export default function StudentDashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

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

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem("ccms_token");
      if (!token) return;

      const { data } = await axios.get(
        `${API_BASE_URL}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Fetch Notifications Error:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("ccms_token");
      if (!token) return;

      await axios.patch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark Notification Read Error:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("ccms_token");
      if (!token) return;

      await axios.patch(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark All Notifications Read Error:", err);
    }
  };

  // Dismiss notification
  const dismissNotification = async (notificationId, isRead) => {
    try {
      const token = localStorage.getItem("ccms_token");
      if (!token) return;

      const { data } = await axios.delete(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setNotifications((prev) => prev.filter((notif) => notif._id !== notificationId));

      if (!isRead) {
        if (typeof data?.unreadCount === "number") {
          setUnreadCount(data.unreadCount);
        } else {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error("Delete Notification Error:", err);
    }
  };

  // Format notification date
  const formatNotificationDate = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Fetch notifications on mount and set up polling
  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Handle click outside for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, notificationRef]);


  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64">
       
        <header className="bg-white shadow-sm h-20 flex items-center justify-between px-8 border-b" data-testid="dashboard-header">
         
          <h1 className="text-xl font-semibold text-gray-800" data-testid="dashboard-title">
            Campus Complaint Resolve
          </h1>
          <div className="flex items-center gap-6" data-testid="header-controls-container">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => {
                  setNotificationDropdownOpen(!notificationDropdownOpen);
                  if (!notificationDropdownOpen) {
                    fetchNotifications();
                  }
                }}
                className="relative text-gray-500 hover:text-gray-800 transition-colors"
                data-testid="notification-bell-button"
              >
                <FaBell size={22} data-testid="notification-bell-icon" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" data-testid="notification-badge">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notificationDropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-96 bg-white rounded-lg shadow-xl z-20 overflow-hidden border max-h-96 flex flex-col" data-testid="notification-dropdown">
                  <div className="p-4 border-b flex items-center justify-between bg-gray-50">
                    <h3 className="font-semibold text-gray-800" data-testid="notification-dropdown-title">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        data-testid="mark-all-read-button"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {loadingNotifications ? (
                      <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <FaBell size={32} className="mx-auto mb-2 text-gray-300" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => {
                            if (!notification.isRead) {
                              markAsRead(notification._id);
                            }
                            if (notification.complaint) {
                              navigate(`/student-dashboard/complaint/${notification.complaint._id}`);
                              setNotificationDropdownOpen(false);
                            }
                          }}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                            !notification.isRead ? "bg-blue-50" : ""
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                !notification.isRead ? "bg-blue-600" : "bg-transparent"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm ${
                                  !notification.isRead
                                    ? "font-semibold text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.message}
                              </p>
                              {notification.data?.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                  {notification.data.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 mt-1">
                                {formatNotificationDate(notification.createdAt)}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                dismissNotification(notification._id, notification.isRead);
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                              title="Dismiss notification"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                data-testid="user-profile-dropdown-button"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg" data-testid="user-avatar">
                  {profileInitial}
                </div>
                <span className="font-semibold text-gray-700 hidden md:block" data-testid="user-name-display">
                  {profileName}
                </span>
                <FaChevronDown
                  size={12}
                  className={`text-gray-500 transition-transform ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                  data-testid="dropdown-chevron-icon"
                />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-3 w-48 bg-white rounded-lg shadow-xl z-10 overflow-hidden border" data-testid="user-dropdown-menu">
                  <Link
                    to="/student-dashboard/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    data-testid="dropdown-profile-link"
                  >
                    <FaUserCircle />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    data-testid="dropdown-logout-button"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8" data-testid="dashboard-main-content">
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