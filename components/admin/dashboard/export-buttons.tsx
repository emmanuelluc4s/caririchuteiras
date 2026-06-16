'use client'

import * as React from 'react'
import { Download, FileText, Users, Package, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import {
  exportEventsAction,
  exportLeadsAction,
  exportTopProductsAction,
} from '@/app/admin/(authenticated)/dashboard/actions'
import type { PeriodKey } from '@/lib/admin/dashboard/types'

type Props = {
  periodKey: PeriodKey
}

type ExportFn = (
  periodKey: PeriodKey,
) => Promise<
  | { ok: true; csv: string; filename: string }
  | { ok: false; error: string }
>

export function ExportButtons({ periodKey }: Props) {
  const [pending, setPending] = React.useState(false)

  async function handleExport(actionFn: ExportFn, label: string) {
    setPending(true)
    const toastId = toast.loading(`Gerando ${label}...`)
    const result = await actionFn(periodKey)
    setPending(false)
    if (!result.ok) {
      toast.error(result.error, { id: toastId })
      return
    }
    const BOM = '﻿'
    const blob = new Blob([BOM + result.csv], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = result.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success(`${label} exportado!`, { id: toastId })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={pending}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-bg-secondary px-3 text-sm transition-colors hover:border-neon disabled:opacity-50"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Exportar</span>
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 border-border bg-bg-secondary"
      >
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-gray-400">
          Exportar CSV
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={() => handleExport(exportEventsAction, 'Eventos')}
          disabled={pending}
          className="cursor-pointer"
        >
          <FileText className="mr-2 h-3.5 w-3.5" />
          Eventos do período
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport(exportLeadsAction, 'Leads')}
          disabled={pending}
          className="cursor-pointer"
        >
          <Users className="mr-2 h-3.5 w-3.5" />
          Leads WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport(exportTopProductsAction, 'Top Produtos')}
          disabled={pending}
          className="cursor-pointer"
        >
          <Package className="mr-2 h-3.5 w-3.5" />
          Top produtos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
