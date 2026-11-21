import React from "react";
import UserManagement from "./components/UserManagement";
import { Shield } from "lucide-react";

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium flex items-center">
            <Shield className="w-3 h-3 mr-1" /> Superuser Area
          </span>
        </div>
      </div>
      <UserManagement />
    </div>
  );
}
