import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function MT940UploadForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await API.post("/upload", formData);
      setMessage("MT940 uploaded and processed!");
      navigate("/dashboard", { state: { view: "mt940" } });
    } catch (err) {
      setMessage("Upload failed");
    }
  };

  return (
    <div>
      <input type="file" className="form-control mb-2" onChange={(e) => setFile(e.target.files[0])} />
      <button className="btn btn-primary w-100" onClick={handleUpload} disabled={!file}>
        Upload MT940
      </button>
      {message && <div className="alert alert-info mt-3">{message}</div>}
    </div>
  );
} 