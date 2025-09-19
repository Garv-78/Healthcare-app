import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
        set(name: string, value: string, options: any) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          response.cookies.delete({ name, ...options })
        },
      },
    }
  )

  // Only check session for auth-specific paths to avoid unnecessary redirects
  if (request.nextUrl.pathname.startsWith('/login')) {
    try {
      // Check if user is forcing access to login page or coming from homepage register
      const force = request.nextUrl.searchParams.get('force')
      const mode = request.nextUrl.searchParams.get('mode')
      
      if (force === 'true' || mode === 'register') {
        console.log('Allowing access to login page (force or register mode)')
        return response
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      
      // Only redirect if we have a confirmed valid session and user is not explicitly trying to register
      if (session?.user && !error) {
        console.log('Middleware: Redirecting authenticated user away from login')
        return NextResponse.redirect(new URL('/', request.url))
      }
    } catch (error) {
      // If there's an error checking session, let the request proceed
      console.error('Middleware session check error:', error)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}