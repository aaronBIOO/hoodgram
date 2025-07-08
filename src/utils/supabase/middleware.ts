import { createMiddlewareClient } from '@supabase/ssr'; 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient({
    request,
    response,
  });


  await supabase.auth.getSession();

  return response;
}