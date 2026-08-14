import { NextResponse } from 'next/server';
import { configuredAIProviders } from '@/lib/server/ai-gateway';
import { requireSession } from '@/lib/server/session';
export async function GET() {
  await requireSession();
  const providers = configuredAIProviders();
  return NextResponse.json({ available: providers.length > 0, providers, automaticSwitching: providers.length > 1 });
}
