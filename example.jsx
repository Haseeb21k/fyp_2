import React, { useState } from 'react';
import {
    Upload, ArrowRight, CheckCircle, AlertCircle, FileText,
    RefreshCw, Database, Settings, Search, Users, Shield,
    LogOut, Lock, Trash2, Plus
} from 'lucide-react';

// --- MOCK DATA & CONSTANTS ---

const INTERNAL_LEDGER = [
    { id: 'L001', date: '2023-10-01', description: 'Payment to Vendor A', amount: -1200.00, status: 'pending' },
    { id: 'L002', date: '2023-10-02', description: 'Client Deposit X', amount: 5000.00, status: 'pending' },
    { id: 'L003', date: '2023-10-03', description: 'Monthly Software Sub', amount: -50.00, status: 'pending' },
    { id: 'L004', date: '2023-10-05', description: 'Utility Bill', amount: -230.50, status: 'pending' },
    { id: 'L005', date: '2023-10-05', description: 'Consulting Fee', amount: 1500.00, status: 'pending' },
];

const MOCK_FILES = {
    csv_format_a: {
        name: "Chase_Export_Oct.csv",
        type: "csv",
        headers: ["Post Date", "Details", "Type", "Amount", "Balance"],
        data: [
            ["10/01/2023", "ACH Pmt: Vendor A", "Debit", "1200.00", "98800.00"],
            ["10/02/2023", "Wire Transfer: Client X", "Credit", "5000.00", "103800.00"],
            ["10/05/2023", "Electric Co Bill", "Debit", "230.50", "103569.50"],
        ]
    },
    excel_format_b: {
        name: "WellsFargo_Statement.xlsx",
        type: "excel",
        headers: ["TxnID", "ValDate", "Amt", "Desc", "Code"],
        data: [
            ["WF998", "2023-10-03", "-50.00", "SaaS Subscription", "ACH"],
            ["WF999", "2023-10-06", "1450.00", "Conslt Fee (Partial)", "WIRE"],
        ]
    }
};

// --- AUTH & USER MOCK DATA ---
const INITIAL_USERS = [
    { id: 1, name: 'Diana Prince', email: 'admin@company.com', role: 'superuser', status: 'active' },
    { id: 2, name: 'Clark Kent', email: 'accountant@company.com', role: 'standard', status: 'active' },
    { id: 3, name: 'Barry Allen', email: 'intern@company.com', role: 'viewer', status: 'inactive' },
];

// --- HELPER FUNCTIONS ---

const guessMapping = (headers) => {
    const mapping = { date: '', description: '', amount: '' };
    headers.forEach(header => {
        const h = header.toLowerCase();
        if (h.includes('date') || h.includes('time')) mapping.date = header;
        else if (h.includes('desc') || h.includes('detail') || h.includes('narration')) mapping.description = header;
        else if (h.includes('amt') || h.includes('amount') || h.includes('debit') || h.includes('credit')) mapping.amount = header;
    });
    return mapping;
};

const normalizeData = (rawData, mapping, fileId) => {
    return rawData.map((row, index) => {
        const headers = MOCK_FILES[fileId].headers;
        const dateIdx = headers.indexOf(mapping.date);
        const descIdx = headers.indexOf(mapping.description);
        const amtIdx = headers.indexOf(mapping.amount);

        let rawDate = row[dateIdx];
        let dateObj = new Date(rawDate);
        if (isNaN(dateObj.getTime())) dateObj = new Date();
        const cleanDate = dateObj.toISOString().split('T')[0];

        let rawAmt = row[amtIdx];
        let cleanAmt = parseFloat(String(rawAmt).replace(/[^0-9.-]/g, ''));

        if (fileId === 'csv_format_a') {
            const typeIdx = headers.indexOf('Type');
            if (row[typeIdx] === 'Debit' && cleanAmt > 0) cleanAmt = -cleanAmt;
        }

        return {
            id: `EXT-${fileId}-${index}`,
            source: MOCK_FILES[fileId].name,
            date: cleanDate,
            description: row[descIdx],
            amount: cleanAmt,
            matched: false
        };
    });
};

