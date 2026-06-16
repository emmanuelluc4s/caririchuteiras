import { z } from 'zod'

export const CategoryFormSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(80),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
  description: z.string().max(500).nullish(),
  imageUrl: z.string().url().nullish(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  metaTitle: z.string().max(70).nullish(),
  metaDescription: z.string().max(170).nullish(),
})

export type CategoryFormValues = z.infer<typeof CategoryFormSchema>
