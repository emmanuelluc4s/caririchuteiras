import { CatalogFiltersSchema, type CatalogFilters } from './filters-schema'

/**
 * Converte searchParams (do Next.js) em CatalogFilters tipado e validado.
 * Tolerante a entradas inválidas — sempre retorna valores válidos.
 */
export function parseFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const get = (key: string): string | undefined => {
    const v = searchParams[key]
    return Array.isArray(v) ? v[0] : v
  }
  const getArray = (key: string): string[] => {
    const raw = get(key)
    if (!raw) return []
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  const getNum = (key: string): number | undefined => {
    const raw = get(key)
    if (!raw) return undefined
    const n = Number(raw)
    return Number.isFinite(n) ? n : undefined
  }
  const getBool = (key: string): boolean => {
    const raw = get(key)
    return raw === '1' || raw === 'true'
  }

  const parsed = CatalogFiltersSchema.safeParse({
    brands: getArray('marca'),
    colors: getArray('cor'),
    sizes: getArray('num'),
    minPrice: getNum('precoMin'),
    maxPrice: getNum('precoMax'),
    onlyPromo: getBool('promo'),
    onlyNew: getBool('novo'),
    onlyInStock: get('estoque') !== '0',
    sort: get('ordem') ?? 'best',
    page: getNum('pagina') ?? 1,
  })

  if (parsed.success) return parsed.data
  return CatalogFiltersSchema.parse({})
}

/**
 * Converte CatalogFilters de volta em searchParams (string).
 * Omite valores padrão para manter a URL limpa.
 */
export function serializeFiltersToSearchParams(
  filters: Partial<CatalogFilters>,
): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.brands?.length) params.set('marca', filters.brands.join(','))
  if (filters.colors?.length) params.set('cor', filters.colors.join(','))
  if (filters.sizes?.length) params.set('num', filters.sizes.join(','))
  if (filters.minPrice != null) params.set('precoMin', String(filters.minPrice))
  if (filters.maxPrice != null) params.set('precoMax', String(filters.maxPrice))
  if (filters.onlyPromo) params.set('promo', '1')
  if (filters.onlyNew) params.set('novo', '1')
  if (filters.onlyInStock === false) params.set('estoque', '0')
  if (filters.sort && filters.sort !== 'best') params.set('ordem', filters.sort)
  if (filters.page && filters.page > 1) params.set('pagina', String(filters.page))

  return params
}

export function countActiveFilters(filters: CatalogFilters): number {
  let count = 0
  count += filters.brands.length
  count += filters.colors.length
  count += filters.sizes.length
  if (filters.minPrice != null || filters.maxPrice != null) count++
  if (filters.onlyPromo) count++
  if (filters.onlyNew) count++
  if (filters.onlyInStock === false) count++
  return count
}
