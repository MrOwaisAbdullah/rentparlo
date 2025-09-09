import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'
  
  // Also check for the older format with 'code' parameter
  const code = searchParams.get('code')
  
  const supabase = await createClient()

  if (token_hash && type) {
    // New format with token_hash
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    
    if (!error) {
      // After successful verification, update user's email_verified status
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Update user's email_verified status in the database
        await supabase
          .from('users')
          .update({ 
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        // Check if user has completed onboarding
        const { data: userProfile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()
        
        // If onboarding is not completed, redirect to welcome page
        if (!userProfile || !userProfile.onboarding_completed) {
          redirect('/auth/welcome')
        }
      }
      
      // redirect user to specified redirect URL or dashboard
      redirect(next === '/' ? '/dashboard' : next)
    }
  } else if (code) {
    // Older format with code - exchange code for session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // After successful verification, update user's email_verified status
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Update user's email_verified status in the database
        await supabase
          .from('users')
          .update({ 
            email_verified: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        // Check if user has completed onboarding
        const { data: userProfile } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()
        
        // If onboarding is not completed, redirect to welcome page
        if (!userProfile || !userProfile.onboarding_completed) {
          redirect('/auth/welcome')
        }
      }
      
      // redirect user to specified redirect URL or dashboard
      redirect(next === '/' ? '/dashboard' : next)
    }
  }

  // redirect the user to an error page with some instructions
  redirect('/auth/error?message=Invalid verification link')
}