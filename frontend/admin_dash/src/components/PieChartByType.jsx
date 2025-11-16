import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import API from "../api";
Chart.register(ArcElement, Tooltip, Legend);

export default function PieChartByType({ onLoaded }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/unified_pie_type").then(res => {
      setData(res.data);
      if (onLoaded) onLoaded();
    }).catch(() => {
      if (onLoaded) onLoaded();
    });
  }, [onLoaded]);

  if (!data) return <p>Loading pie chart...</p>;
  const labels = Object.keys(data);
  const values = Object.values(data);
  return (
    <div className="card shadow-sm rounded-4 p-4 mb-4 h-100">
      <h5 className="fw-bold mb-3">Expenses by Category</h5>
      <div className="d-flex justify-content-center align-items-center" style={{height: 300}}>
        <Pie
          data={{
            labels,
            datasets: [
              {
                data: values,
                backgroundColor: [
                  "#36A2EB",
                  "#FF6384",
                  "#FFCE56",
                  "#4BC0C0",
                  "#9966FF",
                  "#FF9F40"
                ],
              },
            ],
          }}
          options={{
            plugins: {
              legend: { position: 'right' },
            },
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
} 