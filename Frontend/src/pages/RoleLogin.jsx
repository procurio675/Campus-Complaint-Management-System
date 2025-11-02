import React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Our mock "database"
const mockUsers = {
  admin: {
    email: "admin@campus.com",
    pass: "admin123",
  },
  student: {
    email: "student@campus.com",
    pass: "student123",
  },
  committee: {
    email: "committee@campus.com",
    pass: "committee123",
  },
};

const RoleLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || "User";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // 1. Email Format Check
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Find the correct user from our mock database based on the role
    const expectedUser = mockUsers[role];

    // 2. Account Exists Check
    if (!expectedUser || expectedUser.email !== email) {
      setError(`No ${role} account found with this email.`);
      return; 
    }

    // 3. Password Check
    if (expectedUser.pass !== password) {
      setError("Incorrect password. Please try again.");
      return; 
    }

    // --- SUCCESS ---
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else if (role === "student") {
      navigate("/student-dashboard");
    } else if (role === "committee") {
      navigate("/committee-dashboard");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative">
      {/* Back Button */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 flex items-center gap-2 text-blue-700 font-medium hover:underline"
      >
        ← Back
      </button>

      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          {role.charAt(0).toUpperCase() + role.slice(1)} Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-gray-700 font-semibold mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-gray-700 font-semibold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>

          <div className="text-center">
            <button
              type="button"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleLogin;