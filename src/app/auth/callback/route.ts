import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// This API route handles the OAuth callback from Supabase.
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code'); 

  console.log('API Route /auth/callback: Received OAuth callback.');
  console.log('API Route /auth/callback: Full Request URL:', request.url);
  console.log('API Route /auth/callback: Auth code:', code);

  // If an auth code is present, exchange it for a session.
  if (code) {
    const supabase = createRouteHandlerClient({ cookies }); // Create a Supabase client that can read/write cookies
    console.log('API Route /auth/callback: Exchanging auth code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('API Route /auth/callback: Error exchanging code for session:', error);
      // Redirect to an error page or sign-in page on error
      return NextResponse.redirect(`${requestUrl.origin}/sign-in?error=auth_failed`);
    }

    console.log('API Route /auth/callback: Session established. User ID:', data.session?.user.id);

    // Now that the session is established, fetch the user's profile to check completion.
    try {
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', data.session!.user.id)
        .single();

      console.log('API Route /auth/callback: Profile check after session exchange:');
      console.log('  Profile Data:', profile);
      console.log('  Profile Error:', profileFetchError);
      console.log(`  Is Profile NULL?: ${profile === null}`);
      console.log(`  Is Username NULL?: ${profile && profile.username === null}`);

      // If profile is not found or username is null, redirect to complete-profile.
      if (!profile || profile.username === null) {
        console.log('API Route /auth/callback: Profile incomplete. Redirecting to /complete-profile.');
        return NextResponse.redirect(`${requestUrl.origin}/complete-profile`);
      } else {
        // Profile is complete, redirect to homepage.
        console.log('API Route /auth/callback: Profile complete. Redirecting to /.');
        return NextResponse.redirect(`${requestUrl.origin}/`);
      }
    } catch (profileCheckError) {
      console.error('API Route /auth/callback: Error during profile check after session exchange:', profileCheckError);
      // Fallback if profile check fails, redirect to complete profile or sign-in
      return NextResponse.redirect(`${requestUrl.origin}/complete-profile?error=profile_check_failed`);
    }
  }

  // If no code is present (e.g., direct access to callback URL), redirect to sign-in.
  console.log('API Route /auth/callback: No auth code found. Redirecting to sign-in.');
  return NextResponse.redirect(`${requestUrl.origin}/sign-in`);
}