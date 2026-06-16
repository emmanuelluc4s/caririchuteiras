'use server'

import crypto from 'crypto'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/admin/auth'
import {
  CategoryFormSchema,
  type CategoryFormValues,
} from '@/lib/admin/categories/schema'

type Result<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

async function ensureUniqueCategorySlug(
  base: string,
  excludeId?: string,
): Promise<string> {
  let candidate = base
  let suffix = 1
  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    })
    if (!existing) return candidate
    suffix++
    candidate = `${base}-${suffix}`
    if (suffix > 100) throw new Error('Não foi possível gerar slug único')
  }
}

let _supabaseAdmin: Awaited<
  ReturnType<typeof getSupabaseAdminClient>
> | null = null

async function getSupabaseAdminClient() {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

async function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = await getSupabaseAdminClient()
  }
  return _supabaseAdmin
}

export async function saveCategoryAction(
  categoryId: string | null,
  values: CategoryFormValues,
): Promise<Result<{ id: string; slug: string }>> {
  try {
    const admin = await requireRole(['admin', 'editor'])

    const parsed = CategoryFormSchema.safeParse(values)
    if (!parsed.success) {
      return {
        ok: false,
        error: parsed.error.issues[0]?.message ?? 'Dados inválidos',
      }
    }

    const uniqueSlug = await ensureUniqueCategorySlug(
      parsed.data.slug,
      categoryId ?? undefined,
    )

    const data = {
      name: parsed.data.name,
      slug: uniqueSlug,
      description: parsed.data.description ?? null,
      imageUrl: parsed.data.imageUrl ?? null,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
      metaTitle: parsed.data.metaTitle ?? null,
      metaDescription: parsed.data.metaDescription ?? null,
    }

    let id = categoryId
    let slug = uniqueSlug

    if (categoryId) {
      const updated = await prisma.category.update({
        where: { id: categoryId },
        data,
        select: { id: true, slug: true },
      })
      id = updated.id
      slug = updated.slug
    } else {
      const created = await prisma.category.create({
        data,
        select: { id: true, slug: true },
      })
      id = created.id
      slug = created.slug
    }

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: categoryId ? 'category_update' : 'category_create',
          adminId: admin.id,
          categoryId: id!,
        },
      },
    })

    revalidatePath('/admin/categorias')
    revalidatePath(`/categoria/${slug}`)
    revalidatePath('/')

    return { ok: true, data: { id: id!, slug } }
  } catch (error) {
    console.error('[saveCategory]', error)
    return { ok: false, error: 'Erro ao salvar categoria' }
  }
}

export async function toggleCategoryActiveAction(
  categoryId: string,
): Promise<Result<{ isActive: boolean }>> {
  try {
    const admin = await requireRole(['admin', 'editor'])

    const cat = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { isActive: true, slug: true },
    })
    if (!cat) return { ok: false, error: 'Categoria não encontrada' }

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: !cat.isActive },
      select: { isActive: true },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: updated.isActive
            ? 'category_activate'
            : 'category_deactivate',
          adminId: admin.id,
          categoryId,
        },
      },
    })

    revalidatePath('/admin/categorias')
    revalidatePath(`/categoria/${cat.slug}`)
    revalidatePath('/')

    return { ok: true, data: { isActive: updated.isActive } }
  } catch (error) {
    console.error('[toggleCategoryActive]', error)
    return { ok: false, error: 'Erro ao alternar status' }
  }
}

export async function deleteCategoryAction(
  categoryId: string,
): Promise<Result> {
  try {
    const admin = await requireRole(['admin'])

    const productsCount = await prisma.product.count({
      where: { categoryId },
    })

    if (productsCount > 0) {
      return {
        ok: false,
        error: `Esta categoria tem ${productsCount} produto(s) vinculado(s). Mova-os para outra categoria antes de excluir.`,
      }
    }

    await prisma.category.delete({ where: { id: categoryId } })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'category_delete',
          adminId: admin.id,
          categoryId,
        },
      },
    })

    revalidatePath('/admin/categorias')
    revalidatePath('/')

    return { ok: true }
  } catch (error) {
    console.error('[deleteCategory]', error)
    return { ok: false, error: 'Erro ao excluir categoria' }
  }
}

const ReorderSchema = z.array(
  z.object({
    id: z.string(),
    order: z.number().int().min(0),
  }),
)

export async function reorderCategoriesAction(
  orderedIds: Array<{ id: string; order: number }>,
): Promise<Result> {
  try {
    const admin = await requireRole(['admin', 'editor'])

    const parsed = ReorderSchema.safeParse(orderedIds)
    if (!parsed.success) return { ok: false, error: 'Dados inválidos' }

    await prisma.$transaction(
      parsed.data.map((item) =>
        prisma.category.update({
          where: { id: item.id },
          data: { order: item.order },
        }),
      ),
    )

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'category_reorder',
          adminId: admin.id,
          count: orderedIds.length,
        },
      },
    })

    revalidatePath('/admin/categorias')
    revalidatePath('/')

    return { ok: true }
  } catch (error) {
    console.error('[reorderCategories]', error)
    return { ok: false, error: 'Erro ao reordenar' }
  }
}

export async function uploadCategoryImageAction(
  formData: FormData,
): Promise<Result<{ url: string }>> {
  try {
    await requireRole(['admin', 'editor'])

    const file = formData.get('image')
    if (!file || !(file instanceof File)) {
      return { ok: false, error: 'Arquivo inválido' }
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return { ok: false, error: 'Use JPG, PNG ou WebP' }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, error: 'Máximo 5MB' }
    }

    const ext = file.type.includes('png')
      ? 'png'
      : file.type.includes('webp')
        ? 'webp'
        : 'jpg'
    const fileName = `categories/${crypto.randomBytes(10).toString('hex')}-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const supabase = await getSupabaseAdmin()
    const { data, error } = await supabase.storage
      .from('products')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('[uploadCategoryImage] supabase', error)
      return { ok: false, error: 'Erro ao salvar imagem' }
    }

    const { data: publicUrl } = supabase.storage
      .from('products')
      .getPublicUrl(data.path)

    return { ok: true, data: { url: publicUrl.publicUrl } }
  } catch (error) {
    console.error('[uploadCategoryImage]', error)
    return { ok: false, error: 'Erro ao fazer upload' }
  }
}
