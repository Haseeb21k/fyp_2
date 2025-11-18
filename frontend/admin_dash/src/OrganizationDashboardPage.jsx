import React, { useState, useCallback } from "react";
import { useAuth } from "./contexts/AuthContext";
import OrganizationSummaryCards from "./components/OrganizationSummaryCards";
import OrganizationTransactionTable from "./components/OrganizationTransactionTable";
import OrganizationPieChart from "./components/OrganizationPieChart";
import OrganizationBarChart from "./components/OrganizationBarChart";
import LoadingScreen from "./components/LoadingScreen";
import UploadModal from "./components/UploadModal";
import DashboardLayout from "./components/DashboardLayout";

export default function OrganizationDashboardPage() {
  const { user } = useAuth();
  const [showOrgUploadModal, setShowOrgUploadModal] = useState(false);

  const [loading, setLoading] = useState({
    summary: true,
    pie: true,
    bar: true,
    table: true,
  });

  const handleLoaded = useCallback((key) => {
    setLoading((prev) => ({ ...prev, [key]: false }));
  }, []);

  const handleSummaryLoaded = useCallback(() => handleLoaded("summary"), [handleLoaded]);
  const handlePieLoaded = useCallback(() => handleLoaded("pie"), [handleLoaded]);
  const handleBarLoaded = useCallback(() => handleLoaded("bar"), [handleLoaded]);
  const handleTableLoaded = useCallback(() => handleLoaded("table"), [handleLoaded]);

  const allLoaded = Object.values(loading).every((v) => v === false);

  return (
    <DashboardLayout>
      {!allLoaded && <LoadingScreen />}
      <div className="py-4 px-4 d-flex align-items-center justify-content-between">
        <h1 className="fw-bold mb-0" style={{ letterSpacing: 1, color: "#6c5ce7" }}>
          Organization Dashboard
        </h1>
        {user?.is_superuser && (
          <button className="btn btn-primary shadow-sm" onClick={() => setShowOrgUploadModal(true)}>
            Upload Organization Files
          </button>
        )}
      </div>
      <div className="px-4 mb-4">
        <OrganizationSummaryCards onLoaded={handleSummaryLoaded} />
      </div>
      <div className="row mb-4 px-4">
        <div className="col-md-6">
          <OrganizationPieChart onLoaded={handlePieLoaded} />
        </div>
        <div className="col-md-6">
          <OrganizationBarChart onLoaded={handleBarLoaded} />
        </div>
      </div>
      <div className="px-4 pb-4">
        <OrganizationTransactionTable onLoaded={handleTableLoaded} />
      </div>

      <UploadModal
        title="Upload Organization Files"
        description="Select CSV files to update the organization dashboard."
        endpoint="/org_upload"
        accept=".csv"
        isOpen={showOrgUploadModal}
        onClose={() => setShowOrgUploadModal(false)}
      />
    </DashboardLayout>
  );
}
