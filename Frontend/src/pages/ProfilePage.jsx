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

const InfoItem = ({ icon, label, value, testId }) => (
  <div className="flex flex-col">
    <label className="flex items-center gap-1.5 sm:gap-2 text-[10px] xs:text-xs font-medium text-gray-500">
      {React.cloneElement(icon, { className: "text-gray-400", size: 12 })}
      {label}
    </label>
    <div
      className="mt-1 text-sm sm:text-base font-semibold text-gray-800 ml-4 sm:ml-6"
      data-testid={testId}
    >
      {value}
    </div>
  </div>
);

export default function ProfilePage() {
  // load user from localStorage (set at login in RoleLogin.jsx)
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("ccms_user"));
  } catch (e) {
    storedUser = null;
  }

  const displayName = (storedUser && storedUser.name) || "Name";
  const displayEmail = (storedUser && storedUser.email) || "name@example.edu";
  // As requested: student ID is the domain name part of the email
  const displayStudentID = displayEmail.includes("@") ? displayEmail.split("@")[0] : "failed to load email ID";
  const displayRole = (storedUser && storedUser.role) || "Student";

  // Derive department from studentID code (4th and 5th index -> slice(4,6)) when department not provided
  const deptMap = {
    "01": "B.Tech ICT",
    "03": "B.Tech MnC",
    "04": "B.Tech EVD",
    "11": "M.Tech ICT",
    "12": "M.Sc IT",
    "14": "M.Sc AA",
    "18": "M.Sc DS",
    "19": "M.Des",
  };

  const idCode = displayStudentID && displayStudentID.length >= 6 ? displayStudentID.slice(4, 6) : null;
  const derivedDept = idCode && deptMap[idCode] ? deptMap[idCode] : null;
  const displayDepartment = (storedUser && storedUser.department) || derivedDept || "Computer Engineering";

  const avatarLetter = displayName ? displayName.charAt(0).toUpperCase() : "N";

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
    <div className="flex flex-col gap-4 sm:gap-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Your Profile</h1>

      <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl sm:text-2xl">
            {avatarLetter}
          </div>
          <div>
            <h2
              className="text-lg sm:text-xl font-bold text-gray-800"
              data-testid="profile-name"
            >
              {displayName}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <InfoItem
            icon={<FaEnvelope />}
            label="Email Address"
            value={displayEmail}
            testId="profile-email"
          />

          {/* Decide whether to show Student ID and Department: only show when local-part has NO English letters */}
          {(() => {
            const localPart = displayEmail.includes("@") ? displayEmail.split("@")[0] : "";
            const hasLetter = /[A-Za-z]/.test(localPart);
            const showIdDept = !hasLetter;
            if (!showIdDept) {
              // show only Role when there's a letter in username
              return (
                <InfoItem
                  icon={<FaUser />}
                  label="Role"
                  value={displayRole}
                  testId="profile-role"
                />
              );
            }

            // show full details when id is numeric-only
            return (
              <>
                <InfoItem
                  icon={<FaIdBadge />}
                  label="Student ID"
                  value={displayStudentID}
                  testId="profile-studentid"
                />
                <InfoItem
                  icon={<FaBuilding />}
                  label="Department"
                  value={displayDepartment}
                  testId="profile-department"
                />
                <InfoItem
                  icon={<FaUser />}
                  label="Role"
                  value={displayRole}
                  testId="profile-role"
                />
              </>
            );
          })()}
        </div>
      </div>

      <form
        onSubmit={handlePasswordSubmit}
        className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-lg"
      >
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 sm:mb-6">
          Change Password
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          <div>
            <label
              htmlFor="current"
              className="block text-xs sm:text-sm font-medium text-gray-700"
            >
              Current Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" size={12} />
              </div>
              <input
                type="password"
                id="current"
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                required
                className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label
              htmlFor="new"
              className="block text-xs sm:text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" size={12} />
              </div>
              <input
                type="password"
                id="new"
                name="new"
                value={passwords.new}
                onChange={handlePasswordChange}
                required
                className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
     
          <div>
            <label
              htmlFor="confirm"
              className="block text-xs sm:text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" size={12} />
              </div>
              <input
                type="password"
                id="confirm"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                required
                className="w-full pl-7 sm:pl-9 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {passwordMessage.text && (
          <div
            className={`mt-3 sm:mt-4 text-xs sm:text-sm font-medium ${
              passwordMessage.type === "error"
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {passwordMessage.text}
          </div>
        )}

        <div className="mt-4 sm:mt-6 text-right">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white font-medium py-2 px-4 sm:px-6 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all text-sm sm:text-base w-full xs:w-auto touch-manipulation ${
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