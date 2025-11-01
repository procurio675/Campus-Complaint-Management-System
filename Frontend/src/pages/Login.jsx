import React from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (role) => {
  navigate("/role-login", { state: { role } });
  };



  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
          Campus Complaint Resolve
        </h1>

        <p className="text-gray-600 text-center mb-6">
          Select your role to continue
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleLogin("admin")}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200"
          >
            Login as Admin
          </button>

          <button
            onClick={() => handleLogin("student")}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200"
          >
            Login as Student
          </button>

          <button
            onClick={() => handleLogin("committee")}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200"
          >
            Login as Committee
          </button>
        </div>
      </div>
    </div>
  );
}
