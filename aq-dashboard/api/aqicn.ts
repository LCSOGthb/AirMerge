// aq-dashboard/api/aqicn.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';
const TOKEN = process.env.AQICN_TOKEN!;

const TOKEN = process.env.AQICN_TOKEN!;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { lat, lon } = req.query as any;
  const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${TOKEN}`;
  const apiRes = await fetch(url);
  const data = await apiRes.json();
  res.status(apiRes.status).json(data);
}
