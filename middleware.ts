import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

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
  // '/dashboard',
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
  // '/dashboard',
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

export async function middleware(request: NextRequest) {
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
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is set, update the request cookies as well.
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
          remove(name: string, options: CookieOptions) {
            // If the cookie is removed, update the request cookies as well.
            request.cookies.set({
              name,
              value: '',
              ...options,
            });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
    }

    const user = session?.user;
    const isAuthenticated = !!user;

    if (matchesRoute(pathname, publicRoutes)) {
      if (isAuthenticated && pathname.startsWith('/auth/') && !pathname.includes('/confirm')) {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
      }
      return response;
    }

    if (matchesRoute(pathname, protectedRoutes)) {
      if (!isAuthenticated) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    }

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

    return response;
  } catch (error) {
    console.error('Middleware error:', error);

    if (matchesRoute(pathname, [...protectedRoutes, ...adminRoutes, ...sellerRoutes])) {
      const loginUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.).*)',
  ],
};
