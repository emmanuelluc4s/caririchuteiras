'use client'

import * as React from 'react'
import { useFormStatus } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { loginAction } from '@/app/admin/login/actions'
import { toast } from 'sonner'

type Props = {
  redirectTo?: string
}

export function LoginForm({ redirectTo }: Props) {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setErrorMessage(null)
    const result = await loginAction(formData)
    if (!result.ok) {
      setErrorMessage(result.error)
      return
    }
    toast.success('Bem-vindo de volta!', { description: result.adminName })
    router.push(
      redirectTo && redirectTo.startsWith('/admin') ? redirectTo : '/admin',
    )
    router.refresh()
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/10 p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
          <p className="text-xs text-danger">{errorMessage}</p>
        </div>
      )}

      <div>
        <Label
          htmlFor="email"
          className="text-xs uppercase tracking-wider text-gray-400"
        >
          Email
        </Label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="seu@email.com"
            className="h-11 w-full rounded-md border border-border bg-bg-secondary pl-10 pr-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="password"
          className="text-xs uppercase tracking-wider text-gray-400"
        >
          Senha
        </Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-11 w-full rounded-md border border-border bg-bg-secondary pl-10 pr-10 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="w-full" size="lg">
      <LogIn className="h-4 w-4" />
      {pending ? 'Entrando...' : 'Entrar'}
    </Button>
  )
}
