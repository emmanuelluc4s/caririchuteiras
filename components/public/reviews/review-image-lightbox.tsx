'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

type Props = {
  src: string | null
  alt: string
  onClose: () => void
}

export function ReviewImageLightbox({ src, alt, onClose }: Props) {
  React.useEffect(() => {
    if (!src) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [src, onClose])

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 grid place-items-center bg-bg-primary/95 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Foto da avaliação"
          onClick={onClose}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-bg-secondary/80 text-white backdrop-blur-md transition-colors hover:bg-neon"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="relative max-h-[80vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={1200}
              className="h-full max-h-[80vh] w-full rounded-lg object-contain"
              priority
              unoptimized
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
