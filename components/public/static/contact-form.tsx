'use client'

import * as React from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { submitContactAction } from '@/app/(public)/contato/actions'
import { useAnalytics } from '@/lib/analytics/use-analytics'

export function ContactForm() {
  const [pending, setPending] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)
  const { track } = useAnalytics()

  async function handleSubmit(formData: FormData) {
    setPending(true)
    const result = await submitContactAction(formData)
    setPending(false)

    if (result.ok) {
      track('whatsapp_click_single', { metadata: { source: 'contact-form' } })
      toast.success('Abrindo WhatsApp...', {
        description: 'Sua mensagem está pronta. É só enviar!',
      })
      formRef.current?.reset()
      window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="relative space-y-4 rounded-lg border border-border bg-bg-secondary p-6 md:p-8"
    >
      <div className="space-y-1">
        <h2 className="font-display text-2xl uppercase tracking-tight">
          Manda sua <span className="text-neon">mensagem</span>
        </h2>
        <p className="text-sm text-gray-400">
          A gente recebe direto no WhatsApp e responde rapidinho.
        </p>
      </div>

      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] opacity-0"
      />

      <div>
        <Label
          htmlFor="name"
          className="text-xs uppercase tracking-wider text-gray-400"
        >
          Seu nome *
        </Label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={100}
          className="mt-1 h-11 w-full rounded-md border border-border bg-bg-primary px-3 text-sm text-foreground focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
          placeholder="Ex: João Silva"
        />
      </div>

      <div>
        <Label
          htmlFor="topic"
          className="text-xs uppercase tracking-wider text-gray-400"
        >
          Sobre o quê é? *
        </Label>
        <select
          id="topic"
          name="topic"
          required
          defaultValue="produto"
          className="mt-1 h-11 w-full cursor-pointer rounded-md border border-border bg-bg-primary px-3 text-sm text-foreground focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
        >
          <option value="produto">Dúvida sobre produto</option>
          <option value="pedido">Status do pedido</option>
          <option value="troca">Troca ou devolução</option>
          <option value="outro">Outro assunto</option>
        </select>
      </div>

      <div>
        <Label
          htmlFor="message"
          className="text-xs uppercase tracking-wider text-gray-400"
        >
          Mensagem *
        </Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={1000}
          rows={5}
          className="mt-1 resize-none border-border bg-bg-primary"
          placeholder="Escreva sua mensagem..."
        />
      </div>

      <Button
        type="submit"
        disabled={pending}
        variant="whatsapp"
        size="lg"
        className="w-full"
      >
        <Send className="h-4 w-4" />
        {pending ? 'Abrindo WhatsApp...' : 'Enviar via WhatsApp'}
      </Button>

      <p className="text-center text-[11px] text-gray-400">
        Ao enviar, sua mensagem abre direto no WhatsApp da loja.
      </p>
    </form>
  )
}
