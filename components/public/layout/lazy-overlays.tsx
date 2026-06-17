'use client'

import dynamic from 'next/dynamic'

type PopularProduct = {
  id: string
  slug: string
  name: string
  brand: string
  imageUrl?: string
  categoryName: string
}

const WhatsappCartDrawer = dynamic(
  () =>
    import(
      '@/components/public/whatsapp/whatsapp-cart-drawer'
    ).then((m) => ({ default: m.WhatsappCartDrawer })),
  { ssr: false, loading: () => null },
)

const SearchModal = dynamic(
  () =>
    import('@/components/public/search/search-modal').then((m) => ({
      default: m.SearchModal,
    })),
  { ssr: false, loading: () => null },
)

const CompareBottomBarWrapper = dynamic(
  () =>
    import(
      '@/components/public/compare/compare-bottom-bar-wrapper'
    ).then((m) => ({ default: m.CompareBottomBarWrapper })),
  { ssr: false, loading: () => null },
)

const QuickViewModal = dynamic(
  () =>
    import('@/components/public/quick-view/quick-view-modal').then((m) => ({
      default: m.QuickViewModal,
    })),
  { ssr: false, loading: () => null },
)

const ExitIntentModal = dynamic(
  () =>
    import(
      '@/components/public/conversion/exit-intent-modal'
    ).then((m) => ({ default: m.ExitIntentModal })),
  { ssr: false, loading: () => null },
)

type Props = {
  popularSearches: string[]
  popularProducts: PopularProduct[]
}

export function LazyOverlays({ popularSearches, popularProducts }: Props) {
  return (
    <>
      <WhatsappCartDrawer />
      <SearchModal
        popularSearches={popularSearches}
        popularProducts={popularProducts}
      />
      <CompareBottomBarWrapper />
      <QuickViewModal />
      <ExitIntentModal />
    </>
  )
}
