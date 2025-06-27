import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;

  const publicPaths = ['/', '/sign-in', '/sign-up', '/check-email', '/api/auth/error'];
  const completeProfilePath = '/complete-profile';

  console.log(`Middleware: Path: "${pathname}", Session: ${!!session}`);
  if (session) {
    console.log(`Middleware: User ID: ${session.user.id}`);
  }

  if (!session) {
    if (!publicPaths.includes(pathname) && pathname !== completeProfilePath) {
      console.log(`Middleware: Not authenticated. Redirecting ${pathname} to /sign-in.`);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/sign-in';
      redirectUrl.searchParams.set('redirectedFrom', pathname); 
      return NextResponse.redirect(redirectUrl); 
    }
    return res; 
  }

  // User IS authenticated
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('username')
      .eq('user_id', session.user.id)
      .single();

    console.log('--- Middleware Profile Debug Log ---');
    console.log('Raw Profile Data:', profile);
    console.log('Raw Profile Error:', profileError);
    console.log(`Profile Exists: ${!!profile}`);
    console.log(`Username: ${profile ? profile.username : 'N/A (Profile null)'}`);
    console.log('--- End Middleware Profile Debug Log ---');

    // Scenario 1: Profile does NOT exist OR profile exists but username IS null
    if (!profile || profile.username === null) {
      console.log(`Middleware: Profile incomplete for ${session.user.id}.`);
      if (pathname !== completeProfilePath) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = completeProfilePath;
        return NextResponse.redirect(redirectUrl);
      }
      return res; // Already on complete-profile
    } 
    // Scenario 2: Profile EXISTS AND username is NOT null (profile is complete)
    else { 
      console.log(`Middleware: Profile complete for ${session.user.id}.`);
      if (pathname === completeProfilePath) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/';
        return NextResponse.redirect(redirectUrl);
      }
      return res; // Allow to proceed
    }

  } catch (e) {
    console.error('Middleware: Unexpected error during profile check:', e);
    if (!publicPaths.includes(pathname) && pathname !== completeProfilePath) { 
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/sign-in';
      return NextResponse.redirect(redirectUrl);
    }
    return res;
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets).*)', 
  ],
};