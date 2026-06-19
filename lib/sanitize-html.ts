/**
 * Sanitização básica server-safe (sem DOMPurify/jsdom).
 *
 * O HTML vem do editor TipTap do admin — já é controlado. Mesmo assim
 * removemos tags executáveis e atributos JS event handlers como defesa
 * em profundidade.
 *
 * (isomorphic-dompurify quebrava o runtime Vercel — substituído por
 * regex direto em 2026-06.)
 */

const FORBIDDEN_TAGS = [
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'link',
  'meta',
  'form',
  'input',
  'button',
  'textarea',
  'select',
]

export function sanitizeProductHtml(html: string): string {
  if (!html) return ''

  let safe = html

  // Remove tags proibidas inteiras (com conteudo)
  for (const tag of FORBIDDEN_TAGS) {
    const blockRegex = new RegExp(
      `<\\s*${tag}\\b[^>]*>[\\s\\S]*?<\\s*/\\s*${tag}\\s*>`,
      'gi',
    )
    safe = safe.replace(blockRegex, '')
    const selfClosingRegex = new RegExp(`<\\s*${tag}\\b[^>]*/?\\s*>`, 'gi')
    safe = safe.replace(selfClosingRegex, '')
  }

  // Remove on* event handlers (onclick, onerror, etc) — variantes com aspas
  safe = safe.replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
  safe = safe.replace(/\son\w+\s*=\s*'[^']*'/gi, '')
  safe = safe.replace(/\son\w+\s*=\s*[^\s>]+/gi, '')

  // Remove style="..." e style='...'
  safe = safe.replace(/\sstyle\s*=\s*"[^"]*"/gi, '')
  safe = safe.replace(/\sstyle\s*=\s*'[^']*'/gi, '')

  // Remove href="javascript:..."
  safe = safe.replace(/\shref\s*=\s*["']?\s*javascript:[^"'>\s]*["']?/gi, '')

  return safe
}
