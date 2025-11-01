import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const navigate = useNavigate()
  const submit = (e) => { e.preventDefault(); navigate('/dashboard') }

  return (
    <div className="max-w-lg mx-auto bg-white shadow rounded p-6">
      <h2 className="text-xl font-semibold mb-4">Register</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600">Full name</label>
          <input name="name" required className="w-full mt-1 border rounded px-3 py-2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input name="roll" placeholder="Roll / Employee ID" className="border rounded px-3 py-2" />
          <input name="dept" placeholder="Department" className="border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Email</label>
          <input name="email" type="email" required className="w-full mt-1 border rounded px-3 py-2" />
        </div>
        <div>
          <button className="bg-blue-800 text-white px-4 py-2 rounded">Create account</button>
        </div>
      </form>
    </div>
  )
}
