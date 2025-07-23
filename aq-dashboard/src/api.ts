import axios from 'axios';

export const fetchOwm = (type: 'air_pollution' | 'forecast' | 'history', lat: number, lon: number, start?: number, end?: number) =>
  axios.get(`/api/owm/${type}`, { params: { lat, lon, ...(start && { start }), ...(end && { end }) } })
       .then(r => r.data);

export const fetchAqicn = (lat: number, lon: number) =>
  axios.get('/api/aqicn', { params: { lat, lon } }).then(r => r.data);       