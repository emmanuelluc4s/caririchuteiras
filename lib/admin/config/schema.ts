import { z } from 'zod'

const phoneRegex = /^\+?[\d\s()-]{10,20}$/

const urlOrEmpty = z
  .string()
  .max(500)
  .refine(
    (v) => !v || /^https?:\/\/.+/.test(v),
    'URL deve começar com http:// ou https://',
  )
  .optional()
  .nullable()

export const SiteConfigSchema = z.object({
  storeName: z.string().min(2).max(80),
  storeTagline: z.string().max(120).optional().nullable(),
  storeDescription: z.string().max(500).optional().nullable(),
  storeEmail: z
    .string()
    .email('Email inválido')
    .max(200)
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  storeAddress: z.string().max(300).optional().nullable(),
  storeCity: z.string().max(80).optional().nullable(),

  whatsappNumber: z
    .string()
    .regex(phoneRegex, 'Use formato +55 88 99999-9999')
    .max(30),
  whatsappBusinessHours: z.string().max(200).optional().nullable(),
  whatsappWelcomeMessage: z.string().max(500).optional().nullable(),

  instagramUrl: urlOrEmpty,
  facebookUrl: urlOrEmpty,
  tiktokUrl: urlOrEmpty,
  youtubeUrl: urlOrEmpty,
  twitterUrl: urlOrEmpty,

  promoBarMessages: z
    .array(z.string().min(1).max(120))
    .max(8, 'Máximo 8 mensagens')
    .default([]),
  promoBarEnabled: z.boolean().default(true),

  metaPixelId: z.string().max(50).optional().nullable(),
  ga4Id: z.string().max(50).optional().nullable(),
  clarityId: z.string().max(50).optional().nullable(),

  defaultMetaTitle: z.string().max(70).optional().nullable(),
  defaultMetaDescription: z.string().max(170).optional().nullable(),
  ogImageUrl: urlOrEmpty,

  isMaintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().max(500).optional().nullable(),
})

export type SiteConfigValues = z.infer<typeof SiteConfigSchema>
