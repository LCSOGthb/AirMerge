import { NextRequest, NextResponse } from 'next/server';

const TOKEN = process.env.AQICN_TOKEN;

export async function GET(req: NextRequest) {
  if (!TOKEN) {
    return NextResponse.json({ error: 'Missing AQICN_TOKEN' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get('lat'));
  const lon = Number(searchParams.get('lon'));

  if (!Number.isFinite(lat) || lat < -90 || lat > 90 ||
      !Number.isFinite(lon) || lon < -180 || lon > 180) {
    return NextResponse.json({ error: 'Invalid lat/lon' }, { status: 400 });
  }

  try {
    const url = new URL(`https://api.waqi.info/feed/geo:${lat};${lon}/`);
    url.searchParams.set('token', TOKEN);
    const res = await fetch(url.toString());
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
