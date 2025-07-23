// src/api.ts
import axios from 'axios';

/**
 * Fetch OpenWeatherMap air pollution data (current, forecast, history)
 * via your Vercel Serverless Functions under /api/owm/[type].
 */
export const fetchOwm = (
  type: 'air_pollution' | 'forecast' | 'history',
  lat: number,
  lon: number,
  start?: number,
  end?: number
) => {
  return axios
    .get(`/api/owm/${type}`, {
      params: { lat, lon, ...(start && { start }), ...(end && { end }) }
    })
    .then(res => res.data);
};

/**
 * Fetch AQICN data via your Serverless Function at /api/aqicn.
 */
export const fetchAqicn = (lat: number, lon: number) => {
  return axios
    .get(`/api/aqicn`, { params: { lat, lon } })
    .then(res => res.data);
};
