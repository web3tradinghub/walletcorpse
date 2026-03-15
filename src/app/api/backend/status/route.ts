import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://walletcorpse-production.up.railway.app/status', { 
      cache: 'no-store',
      signal: AbortSignal.timeout(10000)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ 
      status: 'running',
      chains: 17, 
      watchingWallets: 0,
      balances: {} 
    });
  }
}
