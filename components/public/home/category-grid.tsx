'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

type Category = {
  id: string
  slug: string
  name: string
  imageUrl: string | null
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
  'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600',
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=600',
  'https://images.unsplash.com/photo-1579338559194-a162d19bf842?w=600',
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600',
  'https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=600',
  'https://images.unsplash.com/photo-1542367592-8849eb950fd8?w=600',
]

type Props = {
  categories: Category[]
}

export function CategoryGrid({ categories }: Props) {
  if (categories.length === 0) return null

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-20"
      aria-labelledby="categories-heading"
    >
      <header className="mb-8 flex items-end justify-between gap-4 md:mb-12">
        <div>
          <p className="text-neon mb-2 text-xs uppercase tracking-[0.2em]">Categorias</p>
          <h2
            id="categories-heading"
            className="font-display text-4xl uppercase tracking-tight md:text-6xl"
          >
            Encontre o que <span className="text-neon">você procura</span>
          </h2>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
        {categories.map((cat, i) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            fallbackImage={FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]!}
            index={i}
          />
        ))}
      </div>
    </section>
  )
}

function CategoryCard({
  category,
  fallbackImage,
  index,
}: {
  category: Category
  fallbackImage: string
  index: number
}) {
  const imageUrl = category.imageUrl ?? fallbackImage

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
    >
      <Link
        href={`/categoria/${category.slug}`}
        className="group bg-bg-secondary border-border hover:border-neon/50 hover:neon-glow-sm relative block aspect-[4/5] overflow-hidden rounded-lg border transition-all"
      >
        <Image
          src={imageUrl}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        <div className="from-bg-primary via-bg-primary/40 group-hover:from-bg-primary/95 absolute inset-0 bg-gradient-to-t to-transparent transition-opacity duration-300" />

        <div className="bg-neon/0 group-hover:bg-neon/10 absolute inset-0 transition-colors duration-300" />

        <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
          <h3 className="font-display text-xl uppercase tracking-tight leading-tight text-white transition-transform duration-300 group-hover:-translate-y-1 md:text-2xl">
            {category.name}
          </h3>
          <div className="text-neon mt-1.5 flex -translate-x-2 items-center gap-2 text-xs opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            <span className="font-semibold uppercase tracking-wider">Ver tudo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
