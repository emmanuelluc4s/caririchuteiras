'use server'

import crypto from 'crypto'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { uploadReviewImage } from '@/lib/storage/upload-review-image'

const ReviewSchema = z.object({
  productId: z.string().min(1),
  productSlug: z.string().min(1),
  customerName: z.string().min(2, 'Nome muito curto').max(80),
  city: z.string().min(2).max(80).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, 'Comentário muito curto').max(2000),
  honeypot: z.string().max(0).optional(),
})

type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string }

export async function submitReviewAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const parsed = ReviewSchema.safeParse({
      productId: formData.get('productId'),
      productSlug: formData.get('productSlug'),
      customerName: String(formData.get('customerName') ?? '').trim(),
      city: String(formData.get('city') ?? '').trim() || null,
      rating: Number(formData.get('rating') ?? 0),
      comment: String(formData.get('comment') ?? '').trim(),
      honeypot: String(formData.get('website') ?? ''),
    })

    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      return { ok: false, error: issue?.message ?? 'Dados inválidos' }
    }

    const { honeypot, productId, productSlug, ...data } = parsed.data
    if (honeypot && honeypot.length > 0) {
      return { ok: true, message: 'Avaliação enviada para moderação.' }
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
    })
    if (!product) {
      return { ok: false, error: 'Produto não encontrado' }
    }

    const hdrs = await headers()
    const ip =
      hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      hdrs.get('x-real-ip') ??
      'unknown'
    const ipHash = crypto
      .createHash('sha256')
      .update(ip)
      .digest('hex')
      .slice(0, 32)

    const recent = await prisma.review.findFirst({
      where: {
        productId,
        ipHash,
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })
    if (recent) {
      return {
        ok: false,
        error: 'Você já enviou uma avaliação para este produto recentemente.',
      }
    }

    let imageUrl: string | null = null
    const imageFile = formData.get('image')
    if (imageFile && imageFile instanceof File && imageFile.size > 0) {
      const upload = await uploadReviewImage(imageFile, productId)
      if (!upload.ok) {
        return { ok: false, error: upload.error }
      }
      imageUrl = upload.url
    }

    await prisma.review.create({
      data: {
        productId,
        customerName: data.customerName,
        city: data.city,
        rating: data.rating,
        comment: data.comment,
        imageUrl,
        isApproved: false,
        isVerifiedPurchase: false,
        ipHash,
      },
    })

    revalidatePath(`/produto/${productSlug}`)
    revalidatePath('/avaliacoes')

    return {
      ok: true,
      message: imageUrl
        ? 'Avaliação enviada com foto! Será publicada após aprovação.'
        : 'Avaliação enviada! Será publicada após aprovação.',
    }
  } catch (error) {
    console.error('[submitReview] error:', error)
    return { ok: false, error: 'Erro ao enviar. Tente novamente.' }
  }
}
