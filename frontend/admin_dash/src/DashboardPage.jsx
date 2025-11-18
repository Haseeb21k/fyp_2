import React, { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import SummaryCards from "./components/SummaryCards";
import TransactionTable from "./components/TransactionTable";
import FixedTransactionTable from "./components/FixedTransactionTable";
import PieChartByType from "./components/PieChartByType";
import BarChartBySource from "./components/BarChartBySource";
import LoadingScreen from "./components/LoadingScreen";
import UserManagement from "./components/UserManagement";
import UploadModal from "./components/UploadModal";
import DashboardLayout from "./components/DashboardLayout";

export default function DashboardPage() {
  const location = useLocation();
  const { user } = useAuth();
  const initialView = location.state && location.state.view ? location.state.view : "csv";
  const [view] = useState(initialView);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showBankUploadModal, setShowBankUploadModal] = useState(false);
  const [showOrgUploadModal, setShowOrgUploadModal] = useState(false);

  // Track loading state for all 4 data components
  const [loading, setLoading] = useState({
    summary: true,
    pie: true,
    bar: true,
    table: true,
  });

  const handleLoaded = useCallback((key) => {
    setLoading((prev) => ({ ...prev, [key]: false }));
  }, []);

  // Memoize each onLoaded callback so their reference is stable
  const handleSummaryLoaded = useCallback(() => handleLoaded("summary"), [handleLoaded]);
  const handlePieLoaded = useCallback(() => handleLoaded("pie"), [handleLoaded]);
  const handleBarLoaded = useCallback(() => handleLoaded("bar"), [handleLoaded]);
  const handleTableLoaded = useCallback(() => handleLoaded("table"), [handleLoaded]);

  const allLoaded = Object.values(loading).every((v) => v === false);


  return (
    <DashboardLayout>
      {!allLoaded && <LoadingScreen />}
      <div className="d-flex align-items-center justify-content-between py-4 px-4">
        <h1 className="fw-bold mb-0" style={{ letterSpacing: 1 }}>
          Bank Transaction Dashboard
        </h1>
        {user?.is_superuser && (
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <button
              className="btn btn-primary shadow-sm"
              onClick={() => setShowBankUploadModal(true)}
            >
              Upload Bank Files
            </button>
           
          </div>
        )}
      </div>
      {showUserManagement && user?.is_superuser && (
        <div className="px-4 mb-4">
          <UserManagement />
        </div>
      )}
      <div className="px-4 mb-4">
        <SummaryCards view={view} onLoaded={handleSummaryLoaded} />
      </div>
      <div className="row mb-4 px-4">
        <div className="col-md-6">
          <PieChartByType onLoaded={handlePieLoaded} />
        </div>
        <div className="col-md-6">
          <BarChartBySource onLoaded={handleBarLoaded} />
        </div>
      </div>
      <div className="px-4 pb-4">
        {view === "csv" ? (
          <TransactionTable onLoaded={handleTableLoaded} />
        ) : (
          <FixedTransactionTable onLoaded={handleTableLoaded} />
        )}
      </div>

      <UploadModal
        title="Upload Bank Files"
        description="Select CSV or MT940 files for the bank dashboard."
        endpoint="/unified_upload"
        accept=".csv,.txt,.mt940"
        isOpen={showBankUploadModal}
        onClose={() => setShowBankUploadModal(false)}
      />

      <UploadModal
        title="Upload Organization Files"
        description="Select CSV files for the organization dashboard."
        endpoint="/org_upload"
        accept=".csv"
        isOpen={showOrgUploadModal}
        onClose={() => setShowOrgUploadModal(false)}
      />
    </DashboardLayout>
  );
} 