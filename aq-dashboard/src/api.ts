import axios from 'axios';

// Base URL for your backend
const BACKEND = 'http://localhost:3001';

export const fetchOwm = (
  type: 'air_pollution' | 'forecast' | 'history',
  lat: number,
  lon: number,
  start?: number,
  end?: number
) => {
  return axios
    .get(`${BACKEND}/api/owm/${type}`, {
      params: { lat, lon, ...(start && { start }), ...(end && { end }) }
    })
    .then(res => res.data);
};

export const fetchAqicn = (lat: number, lon: number) => {
  return axios
    .get(`${BACKEND}/api/aqicn`, { params: { lat, lon } })
    .then(res => res.data);
};
