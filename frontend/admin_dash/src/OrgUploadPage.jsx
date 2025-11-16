import React from "react";
import { Link } from "react-router-dom";
import OrgUploadForm from "./components/OrgUploadForm";

export default function OrgUploadPage() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="card p-4 shadow" style={{ minWidth: 350 }}>
        <div className="mb-3">
          <Link to="/dashboard" className="btn btn-light mb-3 shadow-sm">
            <span className="me-2">&#8592;</span> Back to Dashboard
          </Link>
        </div>
        <OrgUploadForm />
      </div>
    </div>
  );
}

