import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware'

// Routes du groupe (dashboard) — nécessitent une session active
const DASHBOARD_PREFIXES = ['/dashboard', '/feedbacks', '/settings']

// Routes du groupe (auth) — inaccessibles si déjà connecté
const AUTH_PATHS = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await createMiddlewareClient(request)
  const { pathname } = request.nextUrl

  const isDashboardRoute = DASHBOARD_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(prefix + '/')
  )
  const isAuthRoute = AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  // /(dashboard)/* : pas connecté → /login
  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // /(auth)/* : déjà connecté → /dashboard
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // /(public)/* et tout le reste : toujours accessible
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
