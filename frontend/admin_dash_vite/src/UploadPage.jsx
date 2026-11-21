import React from "react";
import UnifiedUploadForm from "./components/UnifiedUploadForm";

export default function UploadPage() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
      <div className="card p-4 shadow" style={{ minWidth: 350 }}>
        <UnifiedUploadForm />
      </div>
    </div>
  );
} 