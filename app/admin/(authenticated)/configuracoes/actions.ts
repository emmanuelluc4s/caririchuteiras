'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/admin/auth'
import {
  SiteConfigSchema,
  type SiteConfigValues,
} from '@/lib/admin/config/schema'

type Result<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

export async function saveSiteConfigAction(
  values: SiteConfigValues,
): Promise<Result> {
  try {
    const admin = await requireRole(['admin'])

    const parsed = SiteConfigSchema.safeParse(values)
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      }
    }

    await prisma.siteConfig.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        ...parsed.data,
        promoBarMessages: parsed.data.promoBarMessages,
        heroSlides: [],
      },
      update: {
        ...parsed.data,
        promoBarMessages: parsed.data.promoBarMessages,
      },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: { action: 'config_update', adminId: admin.id },
      },
    })

    revalidatePath('/admin/configuracoes')
    revalidatePath('/', 'layout')

    return { ok: true }
  } catch (error) {
    console.error('[saveSiteConfig]', error)
    return { ok: false, error: 'Erro ao salvar configurações' }
  }
}

export async function toggleMaintenanceAction(
  enable: boolean,
): Promise<Result<{ isMaintenanceMode: boolean }>> {
  try {
    const admin = await requireRole(['admin'])

    const updated = await prisma.siteConfig.upsert({
      where: { id: 'singleton' },
      create: {
        id: 'singleton',
        whatsappNumber: '',
        isMaintenanceMode: enable,
        promoBarMessages: [],
        heroSlides: [],
      },
      update: { isMaintenanceMode: enable },
      select: { isMaintenanceMode: true },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: enable ? 'maintenance_enable' : 'maintenance_disable',
          adminId: admin.id,
        },
      },
    })

    revalidatePath('/', 'layout')
    revalidatePath('/admin/configuracoes')

    return { ok: true, data: { isMaintenanceMode: updated.isMaintenanceMode } }
  } catch (error) {
    console.error('[toggleMaintenance]', error)
    return { ok: false, error: 'Erro ao alternar modo manutenção' }
  }
}
