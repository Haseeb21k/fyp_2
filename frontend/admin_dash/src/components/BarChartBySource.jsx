import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import API from "../api";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BarChartBySource({ onLoaded }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/unified_bar_source").then(res => {
      setData(res.data);
      if (onLoaded) onLoaded();
    }).catch(() => {
      if (onLoaded) onLoaded();
    });
  }, [onLoaded]);

  if (!data) return <p>Loading bar plot...</p>;
  const labels = Object.keys(data);
  const values = Object.values(data);
  return (
    <div className="card shadow-sm rounded-4 p-4 mb-4 h-100">
      <h5 className="fw-bold mb-3">Total Amount by Source File</h5>
      <div className="d-flex justify-content-center align-items-center" style={{height: 300}}>
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Total Amount",
                data: values,
                backgroundColor: "#36A2EB",
              },
            ],
          }}
          options={{
            indexAxis: 'y',
            responsive: true,
            plugins: {
              legend: { display: false },
            },
            maintainAspectRatio: false,
          }}
        />
      </div>
    </div>
  );
} 