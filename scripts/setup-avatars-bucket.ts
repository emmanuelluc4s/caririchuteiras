/**
 * Cria o bucket público "avatars" no Supabase Storage para avatares de admin.
 * Executar via: pnpm tsx --env-file=.env.local scripts/setup-avatars-bucket.ts
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
  const { data: existing } = await supabase.storage.getBucket('avatars')

  if (existing) {
    console.log('✓ Bucket "avatars" já existe')
    if (!existing.public) {
      const { error } = await supabase.storage.updateBucket('avatars', {
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

  const { error } = await supabase.storage.createBucket('avatars', {
    public: true,
    fileSizeLimit: 2 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  })

  if (error) {
    console.error('Erro ao criar bucket:', error)
    process.exit(1)
  }
  console.log('✓ Bucket "avatars" criado (público, 2MB, JPG/PNG/WebP)')
}

main()
