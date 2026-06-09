'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet'
import { Logo } from './logo'
import { MAIN_NAV } from '@/lib/navigation'
import { cn } from '@/lib/utils'

export function MobileMenu() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  // Fecha o menu sempre que a rota muda
  React.useEffect(() => setOpen(false), [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Abrir menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="border-border bg-bg-primary w-[85vw] max-w-sm border-r p-0"
      >
        <SheetHeader className="border-border border-b px-6 py-5">
          <SheetTitle className="flex items-center">
            <Logo variant="horizontal" width={140} height={36} href={undefined} />
          </SheetTitle>
          <SheetDescription className="sr-only">
            Menu principal de navegação da Cariri Chuteiras com acesso a categorias,
            promoções, novidades e contato.
          </SheetDescription>
        </SheetHeader>

        <nav className="flex flex-col px-2 py-4" aria-label="Menu mobile">
          {MAIN_NAV.map((item) => {
            const isActive = pathname === item.href
            return (
              <SheetClose asChild key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center justify-between rounded-md px-4 py-3 text-base font-medium uppercase tracking-wide transition-colors',
                    isActive
                      ? 'bg-neon/10 text-neon'
                      : 'text-foreground hover:bg-bg-secondary hover:text-neon',
                    item.highlight && !isActive && 'text-neon-hover',
                  )}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="group-hover:text-neon h-4 w-4 text-gray-600 transition-colors" />
                </Link>
              </SheetClose>
            )
          })}
        </nav>

        <div className="px-6 pb-6">
          <p className="mb-3 text-xs uppercase tracking-wider text-gray-400">Atendimento</p>
          <p className="text-sm text-gray-100">Segunda a Sexta: 8h às 18h</p>
          <p className="text-sm text-gray-100">Sábado: 8h às 13h</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
