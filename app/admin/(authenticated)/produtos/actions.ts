'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/admin/auth'
import {
  ProductFormRefined,
  type ProductFormValues,
} from '@/lib/admin/products/schema'
import {
  uploadProductImage,
  deleteProductImage,
  copyProductImage,
} from '@/lib/admin/products/storage'
import { ensureUniqueSlug, generateSlug } from '@/lib/admin/products/slug'

type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string }

// ============================================================
// CREATE / UPDATE
// ============================================================
export async function saveProductAction(
  productId: string | null,
  values: ProductFormValues,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const admin = await requireRole(['admin', 'editor'])
    const parsed = ProductFormRefined.safeParse(values)
    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      return { ok: false, error: issue?.message ?? 'Dados inválidos' }
    }
    const data = parsed.data
    const uniqueSlug = await ensureUniqueSlug(
      data.slug,
      productId ?? undefined,
    )

    const skuExists = await prisma.product.findFirst({
      where: {
        sku: data.sku,
        ...(productId ? { NOT: { id: productId } } : {}),
      },
      select: { id: true },
    })
    if (skuExists) {
      return {
        ok: false,
        error: `SKU "${data.sku}" já existe em outro produto`,
      }
    }

    let savedId = productId
    let savedSlug = uniqueSlug

    if (productId) {
      // UPDATE
      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: productId },
          data: {
            name: data.name,
            slug: uniqueSlug,
            sku: data.sku,
            brand: data.brand,
            categoryId: data.categoryId,
            price: data.price,
            promoPrice: data.promoPrice,
            installments: data.installments,
            installmentFree: data.installmentFree,
            description: data.description,
            isActive: data.isActive,
            isNew: data.isNew,
            isBestSellerManual: data.isBestSellerManual,
            material: data.material,
            weight: data.weight,
            collar: data.collar,
            technology: data.technology,
            useIndication: data.useIndication,
            warranty: data.warranty,
            origin: data.origin,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
          },
        })

        const existingImages = await tx.productImage.findMany({
          where: { productId },
        })
        const sentIds = new Set(
          data.images.map((i) => i.id).filter(Boolean) as string[],
        )
        const toDelete = existingImages.filter((img) => !sentIds.has(img.id))
        for (const img of toDelete) {
          await deleteProductImage(img.urlOriginal)
          await tx.productImage.delete({ where: { id: img.id } })
        }
        for (const img of data.images) {
          if (img.id) {
            await tx.productImage.update({
              where: { id: img.id },
              data: {
                urlOriginal: img.urlOriginal,
                urlLarge: img.urlLarge,
                urlMedium: img.urlMedium,
                urlThumb: img.urlThumb,
                alt: img.alt,
                order: img.order,
              },
            })
          } else {
            await tx.productImage.create({
              data: {
                productId,
                urlOriginal: img.urlOriginal,
                urlLarge: img.urlLarge,
                urlMedium: img.urlMedium,
                urlThumb: img.urlThumb,
                alt: img.alt,
                order: img.order,
              },
            })
          }
        }

        const existingVariants = await tx.productVariant.findMany({
          where: { productId },
        })
        const sentVariantIds = new Set(
          data.variants.map((v) => v.id).filter(Boolean) as string[],
        )
        const variantsToDelete = existingVariants.filter(
          (v) => !sentVariantIds.has(v.id),
        )
        if (variantsToDelete.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: variantsToDelete.map((v) => v.id) } },
          })
        }
        for (const variant of data.variants) {
          if (variant.id) {
            await tx.productVariant.update({
              where: { id: variant.id },
              data: {
                color: variant.color,
                colorHex: variant.colorHex,
                size: variant.size,
                stock: variant.stock,
              },
            })
          } else {
            await tx.productVariant.create({
              data: {
                productId,
                color: variant.color,
                colorHex: variant.colorHex,
                size: variant.size,
                stock: variant.stock,
              },
            })
          }
        }
      })
    } else {
      // CREATE
      const created = await prisma.product.create({
        data: {
          name: data.name,
          slug: uniqueSlug,
          sku: data.sku,
          brand: data.brand,
          categoryId: data.categoryId,
          price: data.price,
          promoPrice: data.promoPrice,
          installments: data.installments,
          installmentFree: data.installmentFree,
          description: data.description,
          isActive: data.isActive,
          isNew: data.isNew,
          isBestSellerManual: data.isBestSellerManual,
          material: data.material,
          weight: data.weight,
          collar: data.collar,
          technology: data.technology,
          useIndication: data.useIndication,
          warranty: data.warranty,
          origin: data.origin,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          images: {
            create: data.images.map((img) => ({
              urlOriginal: img.urlOriginal,
              urlLarge: img.urlLarge,
              urlMedium: img.urlMedium,
              urlThumb: img.urlThumb,
              alt: img.alt,
              order: img.order,
            })),
          },
          variants: {
            create: data.variants.map((v) => ({
              color: v.color,
              colorHex: v.colorHex,
              size: v.size,
              stock: v.stock,
            })),
          },
        },
      })
      savedId = created.id
      savedSlug = created.slug
    }

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: productId ? 'product_update' : 'product_create',
          adminId: admin.id,
          productId: savedId,
        },
      },
    })

    revalidatePath('/admin/produtos')
    revalidatePath(`/produto/${savedSlug}`)
    revalidatePath('/')

    return { ok: true, data: { id: savedId!, slug: savedSlug } }
  } catch (error) {
    console.error('[saveProduct] error:', error)
    return { ok: false, error: 'Erro ao salvar produto' }
  }
}

