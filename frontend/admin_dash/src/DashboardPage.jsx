import React, { useState, useCallback, useRef } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import SummaryCards from "./components/SummaryCards";
import TransactionTable from "./components/TransactionTable";
import FixedTransactionTable from "./components/FixedTransactionTable";
import PieChartByType from "./components/PieChartByType";
import BarChartBySource from "./components/BarChartBySource";
import LoadingScreen from "./components/LoadingScreen";

export default function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialView = location.state && location.state.view ? location.state.view : "csv";
  const [view] = useState(initialView);
  const transactionTableRef = useRef(null);
  const [savingBeforeNav, setSavingBeforeNav] = useState(false);

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

  const handleOrganizationFiles = async () => {
    // Try to save if there are edits, but navigate regardless
    setSavingBeforeNav(true);
    try {
      if (transactionTableRef.current) {
        await transactionTableRef.current.save();
      }
    } catch (error) {
      console.error("Error saving before navigation:", error);
      // Continue navigation even if save fails
    } finally {
      setSavingBeforeNav(false);
      navigate("/org-upload");
    }
  };

  return (
    <div>
      {!allLoaded && <LoadingScreen />}
      <div className="d-flex align-items-center justify-content-between py-4 ps-4 pe-4">
        <div className="d-flex align-items-center">
          <Link to="/" className="btn btn-light me-4 shadow-sm">
            <span className="me-2">&#8592;</span> Back to Home
          </Link>
          <h1 className="fw-bold mb-0" style={{letterSpacing: 1}}>Bank Transaction Dashboard</h1>
        </div>
        <button 
          className="btn btn-primary shadow-sm" 
          onClick={handleOrganizationFiles}
          disabled={savingBeforeNav}
        >
          {savingBeforeNav ? "Saving..." : "Organization Files"}
        </button>
      </div>
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