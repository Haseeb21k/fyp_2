import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post("/dynamic_upload", formData);
      setMessage("File uploaded and processed!");
      navigate("/dashboard");
    } catch (err) {
      setMessage("Upload failed");
    }
  };

  return (
    <div>
      <h2 className="mb-3">Upload CSV File</h2>
      <div className="mb-3">
        <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
      </div>
      <button className="btn btn-primary w-100" onClick={handleUpload} disabled={!file}>
        Upload
      </button>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
}
