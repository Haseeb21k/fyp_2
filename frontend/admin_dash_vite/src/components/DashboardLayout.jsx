import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { label: "Bank Dashboard", to: "/dashboard" },
    { label: "Organization Dashboard", to: "/org-dashboard" },
  ];

  if (user?.is_superuser) {
    navItems.push({ label: "User Management", to: "/user-management" });
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <aside style={sidebarStyle}>
        <div className="mb-4">
          <h4 className="text-white fw-bold">Finance Portal</h4>
          <p className="text-white-50 mb-0" style={{ fontSize: 12 }}>
            Welcome{user?.email ? `, ${user.email}` : ""}
          </p>
        </div>
        <nav className="flex-grow-1 w-100">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`d-block text-decoration-none px-3 py-2 rounded-3 mb-2 ${
                  active ? "bg-white text-primary fw-semibold" : "text-white-50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button className="btn btn-outline-light w-100 mt-auto" onClick={logout}>
          Logout
        </button>
      </aside>
      <main className="flex-grow-1 bg-light">
        {children}
      </main>
    </div>
  );
}

const sidebarStyle = {
  width: "240px",
  background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
  color: "#fff",
  padding: "24px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

