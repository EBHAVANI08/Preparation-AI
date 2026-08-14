import { NextResponse } from 'next/server';
import { database } from '@/lib/server/mongodb';
import { requireSession } from '@/lib/server/session';
import { apiError } from '@/lib/server/api';
export async function GET() { try { const i = await requireSession(); const c = await (await database()).collection('ai_conversations').findOne({ userId: i.userId, organizationId: i.organizationId, feature: 'mentor' }); return NextResponse.json({ messages: c?.messages || [] }); } catch (e) { return apiError(e); } }
export async function DELETE() { try { const i = await requireSession(); await (await database()).collection('ai_conversations').deleteOne({ userId: i.userId, organizationId: i.organizationId, feature: 'mentor' }); return NextResponse.json({ ok: true }); } catch (e) { return apiError(e); } }
