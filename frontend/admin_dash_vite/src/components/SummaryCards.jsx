import React, { useEffect, useState } from "react";
import API from "../api";
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";

export default function SummaryCards({ onLoaded }) {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    API.get("/unified_summary")
      .then((res) => {
        setSummary(res.data);
        if (onLoaded) onLoaded();
      })
      .catch((err) => {
        console.error(err);
        if (onLoaded) onLoaded();
      });
  }, [onLoaded]);

  if (!summary) return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
    </div>
  );

  const Card = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">{title}</h3>
        <div className={`p-2 rounded-full ${bgClass}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
      </div>
      <div className={`text-2xl font-bold ${colorClass}`}>
        {value}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card
        title="Total Income"
        value={Number(summary.total_fees_collected || 0).toLocaleString()}
        icon={TrendingUp}
        colorClass="text-green-600"
        bgClass="bg-green-100"
      />
      <Card
        title="Total Expenses"
        value={Number(summary.total_debit || 0).toLocaleString()}
        icon={TrendingDown}
        colorClass="text-red-600"
        bgClass="bg-red-100"
      />
      <Card
        title="Net Balance"
        value={Number(summary.latest_balance || 0).toLocaleString()}
        icon={DollarSign}
        colorClass="text-blue-600"
        bgClass="bg-blue-100"
      />
      <Card
        title="Transactions"
        value={Number(summary.transaction_count || 0).toLocaleString()}
        icon={CreditCard}
        colorClass="text-purple-600"
        bgClass="bg-purple-100"
      />
    </div>
  );
}
