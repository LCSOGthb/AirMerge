"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function ChartComp({
  hist,
  fore,
}: {
  hist: any[];
  fore: any[];
}) {
  const boundary = hist.length > 0 ? hist.length - 1 : 0;
  const data = {
    labels: [...hist, ...fore].map((d) =>
      new Date(d.dt * 1000).toLocaleString(),
    ),
    datasets: [
      {
        label: "Historical AQI",
        data: hist.map((d) => d.aqi),
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        spanGaps: false,
      },
      {
        label: "Forecast AQI",
        data: [
          ...Array(boundary).fill(null),
          ...fore.map((d) => d.aqi),
        ],
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 2,
        spanGaps: false,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      x: {
        ticks: { autoSkip: true, maxTicksLimit: 8 },
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: "AQI" },
      },
    },
  };
  return <Line data={data} options={options} />;
}
