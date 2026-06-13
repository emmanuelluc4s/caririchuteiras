import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { prisma } from '@/lib/prisma'

// Cache de manutenção (Módulo 09)
let cachedMaintenance: { value: boolean; expiresAt: number } | null = null

async function isMaintenanceMode(): Promise<boolean> {
  if (cachedMaintenance && cachedMaintenance.expiresAt > Date.now()) {
    return cachedMaintenance.value
  }
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: 'singleton' },
      select: { isMaintenanceMode: true },
    })
    const value = config?.isMaintenanceMode ?? false
    cachedMaintenance = { value, expiresAt: Date.now() + 30_000 }
    return value
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ====================================================
  // 1) PROTEÇÃO DO ADMIN (Módulo 12)
  // ====================================================
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

  // ====================================================
  // 2) MODO MANUTENÇÃO (Módulo 09)
  // ====================================================
  const bypassPaths = ['/admin', '/api', '/manutencao', '/_next', '/favicon']
  const bypassed = bypassPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )

  if (!bypassed) {
    const isMaintenance = await isMaintenanceMode()
    if (isMaintenance) {
      return NextResponse.redirect(new URL('/manutencao', request.url))
    }
  }

  if (pathname === '/manutencao') {
    const isMaintenance = await isMaintenanceMode()
    if (!isMaintenance) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  const { response } = await updateSession(request)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}
