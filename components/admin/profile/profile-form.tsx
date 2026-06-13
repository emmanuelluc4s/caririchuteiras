'use client'

import * as React from 'react'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { updateProfileAction } from '@/app/admin/(authenticated)/perfil/actions'

type Props = {
  currentName: string
  currentAvatarUrl: string | null
}

export function ProfileForm({ currentName, currentAvatarUrl }: Props) {
  const [pending, setPending] = React.useState(false)
  const [name, setName] = React.useState(currentName)
  const [preview, setPreview] = React.useState<string | null>(currentAvatarUrl)
  const [file, setFile] = React.useState<File | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 2 * 1024 * 1024) {
      toast.error('Avatar máximo 2MB')
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  function resetAvatar() {
    setFile(null)
    setPreview(currentAvatarUrl)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(formData: FormData) {
    setPending(true)
    if (file) formData.set('avatar', file)
    const result = await updateProfileAction(formData)
    setPending(false)
    if (result.ok) {
      toast.success(result.message)
      setFile(null)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-5 rounded-lg border border-border bg-bg-secondary p-6 md:p-8"
    >
      <h2 className="font-display text-xl uppercase tracking-tight">
        Dados pessoais
      </h2>

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-border bg-bg-tertiary">
          {preview ? (
            <Image
              src={preview}
              alt=""
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-2xl font-bold text-gray-600">
              {name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0]?.toUpperCase())
                .join('')}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="avatar"
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-bg-primary px-3 py-2 text-xs transition-all hover:border-neon hover:text-neon"
          >
            <Camera className="h-3.5 w-3.5" />
            Alterar foto
            <input
              ref={fileRef}
              id="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImage}
              className="sr-only"
            />
          </label>
          {file && (
            <button
              type="button"
              onClick={resetAvatar}
              className="block text-[10px] text-gray-400 hover:text-danger"
            >
              Cancelar alteração
            </button>
          )}
          <p className="text-[10px] text-gray-500">JPG, PNG ou WebP até 2MB</p>
        </div>
      </div>

      <div>
        <Label
          htmlFor="name"
          className="text-xs uppercase tracking-wider text-gray-400"
        >
          Nome
        </Label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 h-11 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/30"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  )
}
