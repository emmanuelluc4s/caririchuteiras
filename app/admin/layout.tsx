import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'Painel Admin — Cariri Chuteiras',
    template: '%s — Painel Admin',
  },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-bg-primary text-foreground">{children}</div>
}
