/**
 * Gera um "número de pessoas vendo agora" determinístico
 * baseado em hash do productId + janela de meia hora.
 * Determinístico = mesma pessoa vê o mesmo número se acessar duas vezes na mesma janela.
 * Plausível: entre 8 e 32 pessoas.
 */
export function getPeopleViewingNow(productId: string): number {
  const hourBucket = Math.floor(Date.now() / (1000 * 60 * 30)) // janela de 30min
  const seed = `${productId}-${hourBucket}`
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return 8 + (Math.abs(hash) % 25)
}

export type UrgencyMessage = {
  id: string
  icon: '🔥' | '⚡' | '📈' | '⏰'
  text: string
  emphasis: string
  type: 'social' | 'scarcity' | 'sales' | 'time'
}

export function buildUrgencyMessages(params: {
  productId: string
  totalStock: number
  whatsappClicks7d: number
}): UrgencyMessage[] {
  const messages: UrgencyMessage[] = []
  const viewers = getPeopleViewingNow(params.productId)

  messages.push({
    id: 'social',
    icon: '🔥',
    text: 'pessoas vendo este produto agora',
    emphasis: String(viewers),
    type: 'social',
  })

  if (params.totalStock > 0 && params.totalStock < 5) {
    messages.push({
      id: 'scarcity',
      icon: '⚡',
      text: 'unidades em estoque',
      emphasis: `Últimas ${params.totalStock}`,
      type: 'scarcity',
    })
  }

  if (params.whatsappClicks7d > 0) {
    messages.push({
      id: 'sales',
      icon: '📈',
      text: 'vezes esta semana',
      emphasis: `Vendido ${params.whatsappClicks7d}`,
      type: 'sales',
    })
  }

  return messages
}
