export type RecentlyViewedItem = {
  productId: string
  slug: string
  name: string
  brand: string
  imageUrl?: string
  price: number
  promoPrice?: number
  viewedAt: number
}

export const RECENTLY_VIEWED_MAX = 8
export const RECENTLY_VIEWED_STORAGE_KEY = 'cc-recently-viewed'
