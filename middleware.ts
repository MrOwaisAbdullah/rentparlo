import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Route configuration
const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/blog',
  '/listing',
  '/search',
  '/seller',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/confirm',
  '/auth/verify-email',
  '/error',
  '/unauthorized'
];

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/messages',
  '/favorites',
  '/listings/create',
  '/listings/edit',
  '/private'
];

const adminRoutes = [
  '/admin',
  '/studio'
];

const sellerRoutes = [
  '/seller/dashboard',
  '/seller/listings',
  '/seller/analytics',
  '/seller/profile',
  '/seller/settings'
];

// Helper function to check if route matches pattern
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

// Helper function to get user role from Supabase
async function getUserRole(supabase: any, userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching user role:', error);
      return null;
    }
    
    return data.role;
  } catch (error) {
    console.error('Error in getUserRole:', error);
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    // Create Supabase SSR client
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: any) {
            request.cookies.delete(name);
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.delete(name);
          },
        },
      }
    );
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
    }

    const user = session?.user;
    const isAuthenticated = !!user;
    
    // Public routes - allow access
    if (matchesRoute(pathname, publicRoutes)) {
      // If user is authenticated and trying to access auth pages, redirect to dashboard
      if (isAuthenticated && pathname.startsWith('/auth/') && !pathname.includes('/confirm')) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      return response;
    }
    
    // Protected routes - require authentication
    if (matchesRoute(pathname, protectedRoutes)) {
      if (!isAuthenticated) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    }
    
    // Admin routes - require admin role
    if (matchesRoute(pathname, adminRoutes)) {
      if (!isAuthenticated) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      const userRole = await getUserRole(supabase, user.id);
      if (userRole !== 'admin') {
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }
      
      return response;
    }
    
    // Seller routes - require seller role
    if (matchesRoute(pathname, sellerRoutes)) {
      if (!isAuthenticated) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      const userRole = await getUserRole(supabase, user.id);
      if (userRole !== 'seller' && userRole !== 'admin') {
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        return NextResponse.redirect(unauthorizedUrl);
      }
      
      return response;
    }
    
    // Default: allow access
    return response;
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, allow access to public routes but redirect protected routes to login
    if (matchesRoute(pathname, [...protectedRoutes, ...adminRoutes, ...sellerRoutes])) {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};