import React, { useEffect, useState } from 'react';
import { fetchOwm, fetchAqicn } from '../api';
import ChartComp from './ChartComp';
import MapComp from './MapComp';
import './Dashboard.css';

type Pollutant = { dt: number; aqi: number };
type Coords = { lat: number; lon: number };

export default function Dashboard() {
  // Geolocation & error state
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API data state
  const [owmCurr, setOwmCurr] = useState<any>(null);
  const [owmF, setOwmF] = useState<Pollutant[]>([]);
  const [owmH, setOwmH] = useState<Pollutant[]>([]);
  const [aq, setAq] = useState<any>(null);

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
            msg = 'Permission denied. Please allow location access in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            msg = 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            msg = 'The request to get your location timed out.';
            break;
          default:
            msg = 'An unknown error occurred.';
        }
        console.error('Geolocation error', err.code, err.message);
        setError(msg);
      }
    );
  }, []);

  // Fetch AQ data when we have coords
  useEffect(() => {
    if (!coords) return;
    const { lat, lon } = coords;
    const now = Math.floor(Date.now() / 1000);

    fetchOwm('air_pollution', lat, lon).then(setOwmCurr);
    fetchOwm('forecast', lat, lon).then(r =>
      setOwmF(r.list.map((d: any) => ({ dt: d.dt, aqi: d.main.aqi * 50 })))
    );
    fetchOwm('history', lat, lon, now - 86400, now).then(r =>
      setOwmH(r.list.map((d: any) => ({ dt: d.dt, aqi: d.main.aqi * 50 })))
    );
    fetchAqicn(lat, lon).then(setAq);
  }, [coords]);

  // Manual‑entry + waiting state
  if (!coords) {
    return (
      <div className="dashboard">
        <p>{error || 'Waiting for location…'}</p>
        <button
          onClick={async () => {
            const input = window.prompt(
              'Enter location as "lat,lon" or place name (e.g. "Banting, Selangor")'
            );
            if (!input) return;
            const parts = input.split(',').map(s => s.trim());
            // If two numbers: coords
            if (
              parts.length === 2 &&
              !isNaN(+parts[0]) &&
              !isNaN(+parts[1])
            ) {
              setCoords({ lat: +parts[0], lon: +parts[1] });
              setError(null);
              return;
            }
            // Else try geocoding via OpenStreetMap Nominatim
            try {
              const resp = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                  input
                )}&format=json&limit=1`
              );
              const results = await resp.json();
              if (results.length === 0) {
                setError('Location not found. Try another name.');
              } else {
                setCoords({
                  lat: parseFloat(results[0].lat),
                  lon: parseFloat(results[0].lon),
                });
                setError(null);
              }
            } catch (e: any) {
              console.error('Geocoding error', e);
              setError('Geocoding failed. Please try again.');
            }
          }}
        >
          Enter location manually
        </button>
      </div>
    );
  }

  // Loading state for API data
  if (!owmCurr || !aq) {
    return <div className="dashboard">Loading air quality…</div>;
  }

  // Prepare data sources
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
      <h1>AirMerge</h1>

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
