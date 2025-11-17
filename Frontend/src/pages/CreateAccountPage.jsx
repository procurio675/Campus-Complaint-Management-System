import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
    strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.243 4.243L12 12" />
  </svg>
);

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
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setSuccess("");

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password is not strong enough. It must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
          </button>
        </div>
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
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
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

  const DeleteForm = ({ accountType }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showConfirmation, setShowConfirmation] = useState(false);

    const getPlaceholder = () => {
      return "";
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");

      if (!email || !email.toLowerCase().endsWith("@dau.ac.in")) {
        setError(
          `Please provide a valid ${
            accountType === "committee" ? "committee" : "student"
          } email to delete.`
        );
        return;
      }

      // Show confirmation popup
      setShowConfirmation(true);
    };

    const handleConfirmDelete = async () => {
      setShowConfirmation(false);
      setLoading(true);
      try {
        const token = localStorage.getItem("ccms_token");
        // axios.delete allows a request body via the `data` config
        await axios.delete(`${API_BASE_URL}/auth/delete-user`, {
          data: { email, role: accountType },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccess(
          `${
            accountType.charAt(0).toUpperCase() + accountType.slice(1)
          } account deleted successfully.`
        );
        setEmail("");
      } catch (err) {
        const errorMsg =
          err?.response?.data?.message || "Failed to delete account.";

        if (accountType === "committee" && errorMsg === "User not found.") {
          setError("Committee not found");
        } else {
          setError(errorMsg);
        }
      } finally {
        setLoading(false);
      }
    };

    const handleCancelDelete = () => {
      setShowConfirmation(false);
    };

    return (
      <>
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <h3 className="text-xl font-semibold text-gray-700">
            Delete Account
          </h3>
          <p className="text-sm text-gray-500">
            Provide the {accountType === "committee" ? "committee" : "student"}{" "}
            email to delete the account.
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={getPlaceholder()}
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
            {loading
              ? "Deleting..."
              : `Delete ${
                  accountType === "committee" ? "Committee" : "Student"
                } Account`}
          </button>
        </form>

        {showConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold text-red-600 mb-4">
                Confirm Deletion
              </h2>
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this{" "}
                <strong>{accountType}</strong> account?
              </p>
              <p className="text-gray-700 mb-6">
                <strong>Email:</strong> {email}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                This action cannot be undone. The account and all associated
                data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
                <button
                  onClick={handleCancelDelete}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    // Reusing your main content wrapper style
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {mode === "create" ? "Create Account" : "Delete Account"}
      </h1>

      <div className="grid grid-cols-2 gap-4 items-end">
        {/* Mode toggle */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mode
          </label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="create">Create Account</option>
            <option value="delete">Delete Account</option>
          </select>
        </div>

        {/* Account type selector (used in both create and delete modes) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Select Account Type
          </label>
          <select
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="student">
              {mode === "create" ? "Add New Student" : "Delete Student"}
            </option>
            <option value="committee">
              {mode === "create" ? "Add New Committee" : "Delete Committee"}
            </option>
          </select>
        </div>
      </div>

      {/* Render form based on account type and mode */}
      {mode === "create" && accountType === "student" && <StudentForm />}
      {mode === "create" && accountType === "committee" && <CommitteeForm />}
      {mode === "delete" && <DeleteForm accountType={accountType} />}
    </div>
  );
}
