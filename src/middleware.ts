import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;

  // Add '/auth/callback' to publicPaths so Middleware doesn't intercept it.
  // The API route at /auth/callback will handle the session and redirect.
  const publicPaths = ['/', '/sign-in', '/sign-up', '/check-email', '/api/auth/error', '/auth/callback'];
  const completeProfilePath = '/complete-profile';

  // Middleware Debugging Logs (These will appear in your NEXT.JS TERMINAL)
  console.log(`Middleware: Path: "${pathname}", Session: ${!!session}`);
  if (session) {
      console.log(`Middleware: User ID: ${session.user.id}`);
  }

  // Scenario 1: User is NOT authenticated
  if (!session) {
    // If trying to access a protected path, redirect to sign-in
    if (!publicPaths.includes(pathname) && pathname !== completeProfilePath) {
      console.log(`Middleware: Not authenticated. Redirecting protected path (${pathname}) to /sign-in.`);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/sign-in';
      redirectUrl.searchParams.set('redirectedFrom', pathname); 
      return NextResponse.redirect(redirectUrl);
    }
    return res; // Allow access to public paths
  }

  // Scenario 2: User IS authenticated (session exists)
  // Middleware's primary role now is to ensure authenticated users are not on public auth pages.
  // The /auth/callback API route handles the initial profile completion redirect.
  if (publicPaths.includes(pathname) && pathname !== '/') { // If on a public auth page (but not homepage)
    console.log(`Middleware: Authenticated user on auth page (${pathname}), redirecting to /.`);
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  // If authenticated and not on a public auth page, allow access.
  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
};