
import React from "react";

export default function LoadingScreen() {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "#fff", zIndex: 9999
    }}>
      <div className="spinner-border text-primary" style={{width: 60, height: 60}} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <div style={{marginTop: 24, fontSize: 20, color: '#333', fontWeight: 500, textAlign: 'center'}}>
        Your data is being loaded...
      </div>
    </div>
  );
} 