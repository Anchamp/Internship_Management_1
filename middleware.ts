import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Exclude auth pages from middleware
  const excludedPaths = ['/sign-in', '/sign-up', '/'];
  if (excludedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value || '';
  const verifiedToken = await verifyJwtToken(token);
  
  if (!verifiedToken && !request.nextUrl.pathname.startsWith('/api')) {
    // Redirect to login if not authenticated and trying to access protected pages
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}

// Specify which paths this middleware applies to
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)',
  ],
};
