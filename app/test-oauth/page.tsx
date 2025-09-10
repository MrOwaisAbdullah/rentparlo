// pages/test-oauth.tsx
'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function TestOAuth() {
  const handleSignIn = async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://rentparlo.vercel.app/auth/callback', // CHANGE THIS
      },
    })
    
    if (error) {
      console.error('OAuth error:', error)
    } else {
      console.log('OAuth redirect URL:', data.url)
      // Manually redirect
      if (data.url) {
        window.location.href = data.url
      }
    }
  }

  // Check for code parameter on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      console.log('Code parameter found:', code)
      console.log('Current URL:', window.location.href)
    }
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>OAuth Test Page</h1>
      <button onClick={handleSignIn}>
        Sign in with Google
      </button>
      <p>Check console for debugging information</p>
    </div>
  )
}