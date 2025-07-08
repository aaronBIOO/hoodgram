import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware'; 
import { createMiddlewareClient } from '@supabase/ssr'; 

export async function middleware(request: NextRequest) {
  // Step 1: Run the Supabase session update helper.
  // This refreshes the session and updates cookies in the response.
  const response = await updateSession(request);

  // Step 2: Now, create a new Supabase client from the updated request/response
  // to safely read the session for custom middleware logic.
  const supabase = createMiddlewareClient({
    request,
    response,
  });
  const { data: { session } } = await supabase.auth.getSession(); // Get the session after update

  const { pathname } = request.nextUrl;

  const publicPaths = ['/', '/sign-in', '/sign-up', '/check-email', '/api/auth/error', '/auth/callback'];
  const completeProfilePath = '/complete-profile';

  // Middleware Debugging Logs
  console.log(`Middleware: Path: "${pathname}", Session: ${!!session}`);
  if (session) {
      console.log(`Middleware: User ID: ${session.user.id}`);
  }

  // Scenario 1: User is NOT authenticated
  if (!session) {
    if (!publicPaths.includes(pathname) && pathname !== completeProfilePath) {
      console.log(`Middleware: Not authenticated. Redirecting protected path (${pathname}) to /sign-in.`);
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/sign-in';
      redirectUrl.searchParams.set('redirectedFrom', pathname); 
      return NextResponse.redirect(redirectUrl);
    }
    return response; // Allow access to public paths
  }

  // Scenario 2: User IS authenticated
  // If an authenticated user tries to access a public auth page (but not homepage), redirect to home.
  if (publicPaths.includes(pathname) && pathname !== '/') {
    console.log(`Middleware: Authenticated user on auth page (${pathname}), redirecting to /.`);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  // Allow the request to proceed if no redirection is needed.
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|auth/callback).*)',
  ],
};