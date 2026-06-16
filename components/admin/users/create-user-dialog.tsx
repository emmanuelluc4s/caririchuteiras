'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Copy, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createAdminAction } from '@/app/admin/(authenticated)/usuarios/actions'
import { ADMIN_ROLE_LABELS, type AdminRole } from '@/lib/admin/types'

export function CreateUserDialog() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [step, setStep] = React.useState<'form' | 'success'>('form')
  const [pending, setPending] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [name, setName] = React.useState('')
  const [role, setRole] = React.useState<AdminRole>('editor')
  const [tempPassword, setTempPassword] = React.useState('')
  const [copied, setCopied] = React.useState(false)

  function reset() {
    setStep('form')
    setEmail('')
    setName('')
    setRole('editor')
    setTempPassword('')
    setCopied(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPending(true)
    const result = await createAdminAction({ email, name, role })
    setPending(false)
    if (result.ok && result.data) {
      setTempPassword(result.data.tempPassword)
      setStep('success')
      router.refresh()
    } else if (!result.ok) {
      toast.error(result.error)
    }
  }

  function copyCredentials() {
    const text = `Email: ${email}\nSenha temporária: ${tempPassword}`
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    toast.success('Credenciais copiadas')
    setTimeout(() => setCopied(false), 2000)
  }

  function closeAndReset() {
    setOpen(false)
    setTimeout(reset, 200)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setTimeout(reset, 200)
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Novo admin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-border bg-bg-secondary">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-display uppercase">
                Novo usuário admin
              </DialogTitle>
              <DialogDescription className="text-gray-100">
                Uma senha temporária será gerada e mostrada UMA VEZ ao final.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-2">
              <div>
                <Label
                  htmlFor="new-email"
                  className="text-xs uppercase tracking-wider text-gray-400"
                >
                  Email *
                </Label>
                <input
                  id="new-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={200}
                  placeholder="usuario@dominio.com"
                  className="mt-1 h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
                />
              </div>
              <div>
                <Label
                  htmlFor="new-name"
                  className="text-xs uppercase tracking-wider text-gray-400"
                >
                  Nome completo *
                </Label>
                <input
                  id="new-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Ex: Maria Silva"
                  className="mt-1 h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
                />
              </div>
              <div>
                <Label
                  htmlFor="new-role"
                  className="text-xs uppercase tracking-wider text-gray-400"
                >
                  Função *
                </Label>
                <select
                  id="new-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="mt-1 h-10 w-full cursor-pointer rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none"
                >
                  <option value="viewer">
                    {ADMIN_ROLE_LABELS.viewer} — apenas visualização
                  </option>
                  <option value="editor">
                    {ADMIN_ROLE_LABELS.editor} — editar conteúdo
                  </option>
                  <option value="admin">
                    {ADMIN_ROLE_LABELS.admin} — acesso total
                  </option>
                </select>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar admin'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display uppercase text-success">
                ✅ Usuário criado!
              </DialogTitle>
              <DialogDescription className="text-gray-100">
                Compartilhe estas credenciais com a pessoa em um canal seguro.
                Esta é a única vez que a senha será mostrada.
              </DialogDescription>
            </DialogHeader>
            <div className="my-2 rounded-md border border-warning/30 bg-warning/10 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                <AlertCircle className="h-3.5 w-3.5" />
                Anote a senha agora — não será mostrada novamente
              </p>
            </div>
            <div className="space-y-3 py-2">
              <div className="rounded-md border border-border bg-bg-primary p-3">
                <p className="text-[10px] uppercase tracking-wider text-gray-400">
                  Email
                </p>
                <p className="break-all font-mono text-sm text-foreground">
                  {email}
                </p>
              </div>
              <div className="rounded-md border border-neon/40 bg-neon/5 p-3">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-neon">
                  Senha temporária
                </p>
                <p className="select-all break-all font-mono text-base text-foreground">
                  {tempPassword}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyCredentials}
                className="w-full"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copiar email + senha
                  </>
                )}
              </Button>
            </div>
            <DialogFooter>
              <Button type="button" onClick={closeAndReset}>
                Entendido, fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
