import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Database, RefreshCw, Users, FileText, LogOut,
    Shield, Menu, X
} from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const NavItem = ({ to, icon: Icon, label }) => (
        <Link
            to={to}
            onClick={() => setIsMobileMenuOpen(false)}
            className={`w-full flex items-center p-3 rounded-lg transition-colors ${isActive(to)
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-200 hover:bg-indigo-800'
                }`}
        >
            <Icon className="w-5 h-5 mr-3" />
            {label}
        </Link>
    );

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Mobile Menu Button */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-900 text-white rounded-md"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar */}
            <div className={`
                w-64 bg-indigo-900 text-white flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-300
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-6 border-b border-indigo-800">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <Database className="h-6 w-6 text-indigo-300" />
                        AutoRec
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <NavItem to="/dashboard" icon={RefreshCw} label="Dashboard" />

                    {/* Show User Management only for superusers */}
                    {user?.role === 'superuser' && (
                        <NavItem to="/user-management" icon={Users} label="User Management" />
                    )}

                    {/* Link to the Reconciliation/Org Dashboard */}
                    <NavItem to="/org-dashboard" icon={FileText} label="Reconciliation Tool" />
                </nav>

                <div className="p-4 border-t border-indigo-800">
                    <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="ml-3 overflow-hidden">
                            <div className="text-sm font-medium truncate">{user?.email}</div>
                            <div className="text-xs text-indigo-300 capitalize">{user?.role || 'User'}</div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-sm text-red-300 hover:text-white w-full transition-colors"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8 transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
