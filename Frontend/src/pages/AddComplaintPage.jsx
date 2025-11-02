import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane } from "react-icons/fa";

export default function AddComplaintPage() {
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    alert(
      "Complaint submitted successfully! ID: CC" +
        Math.floor(Math.random() * 90000 + 10000)
    );

    navigate("/student-dashboard/my-complaints");
  };

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return setPreview(null);
    setPreview(URL.createObjectURL(f));
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800">File a New Complaint</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <form onSubmit={submit} className="space-y-6">
         
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Complaint Title
            </label>
            <input
              name="title"
              required
              placeholder="e.g., Wi-Fi not working in Block-B"
              className="w-full mt-1 border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Detailed Description
            </label>
            <textarea
              name="desc"
              required
              rows={6}
              placeholder="Please provide all relevant details, including room number, time, etc."
              className="w-full mt-1 border border-gray-300 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Attachment (optional)
            </label>
            <input
              type="file"
              onChange={onFile}
              className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="mt-4 max-h-48 rounded-lg shadow-sm"
              />
            )}
          </div>

          <div className="pt-4 text-right">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 transition-all"
            >
              <FaPaperPlane />
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}