'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ChartComp from './ChartComp';
import './Dashboard.css';

const MapComp = dynamic(() => import('./MapComp'), { ssr: false });

type Pollutant = { dt: number | null; aqi: number | null };
type Coords = { lat: number; lon: number };

async function fetchAqicn(lat: number, lon: number) {
  const res = await fetch(`/api/aqicn?lat=${lat}&lon=${lon}`);
  return res.json();
}

export default function Dashboard() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aq, setAq] = useState<any>(null);
  const [histData, setHistData] = useState<Pollutant[]>([]);
  const [forecastData, setForecastData] = useState<Pollutant[]>([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude, longitude } }) => {
        setCoords({ lat: latitude, lon: longitude });
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: 'Permission Denied. Please allow location access in your browser settings.',
          2: 'Location Information is Unavailable.',
          3: 'The request to get your location timed out.',
        };
        setError(msgs[err.code] ?? 'An Unknown Error Occurred.');
      }
    );
  }, []);

  useEffect(() => {
    if (!coords) return;
    const { lat, lon } = coords;
    fetchAqicn(lat, lon)
      .then((data) => {
        if (!data?.data) {
          setError('Failed to load AQI data');
          setAq(null);
          return;
        }
        setAq(data);

        const dailyPm25 = data.data.forecast?.daily?.pm25 ?? [];
        setForecastData(
          dailyPm25
            .map((d: any) => ({
              dt: d.day ? new Date(d.day).getTime() / 1000 : null,
              aqi: d.avg ?? null,
            }))
            .filter((item: Pollutant) => item.dt !== null && item.aqi !== null)
        );

        const hourlyPm25 = data.data.forecast?.hourly?.pm25 ?? [];
        if (hourlyPm25.length > 0) {
          setHistData(
            hourlyPm25
              .map((d: any) => ({
                dt: d.time ? new Date(d.time).getTime() / 1000 : null,
                aqi: d.avg ?? null,
              }))
              .filter((item: Pollutant) => item.dt !== null && item.aqi !== null)
          );
        } else if (dailyPm25.length > 0) {
          const today = dailyPm25[0];
          setHistData([
            { dt: Date.now() / 1000 - 86400, aqi: today.avg ?? null },
            { dt: Date.now() / 1000, aqi: today.avg ?? null },
          ]);
        } else {
          setHistData([]);
        }
      })
      .catch(() => {
        setError('Failed to fetch AQI data');
        setAq(null);
      });
  }, [coords]);

  if (!coords) {
    return (
      <div className="dashboard prompt-state">
        <h1>AirMerge</h1>
        <p>{error || 'Waiting For Location\u2026'}</p>
        <button
          onClick={async () => {
            const input = window.prompt(
              'Enter location as "lat,lon" or Place Name (e.g. "Kuala Lumpur")'
            );
            if (!input) return;
            const parts = input.split(',').map((s) => s.trim());
            if (parts.length === 2 && !isNaN(+parts[0]) && !isNaN(+parts[1])) {
              setCoords({ lat: +parts[0], lon: +parts[1] });
              setError(null);
              return;
            }
            try {
              const resp = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=1`
              );
              const results = await resp.json();
              if (!results?.length) {
                setError('Location Not Found. Try Another Name.');
              } else {
                setCoords({ lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) });
                setError(null);
              }
            } catch {
              setError('Geocoding Failed. Please Try Again.');
            }
          }}
        >
          Enter Location Manually
        </button>
      </div>
    );
  }

  if (!aq) {
    return (
      <div className="dashboard">
        <h1>AirMerge</h1>
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading Air Quality\u2026</p>
        </div>
        <div className="skeleton-grid">
          <div className="skeleton-card">
            <div className="skeleton-line tall" />
            <div className="skeleton-line wide" />
            <div className="skeleton-line short" />
            <div className="skeleton-line wide" />
            <div className="skeleton-line short" />
          </div>
        </div>
      </div>
    );
  }

  const sources = [
    {
      title: 'AQICN',
      aqi: aq.data.aqi ?? 0,
      comps: Object.fromEntries(
        Object.entries(aq.data.iaqi ?? {}).map(([k, v]: any) => [k, v.v ?? 0])
      ),
      time: new Date(aq.data.time?.iso ?? Date.now()).toLocaleString(),
    },
  ];

  return (
    <div className="dashboard">
      <h1>AirMerge</h1>

      <div className="grid">
        {sources.map(({ title, aqi, comps, time }) => (
          <div key={title} className="card" style={{ borderLeft: `6px solid ${aqColor(aqi)}` }}>
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
        <ChartComp hist={histData} fore={forecastData} />
      </div>

      <h2>🗺️ Map Overlay</h2>
      <div className="map-container">
        <MapComp lat={coords.lat} lon={coords.lon} />
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
