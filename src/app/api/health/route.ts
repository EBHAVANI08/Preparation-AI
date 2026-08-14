import { NextResponse } from 'next/server';
import { database, isDatabaseConfigured } from '@/lib/server/mongodb';
export async function GET() {
  const started = Date.now();
  try {
    if (!isDatabaseConfigured()) return NextResponse.json({ status: 'degraded', database: 'not_configured', timestamp: new Date().toISOString() }, { status: 503 });
    await (await database()).command({ ping: 1 });
    return NextResponse.json({ status: 'healthy', database: 'connected', latencyMs: Date.now() - started, timestamp: new Date().toISOString() });
  } catch { return NextResponse.json({ status: 'unhealthy', database: 'unavailable', timestamp: new Date().toISOString() }, { status: 503 }); }
}
