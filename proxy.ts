import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { NoopRealtimeTransport } from './lib/supabase/noop-realtime'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        transport: NoopRealtimeTransport,
      },
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  let userRole: string | null = null

  // Protected routes
  const protectedPaths = ['/dashboard', '/bookings', '/owner', '/admin']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  // Auth routes (redirect away if already logged in)
  const authPaths = ['/login', '/register']
  const isAuthPage = authPaths.some(p => pathname.startsWith(p))

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (isProtected || isAuthPage)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    userRole = profile?.role ?? null
  }

  if (user && isProtected) {
    if (pathname.startsWith('/admin') && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname.startsWith('/owner') && !['media_owner', 'admin'].includes(userRole ?? '')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname.startsWith('/dashboard') && userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (pathname.startsWith('/dashboard') && userRole === 'media_owner') {
      return NextResponse.redirect(new URL('/owner', request.url))
    }
  }

  if (isAuthPage && user) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (userRole === 'media_owner') {
      return NextResponse.redirect(new URL('/owner', request.url))
    }

    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
