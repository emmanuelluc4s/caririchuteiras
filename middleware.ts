import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // PROTEÇÃO DO ADMIN (Módulo 12)
  if (pathname.startsWith('/admin')) {
    const publicAdminPaths = ['/admin/login', '/admin/unauthorized']
    const isPublicAdminPath = publicAdminPaths.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`),
    )

    const { response, user } = await updateSession(request)

    if (isPublicAdminPath) {
      if (pathname === '/admin/login' && user) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      return response
    }

    if (!user) {
      const url = new URL('/admin/login', request.url)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    return response
  }

  // Modo manutenção é tratado no layout público (M09 — movido pra evitar
  // Prisma no edge runtime do middleware, que excedia 1MB do plano free)
  const { response } = await updateSession(request)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}
