import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBRL(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

export function generateSku(brand: string, category: string, counter: number): string {
  const b = brand.substring(0, 3).toUpperCase()
  const c = category
    .split(' ')
    .map((w) => w.substring(0, 4))
    .join('')
    .toUpperCase()
  const n = String(counter).padStart(4, '0')
  return `${b}-${c}-${n}`
}
