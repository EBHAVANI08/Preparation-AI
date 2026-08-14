import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
const protectedPrefixes = ['/dashboard', '/exams', '/analytics', '/mentor', '/planner', '/career', '/universities', '/scholarships', '/wellness', '/university-predictor', '/digital-twin', '/readiness', '/rank-predictor', '/success-simulator'];
export function proxy(request: NextRequest) {
  const protectedRoute = protectedPrefixes.some((prefix) => request.nextUrl.pathname === prefix || request.nextUrl.pathname.startsWith(`${prefix}/`));
  if (protectedRoute && !request.cookies.get('prep_session')) return NextResponse.redirect(new URL('/', request.url));
  return NextResponse.next();
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'] };
