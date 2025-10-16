import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // TEMPORARILY DISABLED - Allow all requests through
  return NextResponse.next();

  /* Original middleware code - commented out for now
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/test', '/api'];
  const isPublicPath = publicPaths.some(p => path.startsWith(p));

  // Check for auth token
  const token = request.cookies.get('auth-storage');

  // If trying to access dashboard without auth, redirect to login
  if (path.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify the token has valid user data
    try {
      const authData = JSON.parse(token.value);
      const user = authData?.state?.user;
      if (!user || !user.role) {
        // Invalid token structure, redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-storage');
        return response;
      }
      // Valid token, allow access
      return NextResponse.next();
    } catch (e) {
      // If parsing fails, clear the cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-storage');
      return response;
    }
  }

  // If authenticated and trying to access login or root, redirect to dashboard
  if (token && (path === '/login' || path === '/')) {
    // Parse the token to get user role
    try {
      const authData = JSON.parse(token.value);
      const userRole = authData?.state?.user?.role;
      if (userRole) {
        // Role is already lowercase in our hardcoded data
        return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
      }
    } catch (e) {
      // If parsing fails, allow normal navigation
      return NextResponse.next();
    }
  }

  return NextResponse.next();
  */
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};