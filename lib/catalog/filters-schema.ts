import { z } from 'zod'

export const SortOptionSchema = z.enum([
  'best',
  'newest',
  'price-asc',
  'price-desc',
  'discount',
  'name-asc',
])

export type SortOption = z.infer<typeof SortOptionSchema>

export const SORT_LABELS: Record<SortOption, string> = {
  best: 'Mais vendidos',
  newest: 'Novidades',
  'price-asc': 'Menor preço',
  'price-desc': 'Maior preço',
  discount: 'Maior desconto',
  'name-asc': 'A-Z',
}

/**
 * Schema dos filtros parseados da URL. Tudo opcional — valores ausentes = sem filtro.
 */
export const CatalogFiltersSchema = z.object({
  brands: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  onlyPromo: z.boolean().default(false),
  onlyNew: z.boolean().default(false),
  onlyInStock: z.boolean().default(true),
  sort: SortOptionSchema.default('best'),
  page: z.number().int().positive().default(1),
})

export type CatalogFilters = z.infer<typeof CatalogFiltersSchema>

export const PRODUCTS_PER_PAGE = 24
