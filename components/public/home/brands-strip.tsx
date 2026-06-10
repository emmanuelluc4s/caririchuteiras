'use client'

import { motion } from 'framer-motion'

const BRANDS = ['NIKE', 'ADIDAS', 'PUMA', 'PENALTY', 'TOPPER', 'UMBRO']

export function BrandsStrip() {
  return (
    <section
      className="border-border bg-bg-secondary border-y py-8 md:py-12"
      aria-label="Marcas trabalhadas"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <p className="mb-6 text-center text-xs uppercase tracking-[0.3em] text-gray-400">
          Trabalhamos com as melhores marcas
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
          {BRANDS.map((brand, i) => (
            <motion.span
              key={brand}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="font-display hover:text-neon hover:neon-text cursor-default select-none text-2xl text-gray-600 transition-all duration-300 md:text-4xl"
            >
              {brand}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}
