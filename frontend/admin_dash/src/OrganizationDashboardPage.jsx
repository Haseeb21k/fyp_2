import React, { useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import OrganizationSummaryCards from "./components/OrganizationSummaryCards";
import OrganizationTransactionTable from "./components/OrganizationTransactionTable";
import OrganizationPieChart from "./components/OrganizationPieChart";
import OrganizationBarChart from "./components/OrganizationBarChart";
import LoadingScreen from "./components/LoadingScreen";

export default function OrganizationDashboardPage() {
  const { user, logout } = useAuth();
  const transactionTableRef = useRef(null);

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

  const handleSummaryLoaded = useCallback(() => handleLoaded("summary"), [handleLoaded]);
  const handlePieLoaded = useCallback(() => handleLoaded("pie"), [handleLoaded]);
  const handleBarLoaded = useCallback(() => handleLoaded("bar"), [handleLoaded]);
  const handleTableLoaded = useCallback(() => handleLoaded("table"), [handleLoaded]);

  const allLoaded = Object.values(loading).every((v) => v === false);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {!allLoaded && <LoadingScreen />}
      <div style={{ 
        background: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem'
      }}>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <Link to="/dashboard" className="btn btn-light me-4 shadow-sm">
              <span className="me-2">&#8592;</span> Back to Main Dashboard
            </Link>
            <h1 className="fw-bold mb-0" style={{ letterSpacing: 1, color: 'white' }}>
              Organization Dashboard
            </h1>
          </div>
          <div className="d-flex gap-2">
            {user?.is_superuser && (
              <Link to="/org-upload" className="btn btn-light shadow-sm">
                Upload More Files
              </Link>
            )}
            <button className="btn btn-light shadow-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="container-fluid px-4">
        <div className="mb-4">
          <OrganizationSummaryCards onLoaded={handleSummaryLoaded} />
        </div>
        <div className="row mb-4">
          <div className="col-md-6">
            <OrganizationPieChart onLoaded={handlePieLoaded} />
          </div>
          <div className="col-md-6">
            <OrganizationBarChart onLoaded={handleBarLoaded} />
          </div>
        </div>
        <div>
          <OrganizationTransactionTable ref={transactionTableRef} onLoaded={handleTableLoaded} />
        </div>
      </div>
    </div>
  );
}

