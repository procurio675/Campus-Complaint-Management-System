import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPaperPlane, FaTimes } from "react-icons/fa";

export default function AddComplaintPage() {
  const [preview, setPreview] = useState([]);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    desc: "",
    location: "",
    type: "Public",
  });

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
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

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
        newError = "Only JPG, PNG, or PDF files are allowed.";
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        newError = `${file.name} exceeds 5MB limit.`;
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
    if (totalSize > 10 * 1024 * 1024) {
      newError = "Total upload size cannot exceed 10MB.";
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

    if (!cleanTitle || cleanTitle.length < 5)
      errors.push("Title must be at least 5 characters long.");
    if (cleanTitle.length > 200)
      errors.push("Title cannot exceed 200 characters.");

    if (!cleanDesc || cleanDesc.length < 50)
      errors.push("Description must be at least 50 characters long.");

    if (cleanDesc.length > 3000)
      errors.push("Description cannot exceed 3000 characters.");

    if (/(.)\1{29,}/.test(cleanDesc))
      errors.push(
        "Description has excessive repetition of a single character — please revise."
      );

    if (!/[A-Za-z0-9]/.test(cleanTitle)) {
      errors.push("Title must contain at least one letter or number.");
    }

    if (!/[A-Za-z0-9]/.test(cleanDesc)) {
      errors.push("Description must contain at least one letter or number.");
    }

    return { valid: errors.length === 0, errors };
  };

  // === Submit: send Title + Description to backend LangChain route ===
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
      // Adjust URL if your backend is on a different origin
      const res = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          body: form.desc,
        }),
      });


      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      const data = await res.json(); // expected: { committee, priority }
      const committee = data.committee || "Academic";
      const priority = data.priority || "Medium";

      alert(
        `Complaint analyzed.\n\nCommittee: ${committee}\nPriority: ${priority}`
      );

      // After classification you can navigate or keep them on this page
      navigate("/student-dashboard/my-complaints");
    } catch (err) {
      console.error(err);
      setErrors([
        "Could not analyze complaint at the moment. Please try again later.",
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        File a New Complaint
      </h1>
      <p className="text-gray-600 mb-8">
        Please provide accurate and detailed information. The system will
        automatically route your complaint to the relevant committee.
      </p>
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
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
              } rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
                if (e.target.value.length <= 3000) {
                  handleChange(e);
                }
              }}
              maxLength={3000}
              rows={6}
              placeholder="Describe the issue with sufficient detail and context."
              className={`w-full mt-1 border ${
                errors.some((err) => err.toLowerCase().includes("description"))
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
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
              className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                accept=".jpg,.jpeg,.png,.pdf"
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

          {/* Top-level error (API) */}
          {errors.length > 0 &&
            !errors.find((e) => e.toLowerCase().includes("file")) && (
              <div className="text-red-600 text-sm">{errors[0]}</div>
            )}
        </form>
      </div>
    </div>
  );
}
