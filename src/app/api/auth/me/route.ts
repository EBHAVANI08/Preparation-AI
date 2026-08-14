import { NextResponse } from 'next/server';
import { database } from '@/lib/server/mongodb';
import { getSession } from '@/lib/server/session';
import { apiError } from '@/lib/server/api';
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ user: null }, { status: 401 });
    const user = await (await database()).collection('users').findOne({ id: session.userId });
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    const { passwordHash: _, _id: __, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) { return apiError(error); }
}
