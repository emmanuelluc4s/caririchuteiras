/**
 * Cria o bucket público "reviews" no Supabase Storage.
 * Executar via: pnpm tsx scripts/setup-reviews-bucket.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
})

async function main() {
  const { data: existing } = await supabase.storage.getBucket('reviews')

  if (existing) {
    console.log('✓ Bucket "reviews" já existe')
    if (!existing.public) {
      const { error } = await supabase.storage.updateBucket('reviews', { public: true })
      if (error) {
        console.error('Erro ao tornar público:', error)
        process.exit(1)
      }
      console.log('✓ Bucket atualizado para público')
    }
    return
  }

  const { error } = await supabase.storage.createBucket('reviews', {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  })

  if (error) {
    console.error('Erro ao criar bucket:', error)
    process.exit(1)
  }
  console.log('✓ Bucket "reviews" criado (público, 5MB, JPG/PNG/WebP)')
}

main()
