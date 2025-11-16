import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import API from "../api";

const TransactionTable = forwardRef(({ onLoaded }, ref) => {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const rowsPerPage = 20;
  const [loading, setLoading] = useState(false);
  const [edited, setEdited] = useState({}); // key: row index -> edited row
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSave = async () => {
    try {
      const payload = Object.keys(edited).map(k => edited[k]);
      if (payload.length > 0) {
        setSaving(true);
        await API.post('/unified_transactions/save', payload);
        setEdited({});
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1500);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      alert('Failed to save edits');
      return false;
    }
    finally {
      setSaving(false);
    }
  };

  useImperativeHandle(ref, () => ({
    save: handleSave
  }));

  useEffect(() => {
    setLoading(true);
    API.get("/unified_transactions", { params: { page: currentPage, page_size: rowsPerPage } })
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
    return <p>No transactions found.</p>;
  }

  // Only include columns that have at least one non-empty value
  const allColumns = Object.keys(transactions[0]);
  const nonEmptyColumns = allColumns.filter(col =>
    transactions.some(row => row[col] !== undefined && row[col] !== null && String(row[col]).trim() !== "")
  );

  // Pagination logic
  const totalPages = Math.ceil(total / rowsPerPage);

  const handleCellChange = (rowIdx, col, value) => {
    setEdited(prev => {
      const next = { ...prev };
      const baseRow = transactions[rowIdx] || {};
      next[rowIdx] = { ...baseRow, ...(next[rowIdx] || {}), [col]: value };
      return next;
    });
  };

  const renderCell = (rowIdx, col) => {
    const isId = col === 'id';
    const row = transactions[rowIdx];
    const val = (edited[rowIdx]?.[col] ?? row[col]) ?? '';
    if (isId) return String(val);
    const isAmount = col === 'amount';
    const inputProps = isAmount ? { type: 'number', step: '0.01', inputMode: 'decimal' } : { type: 'text' };
    return (
      <input
        {...inputProps}
        className="form-control form-control-sm border-0 bg-transparent p-0"
        style={{ borderBottom: '1px dashed #dee2e6', borderRadius: 0 }}
        value={val}
        onChange={(e) => handleCellChange(rowIdx, col, e.target.value)}
      />
    );
  };

  const handleSaveAndNext = async () => {
    try {
      const payload = Object.keys(edited).map(k => edited[k]);
      if (payload.length > 0) {
        setSaving(true);
        await API.post('/unified_transactions/save', payload);
        setEdited({});
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1500);
      }
      setCurrentPage(p => Math.min(totalPages, p + 1));
    } catch (e) {
      console.error(e);
      alert('Failed to save edits');
    }
    finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <h2 className="mb-0">Transactions</h2>
        {justSaved && <span className="badge bg-success ms-3">Saved</span>}
      </div>
      <div className="card shadow-sm rounded-4">
        <div className="table-responsive" style={{ maxHeight: 520 }}>
          <table className="table table-hover table-sm align-middle mb-0">
            <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              {nonEmptyColumns.map((col) => (
                <th key={col}>{col}</th>
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
      <div className="d-flex justify-content-center mt-3 mb-3">
        <button 
          className="btn btn-success" 
          onClick={handleSave} 
          disabled={saving || Object.keys(edited).length === 0}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div className="d-flex justify-content-between align-items-center mt-2">
        <button className="btn btn-secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button className="btn btn-primary" onClick={handleSaveAndNext} disabled={saving || (currentPage === totalPages && Object.keys(edited).length === 0)}>
          {saving ? 'Saving...' : 'Next'}
        </button>
      </div>
    </div>
  );
});

export default TransactionTable;
