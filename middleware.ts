import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public paths that don't require authentication
    const publicPaths = ['/auth/boxed-signin', '/auth/boxed-signup', '/auth/boxed-password-reset'];
    
    // Check if the path is public
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Get token from cookie (we'll set this after login)
    const token = request.cookies.get('auth_token')?.value;

    // If trying to access protected route without token, redirect to login
    if (!isPublicPath && !token && pathname.startsWith('/')) {
        // Allow access to auth routes
        if (pathname.startsWith('/auth/')) {
            return NextResponse.next();
        }
        
        const url = request.nextUrl.clone();
        url.pathname = '/auth/boxed-signin';
        return NextResponse.redirect(url);
    }

    // If logged in and trying to access login page, redirect to dashboard
    if (token && pathname === '/auth/boxed-signin') {
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - assets (public assets)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|assets).*)',
    ],
};
