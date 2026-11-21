import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react";
import API from "../api";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TransactionTable = forwardRef(({ onLoaded }, ref) => {
  const [transactions, setTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const rowsPerPage = 20;
  const [loading, setLoading] = useState(false);

  useImperativeHandle(ref, () => ({
    save: async () => true
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
    return <div className="p-4 text-center text-gray-500">Loading transactions...</div>;
  }
  if (transactions.length === 0) {
    return <div className="p-4 text-center text-gray-500">No transactions found.</div>;
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {nonEmptyColumns.map((col) => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((txn, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {nonEmptyColumns.map((col) => (
                  <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {renderCell(idx, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-700">
          Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default TransactionTable;
