'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { useCartStore, selectItemsCount } from '@/lib/whatsapp/cart-store'
import { useHasHydrated } from '@/lib/hooks/use-has-hydrated'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { buildWhatsappUrl } from '@/lib/whatsapp/build-message'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

// Prop whatsappNumber mantida para compatibilidade com o layout do M02.
// Não é usada diretamente — buildWhatsappUrl puxa de env.
export function WhatsappFloatingButton({
  whatsappNumber: _whatsappNumber,
}: {
  whatsappNumber: string
}) {
  const [visible, setVisible] = React.useState(false)
  const hydrated = useHasHydrated()
  const count = useCartStore(selectItemsCount)
  const open = useCartStore((s) => s.open)
  const { track } = useAnalytics()

  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(t)
  }, [])

  function handleClick() {
    if (hydrated && count > 0) {
      // Tem itens → abre drawer
      open()
    } else {
      // Vazio → wa.me direto com mensagem genérica
      track('whatsapp_click_single', { items: [] })
      const url = buildWhatsappUrl({ items: [] })
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const displayCount = hydrated ? count : 0

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={visible ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="fixed bottom-5 right-5 z-40 md:bottom-8 md:right-8"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          displayCount > 0
            ? `Abrir conversa com ${displayCount} ${displayCount > 1 ? 'itens' : 'item'}`
            : 'Falar no WhatsApp'
        }
        className="group bg-whatsapp hover:bg-whatsapp-dark relative flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-110 md:h-16 md:w-16"
        style={{ boxShadow: '0 8px 32px rgba(37, 211, 102, 0.45)' }}
      >
        <span
          className="bg-whatsapp absolute inset-0 animate-ping rounded-full opacity-50"
          style={{ animationDuration: '2.5s' }}
        />
        <span className="bg-whatsapp/30 absolute inset-0 animate-pulse rounded-full" />

        <WhatsAppIcon className="relative h-7 w-7 md:h-8 md:w-8" />

        {displayCount > 0 && (
          <motion.span
            key={displayCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="bg-neon border-bg-primary neon-glow-sm absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 px-1.5 text-[11px] font-bold text-white"
          >
            {displayCount > 99 ? '99+' : displayCount}
          </motion.span>
        )}
      </button>
    </motion.div>
  )
}
