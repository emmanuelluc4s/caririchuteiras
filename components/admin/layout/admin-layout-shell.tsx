'use client'

import * as React from 'react'
import { AdminSidebar } from './admin-sidebar'
import { AdminHeader } from './admin-header'
import type { AdminUser } from '@/lib/admin/types'

const COLLAPSED_KEY = 'cc-admin-sidebar-collapsed'

type Props = {
  admin: AdminUser
  children: React.ReactNode
}

export function AdminLayoutShell({ admin, children }: Props) {
  const [collapsed, setCollapsed] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(COLLAPSED_KEY)
      if (stored === '1') setCollapsed(true)
    } catch {}
  }, [])

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? '1' : '0')
      } catch {}
      return next
    })
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <AdminSidebar
        role={admin.role}
        collapsed={collapsed}
        onCollapseToggle={toggleCollapsed}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader admin={admin} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
