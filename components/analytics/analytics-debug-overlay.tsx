'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { Activity, X, ChevronDown, ChevronUp } from 'lucide-react'

type LogEntry = {
  timestamp: number
  event: string
  payload: unknown
}

const MAX_LOGS = 50

export function AnalyticsDebugOverlay() {
  return (
    <React.Suspense fallback={null}>
      <AnalyticsDebugOverlayInner />
    </React.Suspense>
  )
}

function AnalyticsDebugOverlayInner() {
  const searchParams = useSearchParams()
  const debugMode = searchParams.get('debug') === 'analytics'
  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [collapsed, setCollapsed] = React.useState(false)
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    if (!debugMode) return
    const original = console.log
    console.log = (...args: unknown[]) => {
      original(...args)
      if (args[0] === '[analytics]' && args.length >= 2) {
        setLogs((prev) =>
          [
            {
              timestamp: Date.now(),
              event: String(args[1]),
              payload: args[2],
            },
            ...prev,
          ].slice(0, MAX_LOGS),
        )
      }
    }
    return () => {
      console.log = original
    }
  }, [debugMode])

  if (!debugMode || !visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[380px] max-w-[calc(100vw-2rem)] rounded-lg border border-neon bg-bg-secondary shadow-2xl">
      <header className="flex items-center justify-between gap-2 border-b border-border bg-neon/10 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Activity className="h-3.5 w-3.5 shrink-0 text-neon" />
          <p className="text-xs font-bold uppercase tracking-wider text-neon">
            Analytics Debug
          </p>
          <span className="shrink-0 text-[10px] tabular-nums text-gray-400">
            ({logs.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expandir' : 'Recolher'}
            className="grid h-6 w-6 place-items-center rounded text-gray-400 hover:text-foreground"
          >
            {collapsed ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Fechar"
            className="grid h-6 w-6 place-items-center rounded text-gray-400 hover:text-danger"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </header>
      {!collapsed && (
        <ul className="max-h-[400px] divide-y divide-border overflow-y-auto">
          {logs.length === 0 ? (
            <li className="p-4 text-center text-xs text-gray-400">
              Sem eventos ainda. Navegue para gerar tracking.
            </li>
          ) : (
            logs.map((log, i) => {
              const time = new Date(log.timestamp)
              const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`
              const hasPayload =
                log.payload != null &&
                typeof log.payload === 'object' &&
                Object.keys(log.payload as object).length > 0
              return (
                <li key={i} className="px-3 py-2 hover:bg-bg-tertiary/30">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate font-mono text-xs text-neon">
                      {log.event}
                    </p>
                    <span className="shrink-0 text-[9px] tabular-nums text-gray-500">
                      {timeStr}
                    </span>
                  </div>
                  {hasPayload && (
                    <pre className="max-h-24 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[9px] text-gray-400">
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  )}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
