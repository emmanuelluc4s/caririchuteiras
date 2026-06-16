import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export type UploadResult =
  | {
      ok: true
      urls: {
        urlOriginal: string
        urlLarge: string
        urlMedium: string
        urlThumb: string
      }
    }
  | { ok: false; error: string }

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

/**
 * Upload de imagem de produto. As 4 URLs apontam pra mesma imagem original (já comprimida no client);
 * Next/Image faz a otimização final via `sizes`.
 */
export async function uploadProductImage(
  file: File,
  productId: string,
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { ok: false, error: 'Tipo inválido. Use JPG, PNG ou WebP.' }
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { ok: false, error: 'Imagem máximo 5MB.' }
  }
  const ext = file.type.includes('png')
    ? 'png'
    : file.type.includes('webp')
      ? 'webp'
      : 'jpg'
  const fileName = `${productId}/${crypto.randomBytes(12).toString('hex')}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const supabaseAdmin = await getSupabaseAdmin()
  const { data, error } = await supabaseAdmin.storage
    .from('products')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[uploadProductImage]', error)
    return { ok: false, error: 'Erro ao salvar imagem' }
  }

  const { data: publicUrl } = supabaseAdmin.storage
    .from('products')
    .getPublicUrl(data.path)
  const url = publicUrl.publicUrl

  return {
    ok: true,
    urls: {
      urlOriginal: url,
      urlLarge: url,
      urlMedium: url,
      urlThumb: url,
    },
  }
}

export async function deleteProductImage(url: string): Promise<void> {
  try {
    const match = url.match(/\/products\/(.+?)(?:\?|$)/)
    if (!match) return
    const path = decodeURIComponent(match[1]!)
    const supabaseAdmin = await getSupabaseAdmin()
    await supabaseAdmin.storage.from('products').remove([path])
  } catch (e) {
    console.error('[deleteProductImage]', e)
  }
}

export async function copyProductImage(
  sourceUrl: string,
  newProductId: string,
): Promise<string | null> {
  try {
    const match = sourceUrl.match(/\/products\/(.+?)(?:\?|$)/)
    if (!match) return null
    const sourcePath = decodeURIComponent(match[1]!)
    const ext = sourcePath.split('.').pop() ?? 'jpg'
    const newFileName = `${newProductId}/${crypto.randomBytes(12).toString('hex')}-${Date.now()}.${ext}`

    const supabaseAdmin = await getSupabaseAdmin()
    const { error } = await supabaseAdmin.storage
      .from('products')
      .copy(sourcePath, newFileName)
    if (error) {
      console.error('[copyProductImage]', error)
      return null
    }
    const { data } = supabaseAdmin.storage
      .from('products')
      .getPublicUrl(newFileName)
    return data.publicUrl
  } catch (e) {
    console.error('[copyProductImage]', e)
    return null
  }
}
