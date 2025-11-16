import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import API from "../api";

const OrganizationTransactionTable = forwardRef(({ onLoaded }, ref) => {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const rowsPerPage = 20;
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    save: async () => true  // No-op since editing is disabled
  }));

  useEffect(() => {
    setLoading(true);
    API.get("/org_transactions", { params: { page: currentPage, page_size: rowsPerPage } })
      .then((res) => {
        setTransactions(res.data.items);
        setTotal(res.data.total);
        if (onLoaded) onLoaded();
      })
      .catch((err) => {
        console.error(err);
        if (onLoaded) onLoaded();
      })
      .finally(() => setLoading(false));
  }, [currentPage, onLoaded]);

  if (loading && transactions.length === 0) {
    return <p>Loading transactions...</p>;
  }
  if (transactions.length === 0) {
    return <p>No organization transactions found.</p>;
  }

  const allColumns = Object.keys(transactions[0]);
  const nonEmptyColumns = allColumns.filter(col =>
    transactions.some(row => row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== "")
  );

  const totalPages = Math.ceil(total / rowsPerPage);

  const renderCell = (rowIdx, col) => {
    const row = transactions[rowIdx];
    const val = row[col] ?? '';
    return String(val);
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0" style={{ color: '#6c5ce7' }}>Organization Transactions</h2>
      </div>
      <div className="card shadow-sm rounded-4" style={{ border: '2px solid #6c5ce7' }}>
        <div className="table-responsive" style={{ maxHeight: 520 }}>
          <table className="table table-hover table-sm align-middle mb-0">
            <thead style={{ backgroundColor: '#6c5ce7', color: 'white', position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              {nonEmptyColumns.map((col) => (
                <th key={col} style={{ color: 'white' }}>{col}</th>
              ))}
            </tr>
            </thead>
            <tbody>
              {transactions.map((txn, idx) => (
              <tr key={idx}>
                {nonEmptyColumns.map((col) => (
                  <td key={col}>{renderCell(idx, col)}</td>
                ))}
              </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <button className="btn btn-secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button className="btn btn-secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
});

export default OrganizationTransactionTable;
