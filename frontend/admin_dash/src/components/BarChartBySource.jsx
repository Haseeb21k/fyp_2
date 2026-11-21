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

  if (!data) return <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>;

  const labels = Object.keys(data);
  const values = Object.values(data);

  return (
    <div className="h-64 w-full">
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
  );
}