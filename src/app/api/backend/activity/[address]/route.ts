import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { address: string } }) {
  try {
    const res = await fetch(`http://localhost:3001/activity/${params.address}`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ success: false, logs: [] });
  }
}
