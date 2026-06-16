'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/admin/auth'

type Result<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

const ReviewIdsSchema = z.array(z.string().min(1)).min(1).max(100)

export async function approveReviewAction(
  reviewId: string,
): Promise<Result> {
  try {
    const admin = await requireRole(['admin', 'editor'])
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { slug: true } } },
    })
    if (!review) return { ok: false, error: 'Avaliação não encontrada' }

    await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: { action: 'review_approve', adminId: admin.id, reviewId },
      },
    })

    revalidatePath('/admin/avaliacoes')
    revalidatePath(`/produto/${review.product.slug}`)
    revalidatePath('/avaliacoes')
    return { ok: true }
  } catch (error) {
    console.error('[approveReview]', error)
    return { ok: false, error: 'Erro ao aprovar' }
  }
}

export async function rejectReviewAction(reviewId: string): Promise<Result> {
  try {
    const admin = await requireRole(['admin', 'editor'])
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { slug: true } } },
    })
    if (!review) return { ok: false, error: 'Avaliação não encontrada' }

    await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: false, isVerifiedPurchase: false },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: { action: 'review_reject', adminId: admin.id, reviewId },
      },
    })

    revalidatePath('/admin/avaliacoes')
    revalidatePath(`/produto/${review.product.slug}`)
    revalidatePath('/avaliacoes')
    return { ok: true }
  } catch (error) {
    console.error('[rejectReview]', error)
    return { ok: false, error: 'Erro ao rejeitar' }
  }
}

export async function toggleVerifiedAction(
  reviewId: string,
  verified: boolean,
): Promise<Result> {
  try {
    const admin = await requireRole(['admin', 'editor'])
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { slug: true } } },
    })
    if (!review) return { ok: false, error: 'Avaliação não encontrada' }

    await prisma.review.update({
      where: { id: reviewId },
      data: { isVerifiedPurchase: verified },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: verified
            ? 'review_mark_verified'
            : 'review_unmark_verified',
          adminId: admin.id,
          reviewId,
        },
      },
    })

    revalidatePath('/admin/avaliacoes')
    revalidatePath(`/produto/${review.product.slug}`)
    revalidatePath('/avaliacoes')
    return { ok: true }
  } catch (error) {
    console.error('[toggleVerified]', error)
    return { ok: false, error: 'Erro ao alterar' }
  }
}

export async function deleteReviewAction(reviewId: string): Promise<Result> {
  try {
    const admin = await requireRole(['admin'])
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { product: { select: { slug: true } } },
    })
    if (!review) return { ok: false, error: 'Avaliação não encontrada' }

    await prisma.review.delete({ where: { id: reviewId } })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: { action: 'review_delete', adminId: admin.id, reviewId },
      },
    })

    revalidatePath('/admin/avaliacoes')
    revalidatePath(`/produto/${review.product.slug}`)
    revalidatePath('/avaliacoes')
    return { ok: true }
  } catch (error) {
    console.error('[deleteReview]', error)
    return { ok: false, error: 'Erro ao excluir' }
  }
}

export async function bulkApproveAction(
  reviewIds: string[],
): Promise<Result<{ count: number }>> {
  try {
    const admin = await requireRole(['admin', 'editor'])
    const parsed = ReviewIdsSchema.safeParse(reviewIds)
    if (!parsed.success) return { ok: false, error: 'Lista inválida' }

    const result = await prisma.review.updateMany({
      where: { id: { in: parsed.data } },
      data: { isApproved: true },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'review_bulk_approve',
          adminId: admin.id,
          count: result.count,
          reviewIds: parsed.data,
        },
      },
    })

    revalidatePath('/admin/avaliacoes')
    revalidatePath('/avaliacoes')
    return { ok: true, data: { count: result.count } }
  } catch (error) {
    console.error('[bulkApprove]', error)
    return { ok: false, error: 'Erro ao aprovar em massa' }
  }
}

export async function bulkRejectAction(
  reviewIds: string[],
): Promise<Result<{ count: number }>> {
  try {
    const admin = await requireRole(['admin', 'editor'])
    const parsed = ReviewIdsSchema.safeParse(reviewIds)
    if (!parsed.success) return { ok: false, error: 'Lista inválida' }

    const result = await prisma.review.updateMany({
      where: { id: { in: parsed.data } },
      data: { isApproved: false, isVerifiedPurchase: false },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'review_bulk_reject',
          adminId: admin.id,
          count: result.count,
          reviewIds: parsed.data,
        },
      },
    })

    revalidatePath('/admin/avaliacoes')
    revalidatePath('/avaliacoes')
    return { ok: true, data: { count: result.count } }
  } catch (error) {
    console.error('[bulkReject]', error)
    return { ok: false, error: 'Erro ao rejeitar em massa' }
  }
}

export async function bulkDeleteAction(
  reviewIds: string[],
): Promise<Result<{ count: number }>> {
  try {
    const admin = await requireRole(['admin'])
    const parsed = ReviewIdsSchema.safeParse(reviewIds)
    if (!parsed.success) return { ok: false, error: 'Lista inválida' }

    const result = await prisma.review.deleteMany({
      where: { id: { in: parsed.data } },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'review_bulk_delete',
          adminId: admin.id,
          count: result.count,
        },
      },
    })

    revalidatePath('/admin/avaliacoes')
    revalidatePath('/avaliacoes')
    return { ok: true, data: { count: result.count } }
  } catch (error) {
    console.error('[bulkDelete]', error)
    return { ok: false, error: 'Erro ao excluir em massa' }
  }
}
