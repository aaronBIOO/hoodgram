import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Service Role Key in /api/create-initial-profile');
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, email, name, image } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: 'User ID and email are required.' }, { status: 400 });
    }

    
    const { error } = await supabase.from('profiles').insert({
      user_id: userId,
      email: email,
      name: name || null,
      image: image || null,
      username: null,
    });

    if (error) {
      console.error('Supabase profile insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Initial profile created successfully.' }, { status: 201 });

  
  } catch (err: unknown) {
    console.error('Unexpected error in /api/create-initial-profile:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}