import React from "react";
// --- UPDATED --- : Removed useLocation, it's not needed here
import { Routes, Route, Navigate } from "react-router-dom";

// --- UPDATED --- : Removed Navbar. The dashboards will render their own.
// import Navbar from "./components/Navbar"; 

import Login from "./pages/Login";
import RoleLogin from "./pages/RoleLogin";
import StudentDashboard from "./pages/StudentDashboard";
import CommitteeDashboard from "./pages/CommitteeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  // --- UPDATED ---
  // All 'showNavbar' logic and layout wrappers have been removed.
  // We return <Routes> directly, so each page component controls
  // its own full-screen layout.

  return (
    <Routes>
      {/* Default route -> goes to Login page */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication Routes (these are full-page components) */}
      <Route path="/login" element={<Login />} />
      <Route path="/role-login" element={<RoleLogin />} />

      {/* Dashboard Routes (these are full-page LAYOUT components) */}
      
      {/* --- IMPORTANT ---
        Notice the "/*" at the end of the path.
        This tells React Router that the <StudentDashboard> component
        will handle its own set of "nested" routes inside it
        (like /student-dashboard/add-complaint or /student-dashboard/profile)
      */}
      <Route 
        path="/student-dashboard/*" 
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard/*" 
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/committee-dashboard/*" 
        element={
          <ProtectedRoute allowedRole="committee">
            <CommitteeDashboard />
          </ProtectedRoute>
        } 
      />


      {/* 404 - Catch all unmatched routes */}
      <Route
        path="*"
        element={
          <div className="text-center text-lg text-gray-600 p-20">
            404 - Page Not Found
          </div>
        }
      />
    </Routes>
  );
}

export default App;