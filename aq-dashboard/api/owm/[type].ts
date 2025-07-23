// aq-dashboard/api/owm/[type].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const OW_KEY = process.env.OW_KEY!;
if (!OW_KEY) throw new Error('Missing environment variable OW_KEY');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { type, lat, lon, start, end } = req.query as any;
    let endpoint = type === 'history'
      ? `air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}`
      : type === 'forecast'
        ? `air_pollution/forecast?lat=${lat}&lon=${lon}`
        : `air_pollution?lat=${lat}&lon=${lon}`;

    const url = `https://api.openweathermap.org/data/2.5/${endpoint}&appid=${OW_KEY}`;
    const apiRes = await fetch(url);
    const data = await apiRes.json();
    return res.status(apiRes.status).json(data);
  } catch (err: any) {
    console.error('OWM error', err);
    return res.status(500).json({ error: err.message });
  }
}
