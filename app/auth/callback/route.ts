import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const type = searchParams.get('type'); // 'signup' or undefined for signin

  if (code) {
    try {
      const supabase = await createClient();
      
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('OAuth callback error:', error);
        return redirect(`/auth/error?message=${encodeURIComponent(error.message)}`);
      }

      if (data.user) {
        // Check if this is a new user or existing user
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, onboarding_completed, role, name, phone, city')
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
              name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
              profile_image_url: data.user.user_metadata?.avatar_url,
              role: 'user', // Default role, can be changed during onboarding
              country: 'Pakistan',
              is_verified: false,
              email_verified: data.user.email_confirmed_at ? true : false,
              phone_verified: false,
              active: true,
              onboarding_completed: false, // New Google users need onboarding
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
            // Don't fail the login, just log the error
          } else {
            needsOnboarding = true;
          }
        } else {
          // Existing user - check if they need onboarding
          needsOnboarding = !existingUser.onboarding_completed;
          
          // Update profile image if it's new from Google
          if (data.user.user_metadata?.avatar_url && data.user.user_metadata.avatar_url !== existingUser.profile_image_url) {
            await supabase
              .from('users')
              .update({ 
                profile_image_url: data.user.user_metadata.avatar_url,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id);
          }
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
        let redirectTo = next;

        if (type === 'signup' || needsOnboarding) {
          // New users or users who haven't completed onboarding go to welcome page
          redirectTo = '/auth/welcome';
        } else if (next === '/' || next === '/auth/login' || next === '/auth/register') {
          // Existing users go to dashboard unless they have a specific destination
          redirectTo = '/dashboard';
        }

        return redirect(redirectTo);
      }
    } catch (error) {
      console.error('OAuth callback error:', error);
      return redirect(`/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
  }

  // No code parameter, redirect to error
  return redirect('/auth/error?message=Invalid%20callback');
}