import React, { useState } from "react";
import API from "../api";

export default function UploadModal({
  title,
  description,
  endpoint,
  accept = ".csv",
  isOpen,
  onClose,
}) {
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!files.length) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    try {
      setLoading(true);
      await API.post(endpoint, formData);
      setMessage("Files uploaded and processed successfully!");
      setFiles([]);
    } catch (error) {
      setMessage("Upload failed. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setFiles([]);
    setMessage("");
    onClose();
  };

  return (
    <div style={backdropStyle}>
      <div style={modalStyle}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">{title}</h4>
          <button className="btn-close" onClick={handleClose} disabled={loading}></button>
        </div>
        {description && <p className="text-muted">{description}</p>}
        <div className="mb-3">
          <input
            type="file"
            className="form-control"
            multiple
            accept={accept}
            onChange={(e) => setFiles(Array.from(e.target.files))}
            disabled={loading}
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
          <div className="alert alert-info mt-3" role="alert">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1050,
};

const modalStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "24px",
  width: "100%",
  maxWidth: "520px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

