import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { ApplicationError } from './errors';
import { logger } from './logger';

export function apiError(error: unknown) {
  const requestId = randomUUID();
  if (error instanceof ApplicationError) return NextResponse.json({ error: error.message, code: error.code, requestId }, { status: error.status, headers: { 'x-request-id': requestId } });
  const message = error instanceof Error ? error.message : 'INTERNAL_ERROR';
  if (message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Authentication required', requestId }, { status: 401, headers: { 'x-request-id': requestId } });
  logger.error('api_request_failed', { requestId, errorType: error instanceof Error ? error.name : 'unknown' });
  return NextResponse.json({ error: 'Something went wrong. Please try again.', requestId }, { status: 500, headers: { 'x-request-id': requestId } });
}
