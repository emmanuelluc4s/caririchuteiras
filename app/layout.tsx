import type { Metadata } from 'next'
import { Inter, Anton } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
})

const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'Cariri Chuteiras — A maior loja esportiva do Cariri',
    template: '%s | Cariri Chuteiras',
  },
  description:
    'Chuteiras, tênis, camisas e acessórios esportivos das melhores marcas. Entregamos para todo o Cariri.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme="dark" className={`${inter.variable} ${anton.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  )
}
