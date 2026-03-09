import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwa22NX2d_1iB6i0cib6sucUd58izBdtwaPDJ0ZNnqPhaBYkPn_HRpBCKsyJgXJSR-2nw/exec';

export async function POST(request) {
  try {
    const data = await request.json();
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(data),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      cache: 'no-store'
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, total: 0, stats: [], error: error.message }, { status: 500 });
  }
}
