import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

let _supabaseAdmin: SupabaseClient | null = null

async function getSupabaseAdmin(): Promise<SupabaseClient> {
  if (_supabaseAdmin) return _supabaseAdmin
  const { createClient } = await import('@supabase/supabase-js')
  _supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
  return _supabaseAdmin
}

export type UploadResult =
  | { ok: true; url: string }
  | { ok: false; error: string }

export async function uploadReviewImage(
  file: File,
  productId: string,
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      ok: false,
      error: 'Tipo de imagem inválido. Use JPG, PNG ou WebP.',
    }
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: 'Imagem muito grande. Máximo 5MB.' }
  }

  const extMatch = file.name.match(/\.(jpe?g|png|webp)$/i)
  const ext = (extMatch?.[1] ?? 'jpg').toLowerCase().replace('jpeg', 'jpg')
  const fileName = `${productId}/${crypto.randomBytes(12).toString('hex')}-${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const supabaseAdmin = await getSupabaseAdmin()
  const { data, error } = await supabaseAdmin.storage
    .from('reviews')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error('[upload-review-image]', error)
    return { ok: false, error: 'Erro ao salvar imagem. Tente novamente.' }
  }

  const { data: publicUrl } = supabaseAdmin.storage
    .from('reviews')
    .getPublicUrl(data.path)

  return { ok: true, url: publicUrl.publicUrl }
}
