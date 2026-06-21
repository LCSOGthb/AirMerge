import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const owKey = process.env.OW_KEY;
  if (!owKey) {
    return NextResponse.json({ error: 'Missing OW_KEY' }, { status: 500 });
  }

  const { type } = await params;
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  let endpoint: string;
  if (type === 'history') {
    endpoint = `air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}`;
  } else if (type === 'forecast') {
    endpoint = `air_pollution/forecast?lat=${lat}&lon=${lon}`;
  } else {
    endpoint = `air_pollution?lat=${lat}&lon=${lon}`;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/${endpoint}&appid=${owKey}`;
    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
