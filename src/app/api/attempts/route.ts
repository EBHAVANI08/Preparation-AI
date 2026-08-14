import { NextResponse } from 'next/server';
import { database } from '@/lib/server/mongodb';
import { requireSession } from '@/lib/server/session';
import { apiError } from '@/lib/server/api';

export async function GET() {
  try {
    const identity = await requireSession();
    const documents = await (await database()).collection('attempts')
      .find({ userId: identity.userId, organizationId: identity.organizationId, status: 'submitted' })
      .project({ result: 1, _id: 0 }).sort({ submittedAt: -1 }).limit(100).toArray();
    return NextResponse.json({ attempts: documents.map((document) => document.result).filter(Boolean) });
  } catch (error) { return apiError(error); }
}

export async function POST() {
  try {
    const identity = await requireSession();
    const attempt = await (await database()).collection('attempts').findOne(
      { userId: identity.userId, organizationId: identity.organizationId, status: 'in_progress' },
      { sort: { createdAt: -1 }, projection: { id: 1, _id: 0 } },
    );
    return NextResponse.json({ attemptId: attempt?.id || null });
  } catch (error) { return apiError(error); }
}
