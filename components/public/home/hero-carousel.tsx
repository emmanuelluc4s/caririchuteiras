'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { cn } from '@/lib/utils'

export type HeroSlide = {
  title: string
  subtitle?: string
  cta?: string
  href?: string
  image: string
  imageAlt?: string
}

type Props = {
  slides: HeroSlide[]
}

export function HeroCarousel({ slides }: Props) {
  const { track } = useAnalytics()
  const autoplay = React.useMemo(
    () => Autoplay({ delay: 5500, stopOnInteraction: false, stopOnMouseEnter: true }),
    [],
  )
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', skipSnaps: false },
    [autoplay],
  )
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  React.useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  const scrollPrev = React.useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = React.useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = React.useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  if (slides.length === 0) return null

  return (
    <section
      className="bg-bg-primary relative w-full overflow-hidden"
      aria-label="Banners principais"
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="relative min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} de ${slides.length}`}
            >
              <HeroSlideContent
                slide={slide}
                active={selectedIndex === index}
                priority={index === 0}
                onCtaClick={() =>
                  track('hero_click', {
                    metadata: { slide: index, href: slide.href, title: slide.title },
                  })
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controles laterais (desktop) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="bg-bg-primary/40 border-border focus:ring-neon hover:bg-neon hover:border-neon absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border text-white backdrop-blur-md transition-all hover:scale-110 focus:outline-none focus:ring-2 md:grid"
            aria-label="Slide anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={scrollNext}
            className="bg-bg-primary/40 border-border focus:ring-neon hover:bg-neon hover:border-neon absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border text-white backdrop-blur-md transition-all hover:scale-110 focus:outline-none focus:ring-2 md:grid"
            aria-label="Próximo slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Indicadores */}
      {slides.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2"
          role="tablist"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              role="tab"
              aria-selected={i === selectedIndex}
              aria-label={`Ir para slide ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === selectedIndex
                  ? 'bg-neon neon-glow-sm w-12'
                  : 'w-6 bg-white/30 hover:bg-white/60',
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function HeroSlideContent({
  slide,
  active,
  priority,
  onCtaClick,
}: {
  slide: HeroSlide
  active: boolean
  priority: boolean
  onCtaClick: () => void
}) {
  return (
    <div className="relative h-[80vh] max-h-[800px] min-h-[500px] md:h-[85vh] md:min-h-[600px]">
      <Image
        src={slide.image}
        alt={slide.imageAlt ?? slide.title}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover object-center"
      />

      {/* Overlay gradient — estilo Foot Locker */}
      <div className="from-bg-primary via-bg-primary/85 to-bg-primary/30 absolute inset-0 bg-gradient-to-r" />
      <div className="from-bg-primary absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />

      {/* Glow neon decorativo */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/3 -translate-x-1/2"
        aria-hidden="true"
      >
        <div className="bg-neon/10 h-[600px] w-[600px] rounded-full blur-3xl" />
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 md:px-6">
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key="hero-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="max-w-2xl space-y-6"
            >
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
                className="font-display text-5xl uppercase leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl"
                style={{ textShadow: '0 0 32px rgba(107, 29, 255, 0.4)' }}
              >
                {slide.title}
              </motion.h2>

              {slide.subtitle && (
                <motion.p
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
                  className="max-w-xl text-lg leading-relaxed text-gray-100 md:text-xl"
                >
                  {slide.subtitle}
                </motion.p>
              )}

              {slide.cta && slide.href && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
                >
                  <Button asChild size="xl" onClick={onCtaClick}>
                    <Link href={slide.href}>{slide.cta}</Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
