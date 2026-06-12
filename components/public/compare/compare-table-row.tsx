import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  label: string
  columns: Array<{
    productId: string
    content: React.ReactNode
    highlight?: boolean
  }>
  highlightLabel?: string
  className?: string
}

export function CompareTableRow({
  label,
  columns,
  highlightLabel,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'grid items-stretch border-b border-border',
        'grid-cols-[120px_repeat(var(--compare-cols),minmax(0,1fr))] md:grid-cols-[160px_repeat(var(--compare-cols),minmax(0,1fr))]',
        className,
      )}
    >
      <div className="flex items-center border-r border-border bg-bg-secondary/50 px-3 py-4 text-xs font-medium uppercase tracking-wider text-gray-400 md:px-4 md:text-sm">
        {label}
      </div>
      {columns.map((col) => (
        <div
          key={col.productId}
          className={cn(
            'relative border-r border-border px-3 py-4 text-sm last:border-r-0 md:px-4',
            col.highlight && 'bg-neon/5',
          )}
        >
          {col.highlight && highlightLabel && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-full border border-neon/30 bg-neon/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neon">
              <Trophy className="h-2.5 w-2.5" />
              {highlightLabel}
            </span>
          )}
          {col.content}
        </div>
      ))}
    </div>
  )
}
