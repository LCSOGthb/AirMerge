import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export default function ChartComp({ hist, fore }: { hist: any[], fore: any[] }) {
  const data = {
    labels: [...hist, ...fore].map(d => new Date(d.dt * 1000).toLocaleString()),
    datasets: [
      {
        label: 'Historical AQI',
        data: hist.map(d => d.aqi), borderColor: 'blue', tension: .4
      },
      {
        label: 'Forecast AQI',
        data: fore.map(d => d.aqi), borderColor: 'green', tension: .4
      }
    ]
  };
  return <Line data={data} />;
}
