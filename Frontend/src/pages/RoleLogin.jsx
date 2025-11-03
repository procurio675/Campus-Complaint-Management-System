import React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const RoleLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get the role 
  const role = location.state?.role || "User";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const emailRegex =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // 1. Email Format Checker 
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      // Call backend login endpoint
      // We send the 'role' to the backend as 'intendedRole'
      const { data } = await axios.post(
        `http://localhost:5000/api/auth/login`,
        { email, password, intendedRole: (role || "").toLowerCase() },
        { headers: { "Content-Type": "application/json" } }
      );

      // Backend response: { _id, name, email, role, committeeType, token }
      const userRole = (data?.role || "").toLowerCase();

      // --- Role check removed ---
      // The backend now handles the role check for us.
    
      localStorage.setItem("ccms_token", data.token);
      localStorage.setItem(
        "ccms_user",
        JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          role: data.role,
          committeeType: data.committeeType,
        })
      );

      // Route based on the role returned from the backend
      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "student") {
        navigate("/student-dashboard");
      } else if (userRole === "committee") {
        navigate("/committee-dashboard");
      } else {
        // Fallback if role unknown
        navigate("/");
      }
    } catch (err) {
      // This will now catch both "Invalid email/password"
      // AND "This is a student account. Please use the student login portal."
      const msg =
        err?.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
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
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
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