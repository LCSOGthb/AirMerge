import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());

app.get('/api/owm/:type', async (req, res) => {
  const { lat, lon, start, end } = req.query as any;
  const t = req.params.type;
  const url = `https://api.openweathermap.org/data/2.5/${t==="history"?`air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}`: t==="forecast"?`air_pollution/forecast?lat=${lat}&lon=${lon}`:`air_pollution?lat=${lat}&lon=${lon}`}&appid=${process.env.OW_KEY}`;
  const r = await fetch(url);
  res.status(r.status).json(await r.json());
});

app.get('/api/aqicn', async (req, res) => {
  const { lat, lon } = req.query;
  const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${process.env.AQICN_TOKEN}`;
  const r = await fetch(url);
  res.status(r.status).json(await r.json());
});

app.get('/', (_req, res) => {
  res.send('Server is up and my proxy APIs are ready at /api/...');
});

app.listen(PORT, () => console.log(`Proxy running on ${PORT}`));