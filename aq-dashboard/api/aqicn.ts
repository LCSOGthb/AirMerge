// aq-dashboard/api/aqicn.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
const TOKEN = process.env.AQICN_TOKEN!;
if (!TOKEN) {
  throw new Error('Missing environment variable AQICN_TOKEN');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { lat, lon } = req.query as any;
    const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${TOKEN}`;
    const apiRes = await fetch(url);
    const data = await apiRes.json();

    return res.status(apiRes.status).json(data);
  } catch (err: any) {
    console.error('AQICN handler error:', err);
    res.status(500).json({ error: err.message });
  }
}