import React, { useEffect, useState } from 'react';
import { fetchAqicn } from '../api';
import ChartComp from './ChartComp';
import MapComp from './MapComp';
import './Dashboard.css';

type Pollutant = { dt: number; aqi: number };
type Coords = { lat: number; lon: number };

export default function Dashboard() {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API data state
  const [aq, setAq] = useState<any>(null);
  const [histData, setHistData] = useState<Pollutant[]>([]);
  const [forecastData, setForecastData] = useState<Pollutant[]>([]);

  // Ask for GPS once on mount
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
        let msg: string;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = 'Permission Denied. Please allow location access in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'Location Information is Unavailable.';
            break;
          case err.TIMEOUT:
            msg = 'The request to get your location timed out.';
            break;
          default:
            msg = 'An Unknown Error Occurred.';
        }
        console.error('Geolocation Error', err.code, err.message);
        setError(msg);
      }
    );
  }, []);

  // Fetch AQICN data
  useEffect(() => {
    if (!coords) return;

    const { lat, lon } = coords;
    fetchAqicn(lat, lon)
      .then((data) => {
        if (!data?.data) {
          console.error('Invalid API response:', data);
          setError('Failed to load AQI data');
          setAq(null);
          return;
        }
        setAq(data);

        // Forecast (next 4 days)
        const dailyPm25 = data.data.forecast?.daily?.pm25 ?? [];
        setForecastData(
          dailyPm25.map((d: any) => ({
            dt: d.day ? new Date(d.day).getTime() / 1000 : null,
            aqi: d.avg ?? null,
          }))
        );

        // Historical (last 24h) or fallback
        const hourlyPm25 = data.data.forecast?.hourly?.pm25 ?? [];
        if (hourlyPm25.length > 0) {
          setHistData(
            hourlyPm25.map((d: any) => ({
              dt: d.time ? new Date(d.time).getTime() / 1000 : null,
              aqi: d.avg ?? null,
            }))
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
      .catch((err) => {
        console.error('Failed to fetch AQI:', err);
        setError('Failed to fetch AQI data');
        setAq(null);
      });
  }, [coords]);

  if (!coords) {
    return (
      <div className="dashboard">
        <p>{error || 'Waiting For Location…'}</p>
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
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                  input
                )}&format=json&limit=1`
              );
              const results = await resp.json();
              if (!results || results.length === 0) {
                setError('Location Not Found. Try Another Name.');
              } else {
                setCoords({
                  lat: parseFloat(results[0].lat),
                  lon: parseFloat(results[0].lon),
                });
                setError(null);
              }
            } catch (e: any) {
              console.error('Geocoding Error', e);
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
    return <div className="dashboard">Loading Air Quality…</div>;
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

      <h2>📊 Historical (24h) & Forecast (4d) — AQICN</h2>
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