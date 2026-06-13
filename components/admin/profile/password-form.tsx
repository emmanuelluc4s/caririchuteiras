'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updatePasswordAction } from '@/app/admin/(authenticated)/perfil/actions'

export function PasswordForm() {
  const [pending, setPending] = React.useState(false)
  const [show, setShow] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    const result = await updatePasswordAction(formData)
    setPending(false)
    if (result.ok) {
      toast.success(result.message)
      formRef.current?.reset()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className="space-y-5 rounded-lg border border-border bg-bg-secondary p-6 md:p-8"
    >
      <h2 className="font-display text-xl uppercase tracking-tight">
        Alterar senha
      </h2>

      <div>
        <Label
          htmlFor="newPassword"
          className="text-xs uppercase tracking-wider text-gray-400"
        >
          Nova senha
        </Label>
        <div className="relative mt-1">
          <input
            id="newPassword"
            name="newPassword"
            type={show ? 'text' : 'password'}
            required
            minLength={8}
            maxLength={100}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="h-11 w-full rounded-md border border-border bg-bg-primary px-3 pr-10 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? 'Esconder' : 'Mostrar'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground"
          >
            {show ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-1 text-[10px] text-gray-500">Mínimo 8 caracteres.</p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Salvando...' : 'Atualizar senha'}
      </Button>
    </form>
  )
}
