import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { prisma } from '@/lib/prisma'

// Cache do status em memória (TTL 30s para evitar bater no banco a cada request)
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

  // Rotas que NUNCA são afetadas pelo modo manutenção
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

  // Se modo manutenção desligado e usuário tá em /manutencao, mandar pra home
  if (pathname === '/manutencao') {
    const isMaintenance = await isMaintenanceMode()
    if (!isMaintenance) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)',
  ],
}
