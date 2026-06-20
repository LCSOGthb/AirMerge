import type { VercelRequest, VercelResponse } from "@vercel/node";

const TOKEN = process.env.AQICN_TOKEN!;
if (!TOKEN) throw new Error("Missing environment variable AQICN_TOKEN");

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rawLat = Array.isArray(req.query.lat)
      ? req.query.lat[0]
      : req.query.lat;
    const rawLon = Array.isArray(req.query.lon)
      ? req.query.lon[0]
      : req.query.lon;

    const lat = Number(rawLat);
    const lon = Number(rawLon);

    const isValidLat = Number.isFinite(lat) && lat >= -90 && lat <= 90;
    const isValidLon = Number.isFinite(lon) && lon >= -180 && lon <= 180;

    if (!isValidLat || !isValidLon) {
      return res
        .status(400)
        .json({ error: "Invalid lat/lon query parameters" });
    }

    const url = new URL(`https://api.waqi.info/feed/geo:${lat};${lon}/`);
    url.searchParams.set("token", TOKEN);

    const apiRes = await fetch(url.toString());
    const data = await apiRes.json();

    return res.status(apiRes.status).json(data);
  } catch (err: any) {
    console.error("AQICN handler error:", err);
    res.status(500).json({ error: err.message });
  }
}
