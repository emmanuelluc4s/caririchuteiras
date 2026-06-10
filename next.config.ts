import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
    formats: ['image/avif', 'image/webp'],
    // Em dev local no Windows o Node.js não consegue verificar certificados SSL
    // pra otimizar imagens remotas (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
    // Em prod (Vercel/Linux), a otimização funciona normalmente.
    unoptimized: process.env.NODE_ENV === 'development',
  },
}

export default nextConfig
