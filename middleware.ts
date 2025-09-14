import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Get the authenticated user (secure method)
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  
  // Get the user profile if authenticated
  let userProfile = null
  if (authUser && !authError) {
    const { data } = await supabase
      .from('users')
      .select('onboarding_completed, role')
      .eq('id', authUser.id)
      .single()
    userProfile = data
  }

  // Define protected routes that require onboarding completion
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/seller',
    '/create-listing',
    '/my-listings',
    '/analytics',
    '/support'
  ]

  // Check if the current path requires onboarding completion
  const requiresOnboarding = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  )

  // Redirect authenticated users who haven't completed onboarding
  if (authUser && !authError && !userProfile?.onboarding_completed && requiresOnboarding) {
    // Allow access to auth routes
    if (!request.nextUrl.pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/auth/welcome', request.url))
    }
  }

  // Redirect authenticated users to dashboard if they're on auth pages (except logout)
  if (authUser && !authError && userProfile?.onboarding_completed) {
    const authRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']
    if (authRoutes.includes(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Redirect unauthenticated users trying to access protected routes
  if ((!authUser || authError) && requiresOnboarding) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}