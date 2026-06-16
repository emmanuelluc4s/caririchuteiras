import { z } from 'zod'

export const VariantSchema = z.object({
  id: z.string().optional(),
  color: z.string().min(1, 'Cor obrigatória').max(40),
  colorHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Hex inválido (#RRGGBB)')
    .optional()
    .nullable(),
  size: z.string().min(1, 'Tamanho obrigatório').max(10),
  stock: z.number().int().min(0).max(9999),
})

export const ProductImageInputSchema = z.object({
  id: z.string().optional(),
  urlOriginal: z.string().url(),
  urlLarge: z.string().url(),
  urlMedium: z.string().url(),
  urlThumb: z.string().url(),
  alt: z.string().max(200).optional().nullable(),
  order: z.number().int().min(0),
})

export const ProductFormSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(200),
  slug: z
    .string()
    .min(2, 'Slug obrigatório')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  sku: z.string().min(1, 'SKU obrigatório').max(50),
  brand: z.string().min(1, 'Marca obrigatória').max(80),
  categoryId: z.string().min(1, 'Categoria obrigatória'),

  price: z.number().positive('Preço deve ser positivo').max(999999),
  promoPrice: z.number().positive().max(999999).optional().nullable(),
  installments: z.number().int().min(1).max(24).optional().nullable(),
  installmentFree: z.boolean().default(false),

  description: z.string().max(50000).optional().nullable(),

  isActive: z.boolean().default(true),
  isNew: z.boolean().default(false),
  isBestSellerManual: z.boolean().default(false),

  material: z.string().max(120).optional().nullable(),
  weight: z.string().max(40).optional().nullable(),
  collar: z.string().max(40).optional().nullable(),
  technology: z.string().max(200).optional().nullable(),
  useIndication: z.string().max(200).optional().nullable(),
  warranty: z.string().max(120).optional().nullable(),
  origin: z.string().max(80).optional().nullable(),

  metaTitle: z.string().max(70).optional().nullable(),
  metaDescription: z.string().max(170).optional().nullable(),

  images: z.array(ProductImageInputSchema).max(10, 'Máximo 10 imagens'),
  variants: z.array(VariantSchema).max(100, 'Muitas variantes'),
})

export type ProductFormValues = z.infer<typeof ProductFormSchema>
export type VariantValues = z.infer<typeof VariantSchema>
export type ImageValues = z.infer<typeof ProductImageInputSchema>

export const ProductFormRefined = ProductFormSchema.refine(
  (d) => d.promoPrice == null || d.promoPrice < d.price,
  {
    message: 'Preço promocional deve ser menor que o preço normal',
    path: ['promoPrice'],
  },
)
