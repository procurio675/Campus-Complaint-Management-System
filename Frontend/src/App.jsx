import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import RoleLogin from "./pages/RoleLogin";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import CommitteeDashboard from "./pages/CommitteeDashboard";
import AdminDashboard from "./pages/AdminDashboard";


function App() {
  const location = useLocation();

  // Paths where Navbar & Footer should be hidden
  const noNavbarRoutes = ["/login", "/role-login", "/register"];
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Show Navbar only for dashboard or inside app */}
      {showNavbar && <Navbar />}

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full overflow-hidden">
        <Routes>
          {/* Default route -> goes to Login page */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/role-login" element={<RoleLogin />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboards */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/committee-dashboard" element={<CommitteeDashboard />} />


          {/* 404 - Catch all unmatched routes */}
          <Route
            path="*"
            element={
              <div className="text-center text-lg text-gray-600">
                404 - Page Not Found
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
