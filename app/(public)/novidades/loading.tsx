import { Skeleton } from '@/components/ui/skeleton'
import { ProductGridSkeleton } from '@/components/public/skeleton/product-card-skeleton'

export default function NovidadesLoading() {
  return (
    <>
      <section className="border-b border-border bg-bg-secondary py-10 md:py-16">
        <div className="mx-auto max-w-7xl space-y-3 px-4 md:px-6">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-14 w-2/3 md:h-20" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
          <aside className="hidden space-y-4 lg:block">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </aside>
          <div>
            <Skeleton className="mb-6 h-10 w-44" />
            <ProductGridSkeleton count={12} />
          </div>
        </div>
      </div>
    </>
  )
}