// ============================================================
// TOGGLE ACTIVE
// ============================================================
export async function toggleProductActiveAction(
  productId: string,
): Promise<ActionResult<{ isActive: boolean }>> {
  try {
    const admin = await requireRole(['admin', 'editor'])
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true, slug: true },
    })
    if (!product) return { ok: false, error: 'Produto não encontrado' }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: { isActive: !product.isActive },
      select: { isActive: true },
    })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: updated.isActive ? 'product_activate' : 'product_deactivate',
          adminId: admin.id,
          productId,
        },
      },
    })

    revalidatePath('/admin/produtos')
    revalidatePath(`/produto/${product.slug}`)
    revalidatePath('/')

    return { ok: true, data: { isActive: updated.isActive } }
  } catch (error) {
    console.error('[toggleActive] error:', error)
    return { ok: false, error: 'Erro ao atualizar status' }
  }
}

// ============================================================
// DUPLICATE
// ============================================================
export async function duplicateProductAction(
  productId: string,
): Promise<ActionResult<{ id: string }>> {
  try {
    const admin = await requireRole(['admin', 'editor'])
    const original = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true, variants: true },
    })
    if (!original) return { ok: false, error: 'Produto não encontrado' }

    const newName = `${original.name} (cópia)`
    const newSlug = await ensureUniqueSlug(generateSlug(newName))
    const newSku = `${original.sku}-COPY-${Date.now().toString(36).toUpperCase().slice(-5)}`

    const created = await prisma.product.create({
      data: {
        name: newName,
        slug: newSlug,
        sku: newSku,
        brand: original.brand,
        categoryId: original.categoryId,
        price: original.price,
        promoPrice: original.promoPrice,
        installments: original.installments,
        installmentFree: original.installmentFree,
        description: original.description,
        isActive: false,
        isNew: original.isNew,
        isBestSellerManual: false,
        material: original.material,
        weight: original.weight,
        collar: original.collar,
        technology: original.technology,
        useIndication: original.useIndication,
        warranty: original.warranty,
        origin: original.origin,
        metaTitle: original.metaTitle,
        metaDescription: original.metaDescription,
        variants: {
          create: original.variants.map((v) => ({
            color: v.color,
            colorHex: v.colorHex,
            size: v.size,
            stock: v.stock,
          })),
        },
      },
    })

    if (original.images.length > 0) {
      const copiedImages = await Promise.all(
        original.images.map(async (img) => {
          const newUrl = await copyProductImage(img.urlOriginal, created.id)
          if (!newUrl) return null
          return {
            productId: created.id,
            urlOriginal: newUrl,
            urlLarge: newUrl,
            urlMedium: newUrl,
            urlThumb: newUrl,
            alt: img.alt,
            order: img.order,
          }
        }),
      )
      const valid = copiedImages.filter(
        (i): i is NonNullable<typeof i> => i !== null,
      )
      if (valid.length > 0) {
        await prisma.productImage.createMany({ data: valid })
      }
    }

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'product_duplicate',
          adminId: admin.id,
          sourceId: productId,
          newId: created.id,
        },
      },
    })

    revalidatePath('/admin/produtos')
    return { ok: true, data: { id: created.id } }
  } catch (error) {
    console.error('[duplicate] error:', error)
    return { ok: false, error: 'Erro ao duplicar produto' }
  }
}

// ============================================================
// DELETE (hard, apenas admin)
// ============================================================
export async function deleteProductAction(
  productId: string,
): Promise<ActionResult> {
  try {
    const admin = await requireRole(['admin'])
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: { select: { urlOriginal: true } } },
    })
    if (!product) return { ok: false, error: 'Produto não encontrado' }

    for (const img of product.images) {
      await deleteProductImage(img.urlOriginal)
    }

    await prisma.product.delete({ where: { id: productId } })

    await prisma.siteEvent.create({
      data: {
        type: 'admin_action',
        metadata: {
          action: 'product_delete',
          adminId: admin.id,
          productId,
          productName: product.name,
        },
      },
    })

    revalidatePath('/admin/produtos')
    revalidatePath('/')
    return { ok: true }
  } catch (error) {
    console.error('[deleteProduct] error:', error)
    return { ok: false, error: 'Erro ao excluir produto' }
  }
}

// ============================================================
// UPLOAD IMAGE
// ============================================================
export async function uploadProductImageAction(
  productId: string | 'pending',
  formData: FormData,
): Promise<
  ActionResult<{
    urlOriginal: string
    urlLarge: string
    urlMedium: string
    urlThumb: string
  }>
> {
  try {
    await requireRole(['admin', 'editor'])
    const file = formData.get('image')
    if (!file || !(file instanceof File)) {
      return { ok: false, error: 'Arquivo não encontrado' }
    }
    const id = productId === 'pending' ? `temp-${Date.now()}` : productId
    const result = await uploadProductImage(file, id)
    if (!result.ok) return result
    return { ok: true, data: result.urls }
  } catch (error) {
    console.error('[uploadImage] error:', error)
    return { ok: false, error: 'Erro ao fazer upload' }
  }
}

// ============================================================
// CHECK SLUG
// ============================================================
export async function checkSlugAvailableAction(
  slug: string,
  excludeId?: string,
): Promise<{ available: boolean; suggestion?: string }> {
  await requireRole(['admin', 'editor', 'viewer'])
  const existing = await prisma.product.findFirst({
    where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    select: { id: true },
  })
  if (!existing) return { available: true }
  const suggestion = await ensureUniqueSlug(slug, excludeId)
  return { available: false, suggestion }
}
