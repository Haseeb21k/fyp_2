import React, { useState, useEffect } from 'react';
import API from './api';
import { Upload, ArrowRight, CheckCircle, AlertCircle, RefreshCw, Database, FileText } from 'lucide-react';
import UploadModal from './components/UploadModal';

export default function ReconciliationPage() {
    const [step, setStep] = useState(1);
    const [bankTransactions, setBankTransactions] = useState([]);
    const [ledgerTransactions, setLedgerTransactions] = useState([]);
    const [reconciliationResults, setReconciliationResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState(null); // 'bank' or 'ledger'

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bankRes, ledgerRes] = await Promise.all([
                API.get('/unified_transactions', { params: { page_size: 1000 } }),
                API.get('/org_transactions', { params: { page_size: 1000 } })
            ]);
            setBankTransactions(bankRes.data.items);
            setLedgerTransactions(ledgerRes.data.items);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setLoading(false);
        }
    };

    const runReconciliation = () => {
        let matches = [];
        let unmatchedBank = [...bankTransactions];
        let unmatchedLedger = [...ledgerTransactions];

        // Helper to mark matched
        const markMatched = (list, index) => {
            list[index] = { ...list[index], _matched: true };
        };

        unmatchedBank.forEach((bankTx, bIdx) => {
            if (bankTx._matched) return;

            // 1. Exact Match (Amount & Date)
            const matchIndex = unmatchedLedger.findIndex((lTx, lIdx) =>
                !lTx._matched &&
                Math.abs(lTx.amount) === Math.abs(bankTx.amount) &&
                lTx.date === bankTx.date
            );

            if (matchIndex !== -1) {
                matches.push({ status: 'match', details: 'Exact Match', bank: bankTx, ledger: unmatchedLedger[matchIndex] });
                markMatched(unmatchedLedger, matchIndex);
                markMatched(unmatchedBank, bIdx);
            } else {
                // 2. Fuzzy Match (Amount & Date within 2 days)
                const fuzzyIndex = unmatchedLedger.findIndex((lTx, lIdx) =>
                    !lTx._matched &&
                    Math.abs(lTx.amount) === Math.abs(bankTx.amount) &&
                    Math.abs(new Date(lTx.date) - new Date(bankTx.date)) < 172800000 // 48 hours
                );

                if (fuzzyIndex !== -1) {
                    matches.push({ status: 'fuzzy', details: 'Date Variance', bank: bankTx, ledger: unmatchedLedger[fuzzyIndex] });
                    markMatched(unmatchedLedger, fuzzyIndex);
                    markMatched(unmatchedBank, bIdx);
                } else {
                    // 3. Amount Tolerance (within $0.05)
                    const toleranceIndex = unmatchedLedger.findIndex((lTx, lIdx) =>
                        !lTx._matched &&
                        Math.abs(Math.abs(lTx.amount) - Math.abs(bankTx.amount)) < 0.05
                    );

                    if (toleranceIndex !== -1) {
                        matches.push({ status: 'review', details: 'Amount Mismatch', bank: bankTx, ledger: unmatchedLedger[toleranceIndex] });
                        markMatched(unmatchedLedger, toleranceIndex);
                        markMatched(unmatchedBank, bIdx);
                    } else {
                        matches.push({ status: 'unmatched', details: 'No Record Found', bank: bankTx, ledger: null });
                    }
                }
            }
        });

        unmatchedLedger.filter(l => !l._matched).forEach(lTx => {
            matches.push({ status: 'missing_bank', details: 'Missing in Bank', bank: null, ledger: lTx });
        });

        setReconciliationResults(matches);
        setStep(2);
    };

    const handleUploadClick = (type) => {
        setUploadType(type);
        setShowUploadModal(true);
    };

    const handleUploadComplete = () => {
        setShowUploadModal(false);
        fetchData();
    };

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700 flex items-center">
                            <Database className="w-4 h-4 mr-2 text-indigo-500" /> Bank Transactions
                        </h3>
                        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {bankTransactions.length} Records
                        </span>
                    </div>
                    <button
                        onClick={() => handleUploadClick('bank')}
                        className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center text-gray-500"
                    >
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Upload Bank Statement (CSV, MT940)</span>
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-700 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-green-500" /> Ledger / Organization
                        </h3>
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            {ledgerTransactions.length} Records
                        </span>
                    </div>
                    <button
                        onClick={() => handleUploadClick('ledger')}
                        className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center justify-center text-gray-500"
                    >
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Upload Ledger (CSV)</span>
                    </button>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={runReconciliation}
                    disabled={bankTransactions.length === 0 && ledgerTransactions.length === 0}
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className="mr-2 h-5 w-5" /> Run Reconciliation
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => {
        const sorted = [...reconciliationResults].sort((a, b) => {
            const priority = { 'unmatched': 1, 'review': 2, 'fuzzy': 3, 'missing_bank': 4, 'match': 5 };
            return priority[a.status] - priority[b.status];
        });

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Reconciliation Report</h2>
                    <button
                        onClick={() => setStep(1)}
                        className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        <RefreshCw className="w-4 h-4 mr-1" /> Start Over
                    </button>
                </div>

                <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank Transaction</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ledger Record</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {sorted.map((res, idx) => (
                                <tr key={idx} className={res.status === 'match' ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {res.status === 'match' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Matched</span>}
                                        {res.status === 'fuzzy' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Date Variance</span>}
                                        {res.status === 'review' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">Check Amount</span>}
                                        {res.status === 'unmatched' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Unmatched</span>}
                                        {res.status === 'missing_bank' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Missing in Bank</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {res.bank ? (
                                            <div>
                                                <div className="font-medium text-gray-900">{res.bank.description}</div>
                                                <div className="text-xs">{res.bank.date}</div>
                                                <div className={`font-bold ${res.bank.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    ${Math.abs(res.bank.amount).toFixed(2)}
                                                </div>
                                            </div>
                                        ) : <span className="text-gray-400">--</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {res.ledger ? (
                                            <div>
                                                <div className="font-medium text-gray-900">{res.ledger.description}</div>
                                                <div className="text-xs">{res.ledger.date}</div>
                                                <div className={`font-bold ${res.ledger.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    ${Math.abs(res.ledger.amount).toFixed(2)}
                                                </div>
                                            </div>
                                        ) : <span className="text-gray-400">--</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Reconciliation Tool</h2>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-500">Loading data...</div>
            ) : (
                step === 1 ? renderStep1() : renderStep2()
            )}

            <UploadModal
                title={uploadType === 'bank' ? "Upload Bank Files" : "Upload Ledger Files"}
                description={`Select files for ${uploadType === 'bank' ? 'bank' : 'ledger'} reconciliation.`}
                endpoint={uploadType === 'bank' ? "/unified_upload" : "/org_upload"}
                accept={uploadType === 'bank' ? ".csv,.txt,.mt940" : ".csv"}
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUploadComplete={handleUploadComplete}
            />
        </div>
    );
}
