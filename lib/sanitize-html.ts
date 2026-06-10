import DOMPurify from 'isomorphic-dompurify'

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'b',
  'i',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'h4',
  'a',
  'blockquote',
  'span',
]

const ALLOWED_ATTRS = ['href', 'target', 'rel']

export function sanitizeProductHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    FORBID_TAGS: ['script', 'style', 'iframe'],
    FORBID_ATTR: ['onclick', 'onerror', 'onload', 'style'],
  })
}
