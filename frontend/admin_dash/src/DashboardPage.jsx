import React, { useState, useCallback } from "react";
import { useAuth } from "./contexts/AuthContext";
import SummaryCards from "./components/SummaryCards";
import TransactionTable from "./components/TransactionTable";
import FixedTransactionTable from "./components/FixedTransactionTable";
import PieChartByType from "./components/PieChartByType";
import BarChartBySource from "./components/BarChartBySource";
import UploadModal from "./components/UploadModal";
import { Upload, Plus, Activity } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [view] = useState("csv"); // Default view
  const [showBankUploadModal, setShowBankUploadModal] = useState(false);

  // Track loading state
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

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.email?.split('@')[0] || 'User'}</h2>
            <p className="opacity-90">
              You are logged in as <span className="font-bold uppercase bg-white/20 px-2 py-0.5 rounded text-xs">{user?.role || 'User'}</span>.
              Here is your financial overview.
            </p>
          </div>
          {user?.is_superuser && (
            <button
              onClick={() => setShowBankUploadModal(true)}
              className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-indigo-50 transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" /> Upload Bank Files
            </button>
          )}
        </div>
      </div>

      {/* Summary Widgets */}
      <SummaryCards onLoaded={handleSummaryLoaded} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-indigo-500" /> Transaction Distribution
          </h3>
          <PieChartByType onLoaded={handlePieLoaded} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-indigo-500" /> Volume by Source
          </h3>
          <BarChartBySource onLoaded={handleBarLoaded} />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">Recent Transactions</h3>
        </div>
        <div className="p-6">
          {view === "csv" ? (
            <TransactionTable onLoaded={handleTableLoaded} />
          ) : (
            <FixedTransactionTable onLoaded={handleTableLoaded} />
          )}
        </div>
      </div>

      <UploadModal
        title="Upload Bank Files"
        description="Select CSV or MT940 files for the bank dashboard."
        endpoint="/unified_upload"
        accept=".csv,.txt,.mt940"
        isOpen={showBankUploadModal}
        onClose={() => setShowBankUploadModal(false)}
      />
    </div>
  );
}