export default function ReconciliationApp() {
    // --- STATE ---
    // Auth State
    const [currentUser, setCurrentUser] = useState(null); // null = logged out
    const [users, setUsers] = useState(INITIAL_USERS);
    const [activeView, setActiveView] = useState('dashboard'); // dashboard, users, reconcile

    // App State
    const [step, setStep] = useState(1);
    const [selectedFileKey, setSelectedFileKey] = useState(null);
    const [currentMapping, setCurrentMapping] = useState({ date: '', description: '', amount: '' });
    const [normalizedTransactions, setNormalizedTransactions] = useState([]);
    const [ledger, setLedger] = useState(INTERNAL_LEDGER);
    const [reconciliationResults, setReconciliationResults] = useState([]);
    const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'standard' });

    // --- AUTH ACTIONS ---
    const login = (email) => {
        const user = users.find(u => u.email === email);
        if (user) {
            setCurrentUser(user);
            setActiveView('dashboard');
        }
    };

    const logout = () => {
        setCurrentUser(null);
        setStep(1);
        setNormalizedTransactions([]);
        setReconciliationResults([]);
    };

    const addUser = () => {
        const newId = Math.max(...users.map(u => u.id)) + 1;
        setUsers([...users, { ...newUserForm, id: newId, status: 'active' }]);
        setNewUserForm({ name: '', email: '', role: 'standard' });
    };

    const deleteUser = (id) => {
        setUsers(users.filter(u => u.id !== id));
    };

    const toggleUserStatus = (id) => {
        setUsers(users.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
    };

    // --- APP ACTIONS ---
    const handleSelectFile = (key) => {
        setSelectedFileKey(key);
        const file = MOCK_FILES[key];
        setCurrentMapping(guessMapping(file.headers));
        setStep(2);
    };

    const handleProcessFile = () => {
        const file = MOCK_FILES[selectedFileKey];
        const newData = normalizeData(file.data, currentMapping, selectedFileKey);
        setNormalizedTransactions(prev => [...prev, ...newData]);
        setStep(1);
        setSelectedFileKey(null);
    };

    const runReconciliation = () => {
        let matches = [];
        let unmatchedBank = [...normalizedTransactions];
        let unmatchedLedger = [...ledger];

        unmatchedBank.forEach(bankTx => {
            const matchIndex = unmatchedLedger.findIndex(lTx =>
                lTx.amount === bankTx.amount &&
                lTx.date === bankTx.date &&
                !lTx.matched
            );

            if (matchIndex !== -1) {
                const ledgerTx = unmatchedLedger[matchIndex];
                matches.push({ status: 'match', details: 'Exact Match', bank: bankTx, ledger: ledgerTx });
                unmatchedLedger[matchIndex] = { ...ledgerTx, matched: true };
                bankTx.matched = true;
            } else {
                const fuzzyIndex = unmatchedLedger.findIndex(lTx =>
                    lTx.amount === bankTx.amount &&
                    !lTx.matched &&
                    Math.abs(new Date(lTx.date) - new Date(bankTx.date)) < 172800000
                );

                if (fuzzyIndex !== -1) {
                    const ledgerTx = unmatchedLedger[fuzzyIndex];
                    matches.push({ status: 'fuzzy', details: 'Date Variance', bank: bankTx, ledger: ledgerTx });
                    unmatchedLedger[fuzzyIndex] = { ...ledgerTx, matched: true };
                    bankTx.matched = true;
                } else {
                    const toleranceIndex = unmatchedLedger.findIndex(lTx =>
                        Math.abs(lTx.amount - bankTx.amount) < 100 && !lTx.matched
                    );
                    if (toleranceIndex !== -1) {
                        const ledgerTx = unmatchedLedger[toleranceIndex];
                        matches.push({ status: 'review', details: 'Amount Mismatch', bank: bankTx, ledger: ledgerTx });
                        unmatchedLedger[toleranceIndex] = { ...ledgerTx, matched: true };
                        bankTx.matched = true;
                    } else {
                        matches.push({ status: 'unmatched', details: 'No Record Found', bank: bankTx, ledger: null });
                    }
                }
            }
        });

        unmatchedLedger.filter(l => !l.matched).forEach(lTx => {
            matches.push({ status: 'missing_bank', details: 'Missing in Bank', bank: null, ledger: lTx });
        });

        setReconciliationResults(matches);
        setStep(4);
    };

    // --- RENDERERS ---

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-indigo-900 p-8 text-center">
                        <Database className="h-12 w-12 text-indigo-300 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-white">AutoReconcile</h1>
                        <p className="text-indigo-200 mt-2">Secure Financial Operations Platform</p>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="text-center text-sm text-gray-500 mb-6">
                            Select a role to simulate login:
                        </div>
                        <button
                            onClick={() => login('admin@company.com')}
                            className="w-full flex items-center justify-center p-4 border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors group"
                        >
                            <div className="bg-indigo-100 p-2 rounded-full mr-4 group-hover:bg-indigo-200">
                                <Shield className="h-6 w-6 text-indigo-700" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-gray-900">Diana Prince</div>
                                <div className="text-xs text-gray-500">Superuser (Full Access)</div>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-indigo-500" />
                        </button>

                        <button
                            onClick={() => login('accountant@company.com')}
                            className="w-full flex items-center justify-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                            <div className="bg-gray-100 p-2 rounded-full mr-4 group-hover:bg-gray-200">
                                <Users className="h-6 w-6 text-gray-600" />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-gray-900">Clark Kent</div>
                                <div className="text-xs text-gray-500">Accountant (Tool Only)</div>
                            </div>
                            <ArrowRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const Sidebar = () => (
        <div className="w-64 bg-indigo-900 text-white flex flex-col h-screen fixed left-0 top-0">
            <div className="p-6 border-b border-indigo-800">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <Database className="h-6 w-6 text-indigo-300" />
                    AutoRec
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <button
                    onClick={() => setActiveView('dashboard')}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeView === 'dashboard' ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
                >
                    <RefreshCw className="w-5 h-5 mr-3" />
                    Dashboard
                </button>

                {currentUser.role === 'superuser' && (
                    <button
                        onClick={() => setActiveView('users')}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeView === 'users' ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
                    >
                        <Users className="w-5 h-5 mr-3" />
                        User Management
                    </button>
                )}

                <button
                    onClick={() => setActiveView('reconcile')}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${activeView === 'reconcile' ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:bg-indigo-800'}`}
                >
                    <FileText className="w-5 h-5 mr-3" />
                    Reconciliation Tool
                </button>
            </nav>

            <div className="p-4 border-t border-indigo-800">
                <div className="flex items-center mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">
                        {currentUser.name.charAt(0)}
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-medium">{currentUser.name}</div>
                        <div className="text-xs text-indigo-300 capitalize">{currentUser.role}</div>
                    </div>
                </div>
                <button onClick={logout} className="flex items-center text-sm text-red-300 hover:text-white w-full">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </button>
            </div>
        </div>
    );

    const UserManagement = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium flex items-center">
                        <Shield className="w-3 h-3 mr-1" /> Superuser Area
                    </span>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Add New User</h3>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Full Name"
                        className="flex-1 border rounded-lg px-4 py-2 text-sm"
                        value={newUserForm.name}
                        onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="flex-1 border rounded-lg px-4 py-2 text-sm"
                        value={newUserForm.email}
                        onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    />
                    <select
                        className="border rounded-lg px-4 py-2 text-sm bg-white"
                        value={newUserForm.role}
                        onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })}
                    >
                        <option value="standard">Standard User</option>
                        <option value="superuser">Superuser</option>
                        <option value="viewer">Viewer</option>
                    </select>
                    <button
                        onClick={addUser}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center text-sm hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'superuser' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button onClick={() => toggleUserStatus(user.id)} className={`text-xs font-medium ${user.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                                        {user.status === 'active' ? 'Active' : 'Suspended'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {user.id !== currentUser.id && (
                                        <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const ReconcileTool = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Reconciliation Tool</h2>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md text-xs">
                    Ledger: {INTERNAL_LEDGER.length} Records
                </div>
            </div>

            {/* Original Tool Content */}
            {step === 1 && renderStep1_Upload()}
            {step === 2 && renderStep2_Map()}
            {step === 4 && renderStep4_Results()}
        </div>
    );

    // Helper renderers for original tool (Condensed for brevity in this update, functionality preserved)
    const renderStep1_Upload = () => (
        <div className="space-y-6">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Import Bank Statement</h3>
                <p className="mt-1 text-sm text-gray-500">Support for CSV, Excel, MT940</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(MOCK_FILES).map(key => (
                    <button key={key} onClick={() => handleSelectFile(key)} className="flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded text-green-600 font-bold text-xs uppercase">{MOCK_FILES[key].type}</div>
                            <div className="text-left"><div className="font-medium text-gray-900">{MOCK_FILES[key].name}</div></div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                    </button>
                ))}
            </div>
            {normalizedTransactions.length > 0 && (
                <div className="flex justify-end mt-8">
                    <button onClick={runReconciliation} className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg">
                        <Database className="mr-2 h-5 w-5" /> Reconcile {normalizedTransactions.length} Transactions
                    </button>
                </div>
            )}
        </div>
    );

    const renderStep2_Map = () => {
        const file = MOCK_FILES[selectedFileKey];
        return (
            <div className="space-y-6 bg-white p-6 rounded-xl border">
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-lg font-semibold">Map Columns: {file.name}</h2>
                    <button onClick={() => setStep(1)} className="text-sm text-gray-500">Cancel</button>
                </div>
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-sm text-yellow-800 mb-4 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" /> Verify column mapping
                </div>
                <div className="grid grid-cols-3 gap-6">
                    {['date', 'description', 'amount'].map(field => (
                        <div key={field} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 capitalize">{field}</label>
                            <select
                                value={currentMapping[field]}
                                onChange={(e) => setCurrentMapping({ ...currentMapping, [field]: e.target.value })}
                                className="block w-full p-2 text-base border-gray-300 rounded-md border"
                            >
                                <option value="">Select Column...</option>
                                {file.headers.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end pt-4">
                    <button onClick={handleProcessFile} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Confirm & Import</button>
                </div>
            </div>
        );
    };

    const renderStep4_Results = () => {
        const sorted = [...reconciliationResults].sort((a, b) => {
            const priority = { 'unmatched': 1, 'review': 2, 'fuzzy': 3, 'missing_bank': 4, 'match': 5 };
            return priority[a.status] - priority[b.status];
        });

        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800">Report</h2>
                    <button onClick={() => { setStep(1); setNormalizedTransactions([]); setReconciliationResults([]); setLedger(INTERNAL_LEDGER); }} className="flex items-center text-sm text-indigo-600 hover:text-indigo-800">
                        <RefreshCw className="w-4 h-4 mr-1" /> Start Over
                    </button>
                </div>
                <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ledger</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
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
                                        {res.ledger ? <div><div className="font-medium text-gray-900">{res.ledger.description}</div><div>${Math.abs(res.ledger.amount).toFixed(2)}</div></div> : '--'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {res.bank ? <div><div className="font-medium text-gray-900">{res.bank.description}</div><div>${Math.abs(res.bank.amount).toFixed(2)}</div></div> : '--'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const Dashboard = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">System Status</h3>
                    <span className="text-green-500 flex items-center text-xs font-bold"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div> ONLINE</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">Active</div>
                <p className="text-sm text-gray-500 mt-1">Reconciliation Engine Ready</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">Users</h3>
                    <Users className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{users.filter(u => u.status === 'active').length}</div>
                <p className="text-sm text-gray-500 mt-1">Active Accounts</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700">Pending Items</h3>
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{INTERNAL_LEDGER.length}</div>
                <p className="text-sm text-gray-500 mt-1">Ledger Transactions</p>
            </div>

            {/* Welcome Widget */}
            <div className="md:col-span-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">Welcome back, {currentUser.name}</h2>
                <p className="opacity-90 mb-6">You are logged in as <span className="font-bold uppercase bg-white/20 px-2 py-0.5 rounded text-xs">{currentUser.role}</span>. Access your tools below.</p>
                <div className="flex gap-4">
                    <button onClick={() => setActiveView('reconcile')} className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-indigo-50 transition-colors">
                        Open Reconciliation Tool
                    </button>
                    {currentUser.role === 'superuser' && (
                        <button onClick={() => setActiveView('users')} className="bg-indigo-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-900 transition-colors border border-indigo-400">
                            Manage Users
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {activeView === 'dashboard' && <Dashboard />}
                {activeView === 'users' && currentUser.role === 'superuser' && <UserManagement />}
                {activeView === 'users' && currentUser.role !== 'superuser' && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Lock className="w-12 h-12 mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium">Access Denied</h3>
                        <p>You do not have permission to view this page.</p>
                    </div>
                )}
                {activeView === 'reconcile' && <ReconcileTool />}
            </main>
        </div>
    );
}