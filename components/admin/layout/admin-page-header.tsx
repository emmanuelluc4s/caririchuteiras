type Props = {
  title: string
  description?: string
  action?: React.ReactNode
}

export function AdminPageHeader({ title, description, action }: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-tight md:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </header>
  )
}
