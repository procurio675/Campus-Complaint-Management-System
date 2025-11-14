import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

// This component handles the Student Form
const StudentForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess("");

    // --- EMAIL VALIDATION CHECK ---
    if (!formData.email.toLowerCase().endsWith("@dau.ac.in")) {
      setError("Email must end with @dau.ac.in");
      return; // Stop the submission
    }
    // --- END VALIDATION ---

    setLoading(true);
    try {
      const token = localStorage.getItem("ccms_token");
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/register-student`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Student account created successfully!");
      setFormData({ name: "", email: "", studentId: "", password: "" }); // Reset form
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to create student account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <h3 className="text-xl font-semibold text-gray-700">Add New Student</h3>

      {/* Form Fields */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Full Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Student ID
        </label>
        <input
          type="text"
          name="studentId"
          value={formData.studentId}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Messages */}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Student Account"}
      </button>
    </form>
  );
};

// This component handles the Committee Form
const CommitteeForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess("");

    // --- EMAIL VALIDATION CHECK ---
    if (!formData.email.toLowerCase().endsWith("@dau.ac.in")) {
      setError("Email must end with @dau.ac.in");
      return; // Stop the submission
    }
    // --- END VALIDATION ---

    setLoading(true);
    try {
      const token = localStorage.getItem("ccms_token");
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/register-committee`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Committee account created successfully!");
      setFormData({ name: "", email: "", password: "" }); // Reset form
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to create committee account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <h3 className="text-xl font-semibold text-gray-700">Add New Committee</h3>

      {/* Form Fields */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Committee Name
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Committee Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Messages */}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Committee Account"}
      </button>
    </form>
  );
};

// Main component to export
export default function CreateAccountPage() {
  const [accountType, setAccountType] = useState("student");
  const [mode, setMode] = useState("create"); // 'create' | 'delete'

  const DeleteForm = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");

      if (!email || !email.toLowerCase().endsWith("@dau.ac.in")) {
        setError("Please provide a valid @dau.ac.in email to delete.");
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("ccms_token");
        // axios.delete allows a request body via the `data` config
        await axios.delete(`${API_BASE_URL}/auth/delete-user`, {
          data: { email },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess("Account deleted successfully.");
        setEmail("");
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to delete account.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <h3 className="text-xl font-semibold text-gray-700">Delete Account</h3>
        <p className="text-sm text-gray-500">Provide the user's email to delete their account.</p>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Deleting..." : "Delete Account"}
        </button>
      </form>
    );
  };

  return (
    // Reusing your main content wrapper style
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Create / Delete Account
      </h1>

      <div className="grid grid-cols-2 gap-4 items-end">
        {/* Mode toggle */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="create">Create Account</option>
            <option value="delete">Delete Account</option>
          </select>
        </div>

        {/* Account type selector (only used in create mode) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Select Account Type</label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            disabled={mode !== 'create'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
          >
            <option value="student">Add New Student</option>
            <option value="committee">Add New Committee</option>
          </select>
        </div>
      </div>

      <hr className="my-6" />

      {/* Render based on mode */}
      {mode === 'create' ? (accountType === "student" ? <StudentForm /> : <CommitteeForm />) : (
        <DeleteForm />
      )}
    </div>
  );
}