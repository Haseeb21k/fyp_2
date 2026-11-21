import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function UnifiedUploadForm() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    try {
      await API.post("/unified_upload", formData);
      setMessage("Files uploaded and processed!");
      navigate("/dashboard", { state: { view: "csv" } });
    } catch (err) {
      setMessage("Upload failed");
    }
  };

  return (   
    <div>
      <div className="mb-3">
        <h3 className="mb-3">Upload Files Here</h3>
        <label className="form-label">Select CSV and/or MT940 Files</label>
        <input
          type="file"
          className="form-control"
          multiple
          onChange={e => setFiles(Array.from(e.target.files))}
        />
      </div>
      <button className="btn btn-primary w-100" onClick={handleUpload} disabled={!files.length}>
        Upload
      </button>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
} 