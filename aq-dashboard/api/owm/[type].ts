import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
dotenv.config();

const app = express();
const OW_KEY = process.env.OW_KEY!;
if (!OW_KEY) {
  throw new Error('Missing enviroment variable OW_KEY');
}
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { type, lat, lon, start, end } = req.query as any;

    let endpoint: string;
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
  } catch (err: any) {
    console.error('OWM handler error:', err);
    res.status(500).json({ error: err.message });
  }
}