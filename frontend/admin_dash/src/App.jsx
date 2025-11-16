import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import UploadPage from "./UploadPage";
import DashboardPage from "./DashboardPage";
import OrgUploadPage from "./OrgUploadPage";
import OrganizationDashboardPage from "./OrganizationDashboardPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/upload" element={<div className="container"><UploadPage /></div>} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/org-upload" element={<div className="container"><OrgUploadPage /></div>} />
        <Route path="/org-dashboard" element={<OrganizationDashboardPage />} />
        <Route path="/" element={<div className="container"><UploadPage /></div>} />
      </Routes>
    </Router>
  );
}

export default App;
