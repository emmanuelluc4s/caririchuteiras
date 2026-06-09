import type { Metadata } from 'next'
import { Inter, Anton } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
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
    'Chuteiras, tênis, camisas e acessórios esportivos das melhores marcas. Entregamos para todo o Brasil.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Cariri Chuteiras',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: '512x512' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${anton.variable}`} suppressHydrationWarning>
      <body className="font-body bg-bg-primary text-foreground min-h-screen antialiased">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="cc-theme"
        >
          {children}
          <Toaster
            position="top-center"
            theme="dark"
            toastOptions={{
              style: {
                background: 'rgb(20 20 20)',
                color: 'rgb(255 255 255)',
                border: '1px solid rgb(38 38 38)',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
