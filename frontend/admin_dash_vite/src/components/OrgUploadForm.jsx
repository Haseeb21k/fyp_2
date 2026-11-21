import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function OrgUploadForm() {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!files.length) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    try {
      setLoading(true);
      await API.post("/org_upload", formData);
      setMessage("Organization files uploaded and processed!");
      setTimeout(() => {
        navigate("/org-dashboard");
      }, 1500);
    } catch (err) {
      setMessage("Upload failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (   
    <div>
      <div className="mb-3">
        <h3 className="mb-3">Upload Organization Files</h3>
        <label className="form-label">Select CSV Files</label>
        <input
          type="file"
          className="form-control"
          multiple
          accept=".csv"
          onChange={e => setFiles(Array.from(e.target.files))}
        />
      </div>
      <button 
        className="btn btn-primary w-100" 
        onClick={handleUpload} 
        disabled={!files.length || loading}
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
      {message && (
        <div className={`alert mt-3 ${message.includes("failed") ? "alert-danger" : "alert-success"}`}>
          {message}
        </div>
      )}
    </div>
  );
}

