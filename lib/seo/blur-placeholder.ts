/**
 * Placeholder blur de fallback (4×3 cinza neutro) — usado quando a URL não
 * suporta transformação ou o serviço de imagens não está disponível.
 */
const FALLBACK_BLUR =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFklEQVR42mP8//8/AzbAxIAEEEII8/8DAFGgAyXkglDAAAAAElFTkSuQmCC'

/**
 * Gera um placeholder blur para a imagem.
 * Em produção, com Supabase Storage no plano Pro+, pode-se solicitar uma
 * transformação para uma versão minúscula. Sem garantia disso, retornamos
 * o fallback base64 (sempre funciona, zero requisições extras).
 */
export function getBlurDataURL(imageUrl?: string | null): string {
  if (!imageUrl) return FALLBACK_BLUR
  return FALLBACK_BLUR
}
