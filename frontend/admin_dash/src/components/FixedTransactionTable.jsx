import React, { useEffect, useState } from "react";
import API from "../api";

export default function FixedTransactionTable({ onLoaded }) {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const rowsPerPage = 20;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get("/transactions", { params: { page: currentPage, page_size: rowsPerPage } })
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
    return <p>No MT940 transactions found.</p>;
  }

  // Pagination logic
  const totalPages = Math.ceil(total / rowsPerPage);

  return (
    <div>
      <h2 className="mb-3">MT940 Transactions</h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Value Date</th>
              <th>Entry Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td>{txn.id}</td>
                <td>{txn.value_date}</td>
                <td>{txn.entry_date}</td>
                <td>{txn.type}</td>
                <td>{txn.amount}</td>
                <td>{txn.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-2">
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
} 