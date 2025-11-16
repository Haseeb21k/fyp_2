import React, { useEffect, useState } from "react";
import API from "../api";
import { FaArrowUp, FaArrowDown, FaDollarSign, FaCreditCard } from "react-icons/fa";

export default function SummaryCards({ onLoaded }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    API.get("/unified_summary")
      .then((res) => {
        setSummary(res.data);
        if (onLoaded) onLoaded();
      })
      .catch((err) => {
        console.error(err);
        if (onLoaded) onLoaded();
      });
  }, [onLoaded]);

  if (!summary) return <p>Loading summary...</p>;

  return (
    <div className="row row-cols-1 row-cols-md-4 g-4 justify-content-center">
      <div className="col">
        <div className="card shadow-sm rounded-4 border-0 h-100">
          <div className="card-body text-center">
            <div className="mb-2"><FaArrowUp size={24} className="text-success" /></div>
            <h6 className="card-title text-muted">Total Income</h6>
            <div className="fs-3 fw-bold text-success">
              {Number(summary.total_fees_collected || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card shadow-sm rounded-4 border-0 h-100">
          <div className="card-body text-center">
            <div className="mb-2"><FaArrowDown size={24} className="text-danger" /></div>
            <h6 className="card-title text-muted">Total Expenses</h6>
            <div className="fs-3 fw-bold text-danger">
              {Number(summary.total_debit || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card shadow-sm rounded-4 border-0 h-100">
          <div className="card-body text-center">
            <div className="mb-2"><FaDollarSign size={24} className="text-primary" /></div>
            <h6 className="card-title text-muted">Net Balance</h6>
            <div className="fs-3 fw-bold text-primary">
              {Number(summary.latest_balance || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="card shadow-sm rounded-4 border-0 h-100">
          <div className="card-body text-center">
            <div className="mb-2"><FaCreditCard size={24} className="text-purple" style={{color: '#7c3aed'}} /></div>
            <h6 className="card-title text-muted">Total Transactions</h6>
            <div className="fs-3 fw-bold" style={{color: '#7c3aed'}}>
              {Number(summary.transaction_count || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
