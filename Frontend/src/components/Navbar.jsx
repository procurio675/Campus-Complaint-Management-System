import React from "react";
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar(){
  const navigate = useNavigate()
  const logout = () => {navigate('/login') }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-white font-bold">CC</div>
          <div>
            <Link to="/dashboard" className="font-semibold text-lg text-blue-800">CCMS</Link>
            <div className="text-xs text-gray-500">Campus Complaint Management System</div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/complaints/new" className="px-3 py-2 bg-yellow-400 rounded text-sm font-medium">+ New Complaint</Link>
          <Link to="/complaints" className="text-sm text-gray-700">My Complaints</Link>
          <Link to="/profile" className="text-sm text-gray-700">Profile</Link>
          <button onClick={logout} className="text-sm text-red-500">Logout</button>
        </div>
      </div>
    </nav>
  )
}
