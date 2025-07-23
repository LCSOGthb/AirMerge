// src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { fetchOwm, fetchAqicn } from '../api';
import ChartComp from './ChartComp';
import MapComp from './MapComp';
import './Dashboard.css';

type Pollutant = { dt: number; aqi: number };

export default function Dashboard() {
  const [owmCurr, setOwmCurr] = useState<any>(null);
  const [owmF, setOwmF] = useState<Pollutant[]>([]);
  const [owmH, setOwmH] = useState<Pollutant[]>([]);
  const [aq, setAq] = useState<any>(null);

  useEffect(() => {
    const lat = 3.0738, lon = 101.5183;
    fetchOwm('air_pollution', lat, lon).then(setOwmCurr);
    fetchOwm('forecast', lat, lon).then(r =>
      setOwmF(r.list.map((d: any) => ({ dt: d.dt, aqi: d.main.aqi * 50 })))
    );
    const now = Math.floor(Date.now() / 1000);
    fetchOwm('history', lat, lon, now - 86400, now).then(r =>
      setOwmH(r.list.map((d: any) => ({ dt: d.dt, aqi: d.main.aqi * 50 })))
    );
    fetchAqicn(lat, lon).then(setAq);
  }, []);

  if (!owmCurr || !aq) return <div className="dashboard">Loading…</div>;

  const sources = [
    {
      title: 'OpenWeatherMap',
      aqi: owmCurr.list[0].main.aqi * 50,
      comps: owmCurr.list[0].components,
      time: new Date(owmCurr.list[0].dt * 1000).toLocaleString(),
    },
    {
      title: 'AQICN',
      aqi: aq.data.aqi,
      comps: Object.fromEntries(
        Object.entries(aq.data.iaqi).map(([k, v]: any) => [k, v.v])
      ),
      time: new Date(aq.data.time.iso).toLocaleString(),
    },
  ];

  return (
    <div className="dashboard">
      <h1>Air Quality Dashboard</h1>

      <div className="grid">
        {sources.map(({ title, aqi, comps, time }) => (
          <div
            key={title}
            className="card"
            style={{ borderLeft: `6px solid ${aqColor(aqi)}` }}
          >
            <h2>{title}</h2>
            <p className="aqi">AQI: {aqi}</p>
            <p>Time: {time}</p>
            <ul className="components">
              {Object.entries(comps).map(([pollutant, value]) => (
                <li key={pollutant}>
                  <span>{pollutant.toUpperCase()}</span>
                  <span>{(value as number).toFixed(1)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2>📊 Historical (24h) & Forecast (4d)</h2>
      <div className="chart-container">
        <ChartComp hist={owmH} fore={owmF} />
      </div>

      <h2>🗺️ Map Overlay</h2>
      <div className="map-container">
        <MapComp lat={3.0738} lon={101.5183} />
      </div>
    </div>
  );
}

function aqColor(aqi: number) {
  if (aqi <= 50) return '#009966';
  if (aqi <= 100) return '#ffde33';
  if (aqi <= 150) return '#ff9933';
  if (aqi <= 200) return '#cc0033';
  if (aqi <= 300) return '#660099';
  return '#7e0023';
}
