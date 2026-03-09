import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwa22NX2d_1iB6i0cib6sucUd58izBdtwaPDJ0ZNnqPhaBYkPn_HRpBCKsyJgXJSR-2nw/exec';

export async function GET() {
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=responses`, {
      cache: 'no-store'
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, data: [], error: error.message }, { status: 500 });
  }
}
