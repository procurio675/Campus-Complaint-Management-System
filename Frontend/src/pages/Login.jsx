import React from "react";
import { useNavigate } from "react-router-dom";
import dauLogo from "../assets/dau_logo.png";
import campusBg from "../assets/campus.jpg"; // background image

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    navigate("/role-login", { state: { role } });
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen px-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${campusBg})` }}
    >
      {/* Transparent background overlay */}
      <div className="absolute inset-0 bg-black/35"></div>

      {/* Login Card */}
      <div className="relative bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl px-8 py-10 sm:px-10 sm:py-12 w-full max-w-md flex flex-col items-center text-center">
        
        {/* Logo */}
        <img
          src={dauLogo}
          alt="Dhirubhai Ambani University"
          className="w-40 sm:w-52 mb-6"
        />

        {/* Title (smaller size) */}
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-3 leading-snug">
          Campus Complaint <br className="hidden sm:block" />
          Resolve
        </h1>

        {/* Subtitle */}
        <p className="text-gray-700 mb-8">
          Select your role to continue
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full">
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
