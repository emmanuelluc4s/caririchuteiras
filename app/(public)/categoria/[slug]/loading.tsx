import { ProductGridSkeleton } from '@/components/public/skeleton/product-card-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function CategoryLoading() {
  return (
    <>
      <section className="relative w-full overflow-hidden bg-bg-secondary">
        <div className="mx-auto max-w-7xl space-y-3 px-4 py-12 md:px-6 md:py-20">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-14 w-2/3 md:h-20" />
          <Skeleton className="mt-3 h-4 w-1/3" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
          <aside className="hidden space-y-6 lg:block">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2 border-b border-border pb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </aside>

          <div>
            <div className="mb-6 flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-44" />
            </div>
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </>
  )
}
