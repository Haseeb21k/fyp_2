import React from "react";
import DashboardLayout from "./components/DashboardLayout";
import UserManagement from "./components/UserManagement";

export default function UserManagementPage() {
  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="fw-bold mb-0" style={{ letterSpacing: 1 }}>
            User Management
          </h1>
          <p className="text-muted mb-0">
            Invite and manage organization users.
          </p>
        </div>
        <UserManagement />
      </div>
    </DashboardLayout>
  );
}

