'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Logo } from './logo'
import { SearchBar } from '@/components/public/search/search-bar'
import { ThemeToggle } from './theme-toggle'
import { WhatsappHeaderIcon } from './whatsapp-header-icon'
import { MobileMenu } from './mobile-menu'
import { RecentlyViewedDropdown } from '@/components/public/recently-viewed/recently-viewed-dropdown'
import { MAIN_NAV } from '@/lib/navigation'
import { cn } from '@/lib/utils'

type Props = {
  whatsappNumber: string
}

export function Header({ whatsappNumber }: Props) {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const backgroundColor = useTransform(
    scrollY,
    [0, 80],
    ['rgba(10, 10, 10, 0.7)', 'rgba(10, 10, 10, 0.95)'],
  )
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1])
  const borderColor = useTransform(borderOpacity, (v) => `rgba(107, 29, 255, ${v * 0.4})`)

  return (
    <motion.header
      style={{ backgroundColor, borderColor }}
      className="sticky top-0 z-40 w-full border-b backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-20 md:px-6">
        {/* Esquerda: mobile menu + logo */}
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Logo variant="horizontal" />
        </div>

        {/* Centro: busca (apenas desktop) */}
        <div className="hidden max-w-xl flex-1 lg:flex">
          <SearchBar />
        </div>

        {/* Direita: nav + actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <nav className="hidden items-center gap-1 xl:flex" aria-label="Navegação principal">
            {MAIN_NAV.slice(0, 6).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium uppercase tracking-wide transition-colors',
                    isActive ? 'text-neon' : 'text-foreground hover:text-neon',
                    item.highlight && !isActive && 'text-neon-hover',
                  )}
                >
                  {item.label}
                  {isActive && (
                    <span className="bg-neon neon-glow-sm absolute bottom-0 left-3 right-3 h-0.5" />
                  )}
                </Link>
              )
            })}
          </nav>

          <ThemeToggle />
          <RecentlyViewedDropdown />
          <WhatsappHeaderIcon whatsappNumber={whatsappNumber} />
        </div>
      </div>

      {/* Busca mobile (abaixo do header) */}
      <div className="border-border/30 border-t px-4 py-3 lg:hidden">
        <SearchBar />
      </div>
    </motion.header>
  )
}
