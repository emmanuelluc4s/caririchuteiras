/**
 * Cria o bucket público "products" no Supabase Storage.
 * Executar: pnpm tsx --env-file=.env.local scripts/setup-products-bucket.ts
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error(
    'Variáveis NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias',
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
})

async function main() {
  const { data: existing } = await supabase.storage.getBucket('products')

  if (existing) {
    console.log('✓ Bucket "products" já existe')
    if (!existing.public) {
      const { error } = await supabase.storage.updateBucket('products', {
        public: true,
      })
      if (error) {
        console.error('Erro ao tornar público:', error)
        process.exit(1)
      }
      console.log('✓ Bucket atualizado para público')
    }
    return
  }

  const { error } = await supabase.storage.createBucket('products', {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  })

  if (error) {
    console.error('Erro ao criar bucket:', error)
    process.exit(1)
  }
  console.log('✓ Bucket "products" criado (público, 5MB, JPG/PNG/WebP)')
}

main()
