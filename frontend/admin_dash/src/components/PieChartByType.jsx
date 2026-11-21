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

  if (!data) return <div className="h-64 flex items-center justify-center text-gray-400">Loading...</div>;

  const labels = Object.keys(data);
  const values = Object.values(data);

  return (
    <div className="h-64 w-full">
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
  );
}