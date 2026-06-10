'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import { cn } from '@/lib/utils'

export type GalleryImage = {
  id: string
  urlOriginal: string
  urlLarge: string
  urlMedium: string
  urlThumb: string
  alt?: string | null
}

type Props = {
  images: GalleryImage[]
  productName: string
}

export function ProductGallery({ images, productName }: Props) {
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [lightboxOpen, setLightboxOpen] = React.useState(false)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: 'start',
  })

  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  function handleSelectThumb(index: number) {
    setSelectedIndex(index)
    emblaApi?.scrollTo(index)
  }

  if (images.length === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-lg border border-border bg-bg-secondary text-sm text-gray-600">
        Sem foto disponível
      </div>
    )
  }

  const selectedImage = images[selectedIndex]!

  return (
    <>
      <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
        {/* Thumbs */}
        {images.length > 1 && (
          <div
            className="flex gap-2 md:max-h-[600px] md:flex-col md:overflow-y-auto"
            role="tablist"
            aria-label="Miniaturas das fotos"
          >
            {images.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => handleSelectThumb(i)}
                role="tab"
                aria-selected={selectedIndex === i}
                aria-label={`Ver foto ${i + 1} de ${images.length}`}
                className={cn(
                  'relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all md:h-20 md:w-20',
                  selectedIndex === i
                    ? 'border-neon neon-glow-sm'
                    : 'border-border opacity-60 hover:border-neon/40 hover:opacity-100',
                )}
              >
                <Image
                  src={img.urlThumb}
                  alt={img.alt ?? `${productName} - miniatura ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Imagem principal */}
        <div className="min-w-0 flex-1">
          {/* Desktop: imagem com zoom-lupa */}
          <div className="hidden md:block">
            <ImageWithZoomLens
              key={selectedImage.id}
              image={selectedImage}
              productName={productName}
              onExpand={() => setLightboxOpen(true)}
            />
          </div>

          {/* Mobile: carrossel swipe */}
          <div className="relative md:hidden">
            <div
              ref={emblaRef}
              className="overflow-hidden rounded-lg border border-border bg-bg-secondary"
            >
              <div className="flex">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="relative aspect-square min-w-0 flex-[0_0_100%]"
                    aria-label={`Foto ${i + 1} de ${images.length} — toque para expandir`}
                  >
                    <Image
                      src={img.urlLarge}
                      alt={img.alt ?? `${productName} - foto ${i + 1}`}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Setas mobile */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollPrev()}
                  aria-label="Foto anterior"
                  className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg-primary/70 text-white backdrop-blur-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollNext()}
                  aria-label="Próxima foto"
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-bg-primary/70 text-white backdrop-blur-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Dots mobile */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {images.map((_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === selectedIndex ? 'w-6 bg-neon' : 'w-1.5 bg-white/50',
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={images}
        initialIndex={selectedIndex}
        productName={productName}
      />
    </>
  )
}

/* ============================
   Zoom por lupa (desktop)
   ============================ */
function ImageWithZoomLens({
  image,
  productName,
  onExpand,
}: {
  image: GalleryImage
  productName: string
  onExpand: () => void
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [zoomActive, setZoomActive] = React.useState(false)
  const [lensPos, setLensPos] = React.useState({ x: 50, y: 50 })

  function handleMouseMove(e: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setLensPos({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    })
  }

  const ZOOM_LEVEL = 2.5

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="relative aspect-square cursor-zoom-in overflow-hidden rounded-lg border border-border bg-bg-secondary"
        onMouseEnter={() => setZoomActive(true)}
        onMouseLeave={() => setZoomActive(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={image.urlLarge}
          alt={image.alt ?? productName}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />

        {/* Indicador da lupa */}
        {zoomActive && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-neon bg-white/10 backdrop-blur-[2px] neon-glow-sm"
            style={{ left: `${lensPos.x}%`, top: `${lensPos.y}%` }}
          />
        )}

        {/* Botão expandir */}
        <button
          type="button"
          onClick={onExpand}
          aria-label="Expandir imagem em tela cheia"
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-bg-primary/70 text-white backdrop-blur-md transition-all hover:scale-110 hover:bg-neon"
        >
          <Expand className="h-4 w-4" />
        </button>
      </div>

      {/* Painel de zoom (aparece ao lado, só em telas xl+) */}
      <AnimatePresence>
        {zoomActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="pointer-events-none absolute left-full top-0 z-30 ml-4 hidden h-full w-full overflow-hidden rounded-lg border border-neon bg-bg-secondary neon-glow-sm xl:block"
            aria-hidden="true"
          >
            <div
              className="absolute inset-0 bg-no-repeat"
              style={{
                backgroundImage: `url(${image.urlOriginal})`,
                backgroundSize: `${ZOOM_LEVEL * 100}%`,
                backgroundPosition: `${lensPos.x}% ${lensPos.y}%`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============================
   Lightbox fullscreen
   ============================ */
function Lightbox({
  open,
  onClose,
  images,
  initialIndex,
  productName,
}: {
  open: boolean
  onClose: () => void
  images: GalleryImage[]
  initialIndex: number
  productName: string
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: initialIndex,
    loop: false,
  })
  const [selectedIndex, setSelectedIndex] = React.useState(initialIndex)

  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  React.useEffect(() => {
    if (open) emblaApi?.scrollTo(initialIndex, true)
  }, [open, initialIndex, emblaApi])

  React.useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') emblaApi?.scrollPrev()
      if (e.key === 'ArrowRight') emblaApi?.scrollNext()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, emblaApi, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Galeria de ${productName}`}
        >
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-4 top-4 z-10 grid h-12 w-12 place-items-center rounded-full bg-bg-secondary/80 text-white backdrop-blur-md transition-colors hover:bg-neon"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex h-full items-center" ref={emblaRef}>
            <div className="flex w-full">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="grid h-screen min-w-0 flex-[0_0_100%] place-items-center p-4 md:p-12"
                >
                  <div className="relative h-full w-full max-w-5xl">
                    <Image
                      src={img.urlOriginal}
                      alt={img.alt ?? `${productName} - foto ${i + 1}`}
                      fill
                      sizes="100vw"
                      className="object-contain"
                      priority={i === selectedIndex}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={() => emblaApi?.scrollPrev()}
                aria-label="Anterior"
                className="absolute left-4 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-bg-secondary/80 text-white backdrop-blur-md transition-colors hover:bg-neon md:grid"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                aria-label="Próximo"
                className="absolute right-4 top-1/2 z-10 hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full bg-bg-secondary/80 text-white backdrop-blur-md transition-colors hover:bg-neon md:grid"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-sm text-white/70">
                {selectedIndex + 1} / {images.length}
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
