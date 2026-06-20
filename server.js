const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const AQICN_TOKEN = process.env.AQICN_TOKEN;
const OW_KEY = process.env.OW_KEY;

app.get('/api/aqicn', async (req, res) => {
  try {
    if (!AQICN_TOKEN) {
      return res.status(500).json({ error: 'Missing AQICN_TOKEN environment variable' });
    }
    const rawLat = Array.isArray(req.query.lat) ? req.query.lat[0] : req.query.lat;
    const rawLon = Array.isArray(req.query.lon) ? req.query.lon[0] : req.query.lon;
    const lat = Number(rawLat);
    const lon = Number(rawLon);
    const isValidLat = Number.isFinite(lat) && lat >= -90 && lat <= 90;
    const isValidLon = Number.isFinite(lon) && lon >= -180 && lon <= 180;
    if (!isValidLat || !isValidLon) {
      return res.status(400).json({ error: 'Invalid lat/lon query parameters' });
    }
    const url = new URL(`https://api.waqi.info/feed/geo:${lat};${lon}/`);
    url.searchParams.set('token', AQICN_TOKEN);
    const apiRes = await fetch(url.toString());
    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (err) {
    console.error('AQICN handler error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/owm/:type', async (req, res) => {
  try {
    if (!OW_KEY) {
      return res.status(500).json({ error: 'Missing OW_KEY environment variable' });
    }
    const { type } = req.params;
    const { lat, lon, start, end } = req.query;
    let endpoint;
    if (type === 'history') {
      endpoint = `air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}`;
    } else if (type === 'forecast') {
      endpoint = `air_pollution/forecast?lat=${lat}&lon=${lon}`;
    } else {
      endpoint = `air_pollution?lat=${lat}&lon=${lon}`;
    }
    const url = `https://api.openweathermap.org/data/2.5/${endpoint}&appid=${OW_KEY}`;
    const apiRes = await fetch(url);
    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (err) {
    console.error('OWM error', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, 'localhost', () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
