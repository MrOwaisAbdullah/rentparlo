import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting user status:', error);
      return NextResponse.json({ isAuthenticated: false, user: null, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ isAuthenticated: !!user, user: user ? { id: user.id, email: user.email } : null });
  } catch (error) {
    console.error('Unexpected error in auth status API:', error);
    return NextResponse.json({ isAuthenticated: false, user: null, error: 'Internal server error' }, { status: 500 });
  }
}