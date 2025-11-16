import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import axios from "axios";
import API_BASE_URL from "../config/api.js";

const INITIAL_FORM_STATE = {
  title: "",
  desc: "",
  location: "",
  type: "Public",
  isAnonymous: false,
};

export default function AddComplaintPage() {
  const [preview, setPreview] = useState([]);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [successDetails, setSuccessDetails] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...INITIAL_FORM_STATE });

  const resetFormState = () => {
    setForm({ ...INITIAL_FORM_STATE });
    setFiles([]);
    setPreview([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const closeSuccessModal = () => {
    setSuccessDetails(null);
  };

  const handleViewComplaints = () => {
    closeSuccessModal();
    navigate("/student-dashboard/my-complaints");
  };

  const handleFileAnother = () => {
    closeSuccessModal();
    resetFormState();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const MAX_FILES = 3;
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "video/mp4",
      "video/quicktime",
    ];

    const allFiles = [...files];
    const newPreviews = [...preview];
    let newError = "";

    for (let file of newFiles) {
      const isDuplicate = allFiles.some(
        (f) => f.name === file.name && f.size === file.size
      );
      if (isDuplicate) {
        newError = `File "${file.name}" is already uploaded.`;
        continue;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        newError = "Only JPG, PNG, MP4, or MOV files are allowed.";
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        newError = `${file.name} exceeds 10MB limit.`;
        continue;
      }

      if (allFiles.length >= MAX_FILES) {
        newError = "You can upload up to 3 files only.";
        break;
      }

      allFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 20 * 1024 * 1024) {
      newError = "Total upload size cannot exceed 20MB.";
    }

    setFiles(allFiles);
    setPreview(newPreviews);

    if (newError) {
      setErrors([newError]);
    } else {
      setErrors([]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreview = preview.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreview(updatedPreview);
    setErrors([]);
  };

  const clearAllFiles = () => {
    setFiles([]);
    setPreview([]);
    setErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const validateComplaintText = (title, desc) => {
    const errors = [];
    const clean = (text) =>
      text
        .normalize("NFKC")
        .replace(/[\u200B-\u200D\uFEFF]/g, "")
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const cleanTitle = clean(title);
    const cleanDesc = clean(desc);

    // Title Validation (Character-based)
    if (!cleanTitle || cleanTitle.length < 5)
      errors.push("Title must be at least 5 characters long.");
    if (cleanTitle.length > 200)
      errors.push("Title cannot exceed 200 characters.");

    // Description Validation (Character-based)
    if (!cleanDesc || cleanDesc.length < 30)
      errors.push("Description must be at least 30 characters long.");

    if (cleanDesc.length > 3000)
      errors.push("Description cannot exceed 3000 characters.");

    // Character-repetition spam check
    if (/(.)\1{29,}/.test(cleanDesc))
      errors.push(
        "Description has excessive repetition of a single character — please revise."
      );

    // Ensuring that title has at least one visible alphanumeric character
    if (!/[A-Za-z0-9]/.test(cleanTitle)) {
      errors.push("Title must contain at least one letter or number.");
    }

    // Ensuring that description has at least one visible alphanumeric character
    if (!/[A-Za-z0-9]/.test(cleanDesc)) {
      errors.push("Description must contain at least one letter or number.");
    }

    return { valid: errors.length === 0, errors };
  };

  const submit = async (e) => {
    e.preventDefault();
    const { valid, errors: validationErrors } = validateComplaintText(
      form.title,
      form.desc
    );
    if (!valid) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setSubmitting(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem("ccms_token");

      if (!token) {
        setErrors(["You are not logged in. Please login again."]);
        setSubmitting(false);
        return;
      }

      // Create FormData for file uploads
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.desc.trim());
      formData.append("location", form.location?.trim() || "");
      formData.append("type", form.type);
      formData.append("isAnonymous", form.isAnonymous ? "true" : "false");


      // Append files if any
      if (files.length > 0) {
        files.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      // Call API
      const { data } = await axios.post(
        `${API_BASE_URL}/complaints/create`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      const complaintId = `CC${data.complaint._id.slice(-6).toUpperCase()}`;
      setSuccessDetails({
        complaintId,
        committee: data.routing.committee,
      });
      resetFormState();
    } catch (error) {
      console.error("Submit Complaint Error:", error?.response || error);
      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message;

      if (status === 400 && backendMessage?.toLowerCase().includes("spam")) {
        setErrors([backendMessage]);
      } else {
        const errorMessage =
          backendMessage ||
          error?.message ||
          "Failed to submit complaint. Please try again.";
        setErrors([errorMessage]);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {submitting && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white/95 border border-blue-100 rounded-2xl shadow-2xl p-6 max-w-sm w-[90%] text-center">
            <div className="submission-spinner mx-auto mb-4" aria-hidden="true" />
            <p className="text-lg font-semibold text-gray-800">
              Submitting your complaint
            </p>
            <p className="text-sm text-gray-500 mt-2" aria-live="assertive">
              We are encrypting your attachments and routing the complaint. This may take a few seconds.
            </p>
          </div>
        </div>
      )}

      {successDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeSuccessModal}
          />
          <div className="relative bg-white rounded-[32px] px-8 py-10 mx-4 w-full max-w-lg border border-blue-100 shadow-[0_28px_60px_rgba(15,23,42,0.18)] text-center">
            <div className="success-tick mx-auto mb-6" aria-hidden="true" />
            <p className="text-xs font-semibold tracking-[0.35em] text-sky-500 uppercase">
              Success
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mt-2">
              Complaint Submitted
            </h2>
            <p className="text-sm text-gray-500 mt-3">
              We will notify you as progress is made. Keep an eye on your dashboard for updates.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mt-8 text-left">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Complaint ID
              </p>
              <p className="text-xl font-semibold text-gray-900">
                {successDetails.complaintId}
              </p>
              <div className="mt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Routed to
                </p>
                <p className="text-base font-medium text-gray-800">
                  {successDetails.committee}
                </p>
              </div>
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleViewComplaints}
                className="flex-1 bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all"
              >
                View My Complaints
              </button>
              <button
                onClick={handleFileAnother}
                className="flex-1 border border-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-xl hover:bg-blue-50 transition-all"
              >
                File Another
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
      
        <h1 className="text-3xl font-bold text-gray-800 mb-2 ">
          File a New Complaint
        </h1>
        <br />
        <p className="text-gray-600 mb-8">
          Please provide accurate and detailed information. The system will
          automatically route your complaint to the relevant committee.
        </p>
        <form onSubmit={submit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Complaint Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={(e) => {
                // Restrict typing to max 200 chars
                if (e.target.value.length <= 200) {
                  handleChange(e);
                }
              }}
              maxLength={200}
              placeholder="e.g., Wi-Fi not working in Block B"
              className={`w-full mt-1 border ${
                errors.includes("Title must be at least 5 characters long.") ||
                errors.includes("Title cannot exceed 200 characters.")
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg px-3 py-2 `}
              required
            />
            <div className="flex justify-between mt-1">
              <p
                className={`text-xs ${
                  form.title.length >= 180
                    ? "text-red-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                {form.title.length} / 200 characters
                {form.title.length >= 200 && " — Character limit reached"}
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="desc"
              value={form.desc}
              onChange={(e) => {
                // Only allow typing until 3000 characters
                if (e.target.value.length <= 3000) {
                  handleChange(e);
                }
              }}
              maxLength={3000} // ensures paste/hold typing is blocked beyond limit
              rows={6}
              placeholder="Describe the issue with sufficient detail and context."
              className={`w-full mt-1 border ${
                errors.some((err) => err.toLowerCase().includes("description"))
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg px-3 py-2 `}
              required
            />
            <div className="flex justify-between mt-1">
              <p
                className={`text-xs ${
                  form.desc.length >= 2900
                    ? "text-red-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                {form.desc.length} / 3000 characters
                {form.desc.length >= 3000 && " — Character limit reached"}
              </p>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location (optional)
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g., Hostel A Room 214 / C-Block 2nd Floor"
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 "
            />
          </div>

          {/* File Upload */}
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">
                Attachments (optional)
              </label>
              {files.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllFiles}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove all
                </button>
              )}
            </div>

            <label className="inline-block mt-2 cursor-pointer text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 py-2 px-4 rounded-lg transition-all">
              Choose Files
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={onFileChange}
                accept=".jpg,.jpeg,.png,.mp4,.mov"
                className="hidden"
              />
            </label>

            {errors.length > 0 &&
              errors.find((e) => e.toLowerCase().includes("file")) && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.find((e) => e.toLowerCase().includes("file"))}
                </p>
              )}

            {preview.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-3 justify-items-start">
                {preview.map((src, i) => (
                  <div key={i} className="relative group w-full max-w-[200px]">
                    {files[i].type.includes("image") ? (
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                      >
                        <img
                          src={src}
                          alt={`Preview of ${files[i].name}`}
                          className="h-12 w-full object-cover rounded-lg shadow-sm border hover:opacity-90 transition"
                        />
                      </a>
                    ) : (
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border rounded-lg px-2 py-1 text-xs text-gray-700 bg-gray-50 flex items-center justify-start h-12 w-full overflow-hidden text-ellipsis whitespace-nowrap hover:bg-blue-50 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title={`Click to view ${files[i].name}`}
                      >
                        📄{" "}
                        <span className="ml-1 truncate">{files[i].name}</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(i);
                      }}
                      className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-[3px] opacity-0 group-hover:opacity-100 transition focus:opacity-100 focus:ring-2 focus:ring-red-400"
                      title="Remove file"
                    >
                      <FaTimes size={9} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Complaint Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Is this complaint personal or public?
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Personal complaints are visible only to you and the concerned
              authority. Public complaints are visible to everyone (without
              revealing your identity) and can be upvoted.
            </p>
            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="Personal"
                  checked={form.type === "Personal"}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Personal</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="type"
                  value="Public"
                  checked={form.type === "Public"}
                  onChange={handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">
                  Public (faced by many)
                </span>
              </label>
            </div>
          </div>

          {/* Submit Anonymously */}
          <div className="mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isAnonymous"
                checked={form.isAnonymous || false}
                onChange={(e) =>
                setForm((prev) => ({ ...prev, isAnonymous: e.target.checked }))
              }
              className="h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">
                Submit Anonymously
                <span className="text-gray-500 block text-xs mt-1">
                Your identity will be hidden from committees and other users, 
                but your complaint will still be processed normally.
                </span>
              </span>
            </label>
          </div>

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800 mb-2">
                Please fix the following errors:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Submit */}
          <div className="pt-6 text-right">
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-2 bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all ${
                submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <FaPaperPlane />
              {submitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
