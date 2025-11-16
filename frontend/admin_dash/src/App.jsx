import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import UploadPage from "./UploadPage";
import DashboardPage from "./DashboardPage";
import OrgUploadPage from "./OrgUploadPage";
import OrganizationDashboardPage from "./OrganizationDashboardPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/upload" element={
            <ProtectedRoute requireSuperuser={true}>
              <div className="container"><UploadPage /></div>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/org-upload" element={
            <ProtectedRoute requireSuperuser={true}>
              <div className="container"><OrgUploadPage /></div>
            </ProtectedRoute>
          } />
          <Route path="/org-dashboard" element={
            <ProtectedRoute>
              <OrganizationDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
