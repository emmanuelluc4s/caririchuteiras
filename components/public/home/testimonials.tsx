'use client'

import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { motion } from 'framer-motion'
import { Star, Quote, MapPin } from 'lucide-react'

export type Testimonial = {
  id: string
  customerName: string
  city: string | null
  rating: number
  comment: string
  product?: { name: string; brand: string } | null
}

type Props = {
  testimonials: Testimonial[]
}

export function Testimonials({ testimonials }: Props) {
  const autoplay = React.useMemo(
    () => Autoplay({ delay: 6000, stopOnInteraction: false }),
    [],
  )
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start', dragFree: true },
    [autoplay],
  )

  if (testimonials.length === 0) return null

  return (
    <section
      className="relative overflow-hidden py-12 md:py-20"
      aria-labelledby="testimonials-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="bg-neon/8 absolute right-1/4 top-1/2 h-[400px] w-[400px] rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className="mb-10 px-4 text-center md:mb-14 md:px-6">
          <p className="text-neon mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
            <Star className="fill-neon h-4 w-4" />
            Depoimentos
          </p>
          <h2
            id="testimonials-heading"
            className="font-display text-4xl uppercase tracking-tight md:text-6xl"
          >
            O que dizem os <span className="text-neon">clientes</span>
          </h2>
        </header>

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {testimonials.map((t, i) => (
              <div
                key={t.id}
                className="min-w-0 flex-[0_0_85%] px-3 sm:flex-[0_0_60%] md:flex-[0_0_42%] lg:flex-[0_0_32%]"
              >
                <TestimonialCard testimonial={t} index={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.08 }}
      className="border-border bg-bg-secondary hover:border-neon/40 relative h-full rounded-xl border p-6 transition-colors md:p-7"
    >
      <Quote className="text-neon/20 absolute right-5 top-5 h-8 w-8" aria-hidden="true" />

      <div className="mb-4 flex gap-1" aria-label={`Avaliação ${testimonial.rating} de 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < testimonial.rating ? 'fill-warning text-warning' : 'text-gray-600'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <blockquote className="text-foreground mb-5 text-base leading-relaxed line-clamp-5">
        &ldquo;{testimonial.comment}&rdquo;
      </blockquote>

      <footer className="border-border flex items-center justify-between gap-3 border-t pt-4">
        <div>
          <p className="text-foreground text-sm font-semibold">{testimonial.customerName}</p>
          {testimonial.city && (
            <p className="flex items-center gap-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              {testimonial.city}
            </p>
          )}
        </div>
        {testimonial.product && (
          <div className="text-right">
            <p className="text-neon text-[10px] uppercase tracking-wide">
              {testimonial.product.brand}
            </p>
            <p className="max-w-[150px] text-xs text-gray-400 line-clamp-1">
              {testimonial.product.name}
            </p>
          </div>
        )}
      </footer>
    </motion.article>
  )
}
