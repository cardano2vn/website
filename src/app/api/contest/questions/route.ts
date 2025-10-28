import { NextResponse } from 'next/server';

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET() {
  try {
    const sheetId = process.env.CONTEST_SHEET_ID || '';
    const range = process.env.CONTEST_QUESTIONS_SHEET_RANGE || 'ContestList';
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY || '';

    if (!sheetId || !apiKey) {
      return NextResponse.json({ success: false, error: 'Missing sheet env or API key' }, { status: 400 });
    }

    const endpoint = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${apiKey}`;
    const res = await fetch(endpoint);
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Failed to fetch', data }, { status: res.status });
    }

    const values: string[][] = Array.isArray(data?.values) ? data.values : [];
    if (values.length === 0) {
      return NextResponse.json({ success: true, data: { values: [] } });
    }

    const headers = values[0];
    const rows = values.slice(1);
    const randomized = shuffle(rows.slice());
    const picked = randomized.slice(0, 30);
    const out = [headers, ...picked];

    return NextResponse.json({ success: true, data: { values: out } });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}


