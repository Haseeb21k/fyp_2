import React, { useState, useCallback, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import SummaryCards from "./components/SummaryCards";
import TransactionTable from "./components/TransactionTable";
import FixedTransactionTable from "./components/FixedTransactionTable";
import PieChartByType from "./components/PieChartByType";
import BarChartBySource from "./components/BarChartBySource";
import LoadingScreen from "./components/LoadingScreen";
import UserManagement from "./components/UserManagement";

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const initialView = location.state && location.state.view ? location.state.view : "csv";
  const [view] = useState(initialView);
  const transactionTableRef = useRef(null);
  const [showUserManagement, setShowUserManagement] = useState(false);

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
    <div>
      {!allLoaded && <LoadingScreen />}
      <div className="d-flex align-items-center justify-content-between py-4 ps-4 pe-4">
        <div className="d-flex align-items-center">
          <h1 className="fw-bold mb-0" style={{letterSpacing: 1}}>Transaction Dashboard</h1>
        </div>
        <div className="d-flex gap-2">
          {user?.is_superuser && (
            <>
              <Link to="/upload" className="btn btn-primary shadow-sm">
                Upload Files
              </Link>
              <button 
                className="btn btn-outline-primary shadow-sm" 
                onClick={() => setShowUserManagement(!showUserManagement)}
              >
                Manage Users
              </button>
              <Link to="/org-upload" className="btn btn-primary shadow-sm">
                Organization Files
              </Link>
            </>
          )}
          <button className="btn btn-outline-secondary shadow-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      {showUserManagement && user?.is_superuser && (
        <div className="mb-4">
          <UserManagement />
        </div>
      )}
      <div className="mb-4">
        <SummaryCards view={view} onLoaded={handleSummaryLoaded} />
      </div>
      <div className="row mb-4">
        <div className="col-md-6">
          <PieChartByType onLoaded={handlePieLoaded} />
        </div>
        <div className="col-md-6">
          <BarChartBySource onLoaded={handleBarLoaded} />
        </div>
      </div>
      <div>
        {view === "csv" ? <TransactionTable ref={transactionTableRef} onLoaded={handleTableLoaded} /> : <FixedTransactionTable onLoaded={handleTableLoaded} />}
      </div>
    </div>
  );
} 