import slugify from 'slugify'
import { prisma } from '@/lib/prisma'

export function generateSlug(name: string): string {
  return slugify(name, {
    lower: true,
    strict: true,
    locale: 'pt',
    trim: true,
  })
}

/**
 * Garante slug único, adicionando sufixo numérico se necessário.
 * `excludeId` permite ignorar o próprio produto na edição.
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let candidate = baseSlug
  let suffix = 1
  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    })
    if (!existing) return candidate
    suffix++
    candidate = `${baseSlug}-${suffix}`
    if (suffix > 1000) {
      throw new Error('Não foi possível gerar slug único')
    }
  }
}
