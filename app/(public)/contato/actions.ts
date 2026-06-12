'use server'

import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(100),
  topic: z.enum(['produto', 'pedido', 'troca', 'outro']),
  message: z.string().min(10, 'Mensagem muito curta').max(1000),
  honeypot: z.string().max(0).optional(),
})

type ActionResult =
  | { ok: true; whatsappUrl: string }
  | { ok: false; error: string }

const TOPIC_LABELS = {
  produto: 'Dúvida sobre produto',
  pedido: 'Status do pedido',
  troca: 'Troca ou devolução',
  outro: 'Outro assunto',
} as const

export async function submitContactAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const parsed = ContactSchema.safeParse({
      name: String(formData.get('name') ?? '').trim(),
      topic: String(formData.get('topic') ?? 'outro'),
      message: String(formData.get('message') ?? '').trim(),
      honeypot: String(formData.get('website') ?? ''),
    })

    if (!parsed.success) {
      const issue = parsed.error.issues[0]
      return { ok: false, error: issue?.message ?? 'Dados inválidos' }
    }

    const { honeypot, name, topic, message } = parsed.data
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

    if (honeypot && honeypot.length > 0) {
      // Bot — fingir sucesso silenciosamente
      return { ok: true, whatsappUrl: `https://wa.me/${whatsappNumber}` }
    }

    const greeting = `Olá! Meu nome é ${name}.`
    const subject = `Assunto: ${TOPIC_LABELS[topic]}`
    const body = `\n\n${message}\n\n— Mensagem enviada pelo formulário do site.`

    const fullMessage = `${greeting}\n\n${subject}${body}`
    const encoded = encodeURIComponent(fullMessage)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encoded}`

    return { ok: true, whatsappUrl }
  } catch (error) {
    console.error('[contact] error:', error)
    return { ok: false, error: 'Erro ao processar. Tente novamente.' }
  }
}
