'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/admin/auth'
import {
  CouponFormSchema,
  type CouponFormValues,
} from '@/lib/admin/coupons/schema'

type Result<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

export async function saveCouponAction(
  couponId: string | null,
  values: CouponFormValues,
): Promise<Result<{ id: string }>> {
  try {
    const admin = await requireRole(['admin', 'editor'])

    const parsed = CouponFormSchema.safeParse({
      ...values,
      validFrom: values.validFrom ? new Date(values.validFrom) : null,
      validUntil: values.validUntil ? new Date(values.validUntil) : null,
    })
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      }
    }

    const code = parsed.data.code.toUpperCase()

    const existing = await prisma.coupon.findFirst({
      where: {
        code,
        ...(couponId ? { NOT: { id: couponId } } : {}),
      },
      select: { id: true },
    })
    if (existing) {
      return { ok: false, error: `Cupom com código "${code}" já existe` }
    }

    const data = {
      code,
      description: parsed.data.description ?? null,
      discountType: parsed.data.discountType,
      discountValue: parsed.data.discountValue,
      minPurchase: parsed.data.minPurchase ?? null,
      validFrom: parsed.data.validFrom ?? null,
      validUntil: parsed.data.validUntil ?? null,
      maxUses: parsed.data.maxUses ?? null,
      isActive: parsed.data.isActive,
    }

    let id = couponId

    if (couponId) {
      await prisma.coupon.update({ where: { id: couponId }, data })
    } else {
      const created = await prisma.coupon.create({
        data,
        select: { id: true },
      })
      id = created.id
    }

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: couponId ? 'coupon_update' : 'coupon_create',
          adminId: admin.id,
          couponId: id!,
        },
      },
    })

    revalidatePath('/admin/cupons')
    revalidatePath('/promocoes')

    return { ok: true, data: { id: id! } }
  } catch (error) {
    console.error('[saveCoupon]', error)
    return { ok: false, error: 'Erro ao salvar cupom' }
  }
}

export async function toggleCouponActiveAction(
  couponId: string,
): Promise<Result> {
  try {
    const admin = await requireRole(['admin', 'editor'])

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      select: { isActive: true },
    })
    if (!coupon) return { ok: false, error: 'Cupom não encontrado' }

    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: !coupon.isActive },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: coupon.isActive ? 'coupon_deactivate' : 'coupon_activate',
          adminId: admin.id,
          couponId,
        },
      },
    })

    revalidatePath('/admin/cupons')
    revalidatePath('/promocoes')

    return { ok: true }
  } catch (error) {
    console.error('[toggleCouponActive]', error)
    return { ok: false, error: 'Erro ao alternar status' }
  }
}

export async function duplicateCouponAction(
  couponId: string,
): Promise<Result<{ id: string }>> {
  try {
    const admin = await requireRole(['admin', 'editor'])

    const original = await prisma.coupon.findUnique({
      where: { id: couponId },
    })
    if (!original) return { ok: false, error: 'Cupom não encontrado' }

    let newCode = `${original.code}-COPY`
    let suffix = 2
    while (await prisma.coupon.findFirst({ where: { code: newCode } })) {
      newCode = `${original.code}-COPY${suffix++}`
      if (suffix > 100) break
    }

    const created = await prisma.coupon.create({
      data: {
        code: newCode,
        description: original.description,
        discountType: original.discountType,
        discountValue: original.discountValue,
        minPurchase: original.minPurchase,
        validFrom: null,
        validUntil: null,
        maxUses: original.maxUses,
        isActive: false,
      },
      select: { id: true },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'coupon_duplicate',
          adminId: admin.id,
          sourceId: couponId,
          newId: created.id,
        },
      },
    })

    revalidatePath('/admin/cupons')
    return { ok: true, data: { id: created.id } }
  } catch (error) {
    console.error('[duplicateCoupon]', error)
    return { ok: false, error: 'Erro ao duplicar' }
  }
}

export async function deleteCouponAction(couponId: string): Promise<Result> {
  try {
    const admin = await requireRole(['admin'])

    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
      select: { code: true },
    })
    if (!coupon) return { ok: false, error: 'Cupom não encontrado' }

    await prisma.coupon.delete({ where: { id: couponId } })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'coupon_delete',
          adminId: admin.id,
          code: coupon.code,
        },
      },
    })

    revalidatePath('/admin/cupons')
    revalidatePath('/promocoes')

    return { ok: true }
  } catch (error) {
    console.error('[deleteCoupon]', error)
    return { ok: false, error: 'Erro ao excluir' }
  }
}
