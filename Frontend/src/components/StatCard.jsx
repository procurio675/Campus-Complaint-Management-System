import React from 'react'

export default function StatCard({title, value, hint}){
  return (
    <div className="bg-white p-4 rounded shadow-sm w-full">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </div>
  )
}
