export const COMPARE_MAX_ITEMS = 4
export const COMPARE_STORAGE_KEY = 'cc-compare'

/**
 * Estrutura mínima persistida — apenas o ID.
 * Os detalhes do produto são buscados sob demanda no servidor.
 */
export type CompareItem = {
  productId: string
  addedAt: number
}
