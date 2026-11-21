import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import API from "../api";
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function OrganizationBarChart({ onLoaded }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/org_bar_source").then(res => {
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
    <div className="card shadow-sm rounded-4 p-4 mb-4 h-100" style={{ border: '2px solid #6c5ce7' }}>
      <h5 className="fw-bold mb-3" style={{ color: '#6c5ce7' }}>Total Amount by Source File</h5>
      <div className="d-flex justify-content-center align-items-center" style={{height: 300}}>
        <Bar
          data={{
            labels,
            datasets: [
              {
                label: "Total Amount",
                data: values,
                backgroundColor: "#6c5ce7",
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

