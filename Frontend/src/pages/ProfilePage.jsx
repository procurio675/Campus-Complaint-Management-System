import React, { useState } from "react"; 
import axios from "axios";
import API_BASE_URL from "../config/api.js";
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaIdBadge,
  FaLock, 
} from "react-icons/fa";

const InfoItem = ({ icon, label, value }) => (
  <div className="flex flex-col">
    <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
      {React.cloneElement(icon, { className: "text-gray-400", size: 14 })}
      {label}
    </label>
    <div className="mt-1 text-base font-semibold text-gray-800 ml-6">
      {value}
    </div>
  </div>
);

export default function ProfilePage() {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordMessage, setPasswordMessage] = useState({
    type: "",
    text: "",
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: "", text: "" });

    if (passwords.new !== passwords.confirm) {
      setPasswordMessage({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }
    if (passwords.new.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 8 characters.",
      });
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!passwordRegex.test(passwords.new)) {
      setPasswordMessage({
        type: "error",
        text: "Password must include uppercase, lowercase, number, and special character.",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Get token from localStorage
      const token = localStorage.getItem("ccms_token");
      
      if (!token) {
        setPasswordMessage({
          type: "error",
          text: "You are not logged in. Please login again.",
        });
        setLoading(false);
        return;
      }

      // Call backend API
      const { data } = await axios.put(
        `${API_BASE_URL}/auth/change-password`,
        {
          currentPassword: passwords.current,
          newPassword: passwords.new,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Success
      setPasswordMessage({
        type: "success",
      text: "Password changed successfully!",
      });
      setPasswords({ current: "", new: "", confirm: "" });
      
      // Clear success message after 5 seconds
      setTimeout(() => setPasswordMessage({ type: "", text: "" }), 5000);

    } catch (error) {
      // Handle errors
      const errorMessage = error?.response?.data?.message || "Failed to change password. Please try again.";
      setPasswordMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800">Your Profile</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl">
            N
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Name
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoItem
            icon={<FaEnvelope />}
            label="Email Address"
            value="name@example.edu"
          />
          <InfoItem
            icon={<FaIdBadge />}
            label="Student ID"
            value="21BCE123"
          />
          <InfoItem
            icon={<FaBuilding />}
            label="Department"
            value="Computer Engineering"
          />
          <InfoItem
            icon={<FaUser />}
            label="Role"
            value="Student"
          />
        </div>
      </div>

      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white p-6 rounded-xl shadow-lg"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Change Password
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div>
            <label
              htmlFor="current"
              className="block text-sm font-medium text-gray-700"
            >
              Current Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" size={14} />
              </div>
              <input
                type="password"
                id="current"
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                required
                className="w-full pl-9 pr-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label
              htmlFor="new"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" size={14} />
              </div>
              <input
                type="password"
                id="new"
                name="new"
                value={passwords.new}
                onChange={handlePasswordChange}
                required
                className="w-full pl-9 pr-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
     
          <div>
            <label
              htmlFor="confirm"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" size={14} />
              </div>
              <input
                type="password"
                id="confirm"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                required
                className="w-full pl-9 pr-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {passwordMessage.text && (
          <div
            className={`mt-4 text-sm font-medium ${
              passwordMessage.type === "error"
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {passwordMessage.text}
          </div>
        )}

        <div className="mt-6 text-right">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-all ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Save Password"}
          </button>
        </div>
      </form>
    </div>
  );
}