'use client'

import { MessageSquare, Phone, Package } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatBRL, cn } from '@/lib/utils'
import type { RecentLead } from '@/lib/admin/dashboard/types'

type Props = {
  leads: RecentLead[]
}

const SOURCE_BADGES: Record<string, { label: string; className: string }> = {
  floating: { label: 'Flutuante', className: 'bg-neon/10 text-neon' },
  header: { label: 'Header', className: 'bg-blue-500/10 text-blue-400' },
  product: { label: 'Produto', className: 'bg-success/10 text-success' },
  cart: { label: 'Carrinho', className: 'bg-warning/10 text-warning' },
  'exit-intent': {
    label: 'Exit Intent',
    className: 'bg-pink-500/10 text-pink-400',
  },
  'quick-view': {
    label: 'Quick View',
    className: 'bg-cyan-500/10 text-cyan-400',
  },
  contact: { label: 'Contato', className: 'bg-purple-500/10 text-purple-400' },
  footer: { label: 'Footer', className: 'bg-gray-500/10 text-gray-300' },
  unknown: { label: 'Outro', className: 'bg-gray-500/10 text-gray-400' },
}

export function RecentLeadsTable({ leads }: Props) {
  return (
    <article className="rounded-lg border border-border bg-bg-secondary p-5 md:p-6">
      <header className="mb-5">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-success" />
          <h2 className="font-display text-base uppercase tracking-tight">
            Leads recentes
          </h2>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Últimos {leads.length} cliques no WhatsApp
        </p>
      </header>

      {leads.length === 0 ? (
        <div className="grid h-64 place-items-center text-center">
          <div>
            <MessageSquare className="mx-auto mb-2 h-10 w-10 text-gray-600" />
            <p className="text-sm text-gray-400">Sem leads no período</p>
            <p className="mt-1 text-xs text-gray-500">
              Aguarde cliques no botão WhatsApp
            </p>
          </div>
        </div>
      ) : (
        <ul className="-mr-2 max-h-[400px] space-y-2 overflow-y-auto pr-2">
          {leads.map((lead) => {
            const badge =
              SOURCE_BADGES[lead.source] ?? SOURCE_BADGES.unknown!
            const timeAgo = formatDistanceToNow(new Date(lead.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })
            return (
              <li
                key={lead.id}
                className="rounded-md border border-border bg-bg-primary p-3"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {lead.customerName ?? 'Anônimo'}
                    </p>
                    {lead.customerPhone && (
                      <a
                        href={`https://wa.me/${lead.customerPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-success hover:underline"
                      >
                        <Phone className="h-2.5 w-2.5" />
                        {lead.customerPhone}
                      </a>
                    )}
                  </div>
                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider',
                      badge.className,
                    )}
                  >
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <div className="flex items-center gap-3 text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Package className="h-2.5 w-2.5" />
                      {lead.itemsCount} item{lead.itemsCount !== 1 ? 's' : ''}
                    </span>
                    {lead.totalValue != null && (
                      <span className="font-semibold text-foreground">
                        {formatBRL(lead.totalValue)}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">{timeAgo}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}
