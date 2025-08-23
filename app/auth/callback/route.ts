import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { handleOAuthCallback } from '@/app/auth/login/actions';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  const type = requestUrl.searchParams.get('type'); // 'signup' or null for signin
  
  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, error_description);
    const redirectPath = type === 'signup' ? '/auth/register' : '/auth/login';
    return NextResponse.redirect(
      new URL(`${redirectPath}?error=oauth_error&message=` + encodeURIComponent(error_description || error), request.url)
    );
  }
  
  // Handle missing code
  if (!code) {
    const redirectPath = type === 'signup' ? '/auth/register' : '/auth/login';
    return NextResponse.redirect(
      new URL(`${redirectPath}?error=missing_code`, request.url)
    );
  }

  try {
    // Exchange code for session
    const supabase = await createClient();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error('Code exchange error:', exchangeError);
      const redirectPath = type === 'signup' ? '/auth/register' : '/auth/login';
      return NextResponse.redirect(
        new URL(`${redirectPath}?error=exchange_failed&message=` + encodeURIComponent(exchangeError.message), request.url)
      );
    }
    
    if (data.user) {
      // Check if this is a new user and create profile if needed
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, onboarding_completed')
        .eq('id', data.user.id)
        .single();
        
      let isNewUser = false;
      let needsOnboarding = false;
        
      if (!existingUser) {
        isNewUser = true;
        // Create user profile for new OAuth user
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
            profile_image_url: data.user.user_metadata?.avatar_url,
            role: 'user', // Default role, can be changed during onboarding
            country: 'Pakistan',
            is_verified: false,
            email_verified: data.user.email_confirmed_at ? true : false,
            phone_verified: false,
            active: true,
            onboarding_completed: false, // New users need onboarding
            guest_id: `guest_${Date.now()}`,
            notification_preferences: {
              email: true,
              sms: false,
              push: true,
              marketing: false,
              security_alerts: true
            },
            privacy_settings: {
              profile_visible: true,
              contact_info_visible: false,
              activity_visible: true,
              location_sharing: false
            },
            preferred_language: 'en',
            timezone: 'Asia/Karachi',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (profileError) {
          console.error('OAuth profile creation error:', profileError);
        } else {
          needsOnboarding = true;
        }
      } else {
        // Existing user - check if they need onboarding
        needsOnboarding = !existingUser.onboarding_completed;
      }
      
      // Update login info
      await supabase
        .from('users')
        .update({ 
          last_login: new Date().toISOString(),
          login_count: supabase.sql`login_count + 1`
        })
        .eq('id', data.user.id);
        
      // Determine redirect path
      if (type === 'signup' || needsOnboarding) {
        // Redirect to onboarding/welcome for signup or incomplete onboarding
        const welcomeUrl = new URL('/auth/welcome', request.url);
        if (isNewUser) {
          welcomeUrl.searchParams.set('new_user', 'true');
        }
        if (type === 'signup') {
          welcomeUrl.searchParams.set('from', 'signup');
        }
        return NextResponse.redirect(welcomeUrl);
      }
    }

    // Successful authentication for existing users with completed onboarding
    return NextResponse.redirect(
      new URL('/dashboard', request.url)
    );
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    const redirectPath = type === 'signup' ? '/auth/register' : '/auth/login';
    return NextResponse.redirect(
      new URL(`${redirectPath}?error=callback_error`, request.url)
    );
  }
}