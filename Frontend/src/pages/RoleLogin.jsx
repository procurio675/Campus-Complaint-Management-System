import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RoleLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || "User";

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/student-dashboard"); // change this later as per role
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
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>

          {/* Forgot password link centered */}
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
