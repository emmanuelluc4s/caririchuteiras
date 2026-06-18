'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Save,
  AlertTriangle,
  Plus,
  Trash2,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import {
  saveSiteConfigAction,
  toggleMaintenanceAction,
} from '@/app/admin/(authenticated)/configuracoes/actions'
import { cn } from '@/lib/utils'
import type { SiteConfigValues } from '@/lib/admin/config/schema'

type Props = {
  initialValues: SiteConfigValues
  canEdit: boolean
}

export function ConfigForm({ initialValues, canEdit }: Props) {
  const router = useRouter()
  const [values, setValues] = React.useState<SiteConfigValues>(initialValues)
  const [saving, setSaving] = React.useState(false)
  const [confirmMaintenance, setConfirmMaintenance] = React.useState<
    boolean | null
  >(null)

  function patch(p: Partial<SiteConfigValues>) {
    setValues((prev) => ({ ...prev, ...p }))
  }

  async function handleSave() {
    if (!canEdit) {
      toast.error('Apenas administradores podem editar')
      return
    }
    setSaving(true)
    const result = await saveSiteConfigAction(values)
    setSaving(false)
    if (result.ok) {
      toast.success('Configurações salvas!', {
        description: 'Mudanças aplicadas em todo o site',
      })
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function confirmMaintenanceToggle() {
    if (confirmMaintenance === null) return
    const enable = confirmMaintenance
    setConfirmMaintenance(null)
    setSaving(true)
    const result = await toggleMaintenanceAction(enable)
    setSaving(false)
    if (result.ok && result.data) {
      patch({ isMaintenanceMode: result.data.isMaintenanceMode })
      toast.success(
        enable
          ? '🛠️ Modo manutenção ATIVO — site fora do ar'
          : '✅ Site VOLTOU ao ar',
      )
      router.refresh()
    } else if (!result.ok) {
      toast.error(result.error)
    }
  }

  return (
    <>
      {!canEdit && (
        <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <p className="text-xs text-warning">
            Apenas administradores podem editar essas configurações. Você está
            em modo leitura.
          </p>
        </div>
      )}

      <Tabs defaultValue="geral">
        <TabsList className="grid w-full grid-cols-3 bg-bg-secondary md:grid-cols-6">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="redes">Redes</TabsTrigger>
          <TabsTrigger value="promo">Promo Bar</TabsTrigger>
          <TabsTrigger value="integracoes" className="hidden md:inline-flex">
            Integrações
          </TabsTrigger>
          <TabsTrigger
            value="manutencao"
            className={cn(
              'relative hidden md:inline-flex',
              values.isMaintenanceMode &&
                'data-[state=active]:bg-warning/20 data-[state=inactive]:text-warning',
            )}
          >
            Manutenção
            {values.isMaintenanceMode && (
              <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-warning" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-6 space-y-6">
          <Card title="Identidade da loja">
            <FieldGroup label="Nome da loja *">
              <input
                type="text"
                value={values.storeName}
                onChange={(e) => patch({ storeName: e.target.value })}
                disabled={!canEdit}
                className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none disabled:opacity-50"
              />
            </FieldGroup>
            <FieldGroup
              label="Tagline"
              hint="Frase curta que descreve a loja"
            >
              <input
                type="text"
                value={values.storeTagline ?? ''}
                onChange={(e) =>
                  patch({ storeTagline: e.target.value || null })
                }
                disabled={!canEdit}
                maxLength={120}
                placeholder="Ex: O esporte do Cariri começa aqui"
                className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none disabled:opacity-50"
              />
            </FieldGroup>
            <FieldGroup label="Descrição">
              <Textarea
                value={values.storeDescription ?? ''}
                onChange={(e) =>
                  patch({ storeDescription: e.target.value || null })
                }
                disabled={!canEdit}
                maxLength={500}
                rows={3}
                placeholder="Descrição usada em SEO e em telas iniciais"
                className="border-border bg-bg-primary disabled:opacity-50"
              />
            </FieldGroup>
          </Card>

          <Card title="Localização e contato">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup label="Email">
                <input
                  type="email"
                  value={values.storeEmail ?? ''}
                  onChange={(e) =>
                    patch({ storeEmail: e.target.value || null })
                  }
                  disabled={!canEdit}
                  placeholder="contato@caririchuteiras.com.br"
                  className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none disabled:opacity-50"
                />
              </FieldGroup>
              <FieldGroup label="Cidade">
                <input
                  type="text"
                  value={values.storeCity ?? ''}
                  onChange={(e) =>
                    patch({ storeCity: e.target.value || null })
                  }
                  disabled={!canEdit}
                  placeholder="Barbalha/CE"
                  className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none disabled:opacity-50"
                />
              </FieldGroup>
              <FieldGroup label="Endereço completo" className="sm:col-span-2">
                <input
                  type="text"
                  value={values.storeAddress ?? ''}
                  onChange={(e) =>
                    patch({ storeAddress: e.target.value || null })
                  }
                  disabled={!canEdit}
                  placeholder="Rua, número, bairro, CEP"
                  className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none disabled:opacity-50"
                />
              </FieldGroup>
            </div>
          </Card>

          <Card title="SEO padrão (fallback)">
            <FieldGroup
              label={`Meta título padrão (${(values.defaultMetaTitle ?? '').length}/70)`}
              hint="Usado quando a página não tem título próprio"
            >
              <input
                type="text"
                value={values.defaultMetaTitle ?? ''}
                onChange={(e) =>
                  patch({ defaultMetaTitle: e.target.value || null })
                }
                disabled={!canEdit}
                maxLength={70}
                className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none disabled:opacity-50"
              />
            </FieldGroup>
            <FieldGroup
              label={`Meta descrição padrão (${(values.defaultMetaDescription ?? '').length}/170)`}
            >
              <Textarea
                value={values.defaultMetaDescription ?? ''}
                onChange={(e) =>
                  patch({ defaultMetaDescription: e.target.value || null })
                }
                disabled={!canEdit}
                maxLength={170}
                rows={2}
                className="border-border bg-bg-primary disabled:opacity-50"
              />
            </FieldGroup>
            <FieldGroup
              label="URL da imagem OpenGraph"
              hint="1200×630px recomendado para compartilhamento em redes"
            >
              <input
                type="url"
                value={values.ogImageUrl ?? ''}
                onChange={(e) =>
                  patch({ ogImageUrl: e.target.value || null })
                }
                disabled={!canEdit}
                placeholder="https://..."
                className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none disabled:opacity-50"
              />
            </FieldGroup>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6 space-y-6">
          <Card title="Configurações do WhatsApp">
            <FieldGroup
              label="Número do WhatsApp *"
              hint="Formato internacional: +55 88 99999-9999"
            >
              <input
                type="tel"
                value={values.whatsappNumber}
                onChange={(e) => patch({ whatsappNumber: e.target.value })}
                disabled={!canEdit}
                placeholder="+5588999999999"
                className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 font-mono text-sm focus:border-neon focus:outline-none disabled:opacity-50"
              />
            </FieldGroup>
            <FieldGroup label="Horário de atendimento">
              <input
                type="text"
                value={values.whatsappBusinessHours ?? ''}
                onChange={(e) =>
                  patch({ whatsappBusinessHours: e.target.value || null })
                }
                disabled={!canEdit}
                placeholder="Seg-Sex 8h-18h | Sáb 8h-12h"
                className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none disabled:opacity-50"
              />
            </FieldGroup>
            <FieldGroup
              label="Mensagem de boas-vindas"
              hint="Texto exibido em pop-ups e gatilhos antes do WhatsApp abrir"
            >
              <Textarea
                value={values.whatsappWelcomeMessage ?? ''}
                onChange={(e) =>
                  patch({ whatsappWelcomeMessage: e.target.value || null })
                }
                disabled={!canEdit}
                maxLength={500}
                rows={3}
                className="border-border bg-bg-primary disabled:opacity-50"
              />
            </FieldGroup>
          </Card>
        </TabsContent>

        <TabsContent value="redes" className="mt-6 space-y-6">
          <Card title="Redes sociais">
            {(
              [
                {
                  key: 'instagramUrl',
                  label: 'Instagram URL',
                  placeholder: 'https://instagram.com/cariri.chuteiras',
                },
                {
                  key: 'facebookUrl',
                  label: 'Facebook URL',
                  placeholder: 'https://facebook.com/cariri.chuteiras',
                },
                {
                  key: 'tiktokUrl',
                  label: 'TikTok URL',
                  placeholder: 'https://tiktok.com/@cariri.chuteiras',
                },
                {
                  key: 'youtubeUrl',
                  label: 'YouTube URL',
                  placeholder: 'https://youtube.com/@cariri.chuteiras',
                },
                {
                  key: 'twitterUrl',
                  label: 'X (Twitter) URL',
                  placeholder: 'https://x.com/cariri.chuteiras',
                },
              ] as const
            ).map((field) => (
              <FieldGroup key={field.key} label={field.label}>
                <input
                  type="url"
                  value={values[field.key] ?? ''}
                  onChange={(e) =>
                    patch({ [field.key]: e.target.value || null } as Partial<SiteConfigValues>)
                  }
                  disabled={!canEdit}
                  placeholder={field.placeholder}
                  className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none disabled:opacity-50"
                />
              </FieldGroup>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="promo" className="mt-6 space-y-6">
          <Card title="Promo Bar (faixa superior)">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <Label className="text-sm">Promo Bar ativa</Label>
              <Switch
                checked={values.promoBarEnabled}
                onCheckedChange={(v) => patch({ promoBarEnabled: v })}
                disabled={!canEdit}
              />
            </div>
            <FieldGroup
              label="Mensagens em rotação"
              hint="Aparecem na faixa superior, alternando a cada ~5s. Máximo 8."
            >
              <div className="space-y-2">
                {values.promoBarMessages.map((msg, i) => (
                  <PromoMessageRow
                    key={i}
                    value={msg}
                    onChange={(v) => {
                      const next = [...values.promoBarMessages]
                      next[i] = v
                      patch({ promoBarMessages: next })
                    }}
                    onRemove={() =>
                      patch({
                        promoBarMessages: values.promoBarMessages.filter(
                          (_, j) => j !== i,
                        ),
                      })
                    }
                    disabled={!canEdit}
                  />
                ))}
                {values.promoBarMessages.length < 8 && canEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      patch({
                        promoBarMessages: [...values.promoBarMessages, ''],
                      })
                    }
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Adicionar mensagem
                  </Button>
                )}
              </div>
            </FieldGroup>
          </Card>
        </TabsContent>

        <TabsContent value="integracoes" className="mt-6 space-y-6">
          <Card title="Pixels e Analytics">
            <FieldGroup
              label="Meta (Facebook) Pixel ID"
              hint="Para rastreamento de conversão no Facebook/Instagram Ads"
            >
              <input
                type="text"
                value={values.metaPixelId ?? ''}
                onChange={(e) =>
                  patch({ metaPixelId: e.target.value || null })
                }
                disabled={!canEdit}
                placeholder="1234567890123456"
                className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 font-mono text-sm focus:border-neon focus:outline-none disabled:opacity-50"
              />
            </FieldGroup>
            <FieldGroup label="Google Analytics 4 ID" hint="Formato: G-XXXXXXXXXX">
              <input
                type="text"
                value={values.ga4Id ?? ''}
                onChange={(e) => patch({ ga4Id: e.target.value || null })}
                disabled={!canEdit}
                placeholder="G-XXXXXXXXXX"
                className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 font-mono text-sm focus:border-neon focus:outline-none disabled:opacity-50"
              />
            </FieldGroup>
            <FieldGroup
              label="Microsoft Clarity ID"
              hint="Para heatmaps e session recording (grátis)"
            >
              <input
                type="text"
                value={values.clarityId ?? ''}
                onChange={(e) =>
                  patch({ clarityId: e.target.value || null })
                }
                disabled={!canEdit}
                placeholder="abc12345xyz"
                className="h-10 w-full rounded-md border border-border bg-bg-primary px-3 font-mono text-sm focus:border-neon focus:outline-none disabled:opacity-50"
              />
            </FieldGroup>
          </Card>
        </TabsContent>

        <TabsContent value="manutencao" className="mt-6 space-y-6">
          <Card
            title="Modo manutenção"
            tone={values.isMaintenanceMode ? 'warning' : undefined}
          >
            {values.isMaintenanceMode && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <div className="space-y-1 text-xs text-warning">
                  <p className="font-semibold">
                    🛠️ Site fora do ar para visitantes
                  </p>
                  <p>
                    Apenas admins logados podem acessar o site. Visitantes são
                    redirecionados para{' '}
                    <code className="font-mono">/manutencao</code>.
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <Label className="text-sm">Modo manutenção</Label>
                <p className="mt-0.5 text-[10px] text-gray-400">
                  Esconde o site público temporariamente
                </p>
              </div>
              <Switch
                checked={values.isMaintenanceMode}
                onCheckedChange={(v) => setConfirmMaintenance(v)}
                disabled={!canEdit}
              />
            </div>
            <FieldGroup
              label="Mensagem exibida em /manutencao"
              hint="Use para explicar o motivo e tempo estimado"
            >
              <Textarea
                value={values.maintenanceMessage ?? ''}
                onChange={(e) =>
                  patch({ maintenanceMessage: e.target.value || null })
                }
                disabled={!canEdit}
                maxLength={500}
                rows={4}
                placeholder="Ex: Estamos melhorando o site para você. Voltamos em algumas horas!"
                className="border-border bg-bg-primary disabled:opacity-50"
              />
            </FieldGroup>
          </Card>
        </TabsContent>
      </Tabs>

      {canEdit && (
        <footer className="sticky bottom-0 -mx-4 flex justify-end gap-2 border-t border-border bg-bg-primary/95 px-4 pb-2 pt-4 backdrop-blur">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </Button>
        </footer>
      )}

      <AlertDialog
        open={confirmMaintenance !== null}
        onOpenChange={(o) => !o && setConfirmMaintenance(null)}
      >
        <AlertDialogContent className="border-border bg-bg-secondary">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display uppercase">
              {confirmMaintenance
                ? '🛠️ Ativar modo manutenção?'
                : '✅ Voltar o site ao ar?'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-100">
              {confirmMaintenance ? (
                <>
                  Visitantes serão redirecionados para a página de manutenção.{' '}
                  <strong className="text-warning">
                    O site público fica completamente inacessível até você
                    desativar.
                  </strong>
                </>
              ) : (
                <>O site voltará a ficar acessível para todos os visitantes.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-bg-tertiary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmMaintenanceToggle}
              className={cn(
                confirmMaintenance
                  ? 'bg-warning text-bg-primary hover:bg-warning/90'
                  : 'bg-success text-white hover:bg-success/90',
              )}
            >
              {confirmMaintenance
                ? 'Sim, ativar manutenção'
                : 'Sim, voltar ao ar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function Card({
  title,
  children,
  tone,
}: {
  title: string
  children: React.ReactNode
  tone?: 'warning'
}) {
  return (
    <section
      className={cn(
        'space-y-4 rounded-lg border bg-bg-secondary p-5 md:p-6',
        tone === 'warning' ? 'border-warning/30' : 'border-border',
      )}
    >
      <h2 className="border-b border-border pb-2 font-display text-base uppercase tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  )
}

function FieldGroup({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs uppercase tracking-wider text-gray-400">
        {label}
      </Label>
      {children}
      {hint && <p className="mt-1 text-[10px] text-gray-500">{hint}</p>}
    </div>
  )
}

function PromoMessageRow({
  value,
  onChange,
  onRemove,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  onRemove: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={120}
        placeholder="Ex: Entregamos para todo o Brasil • Confira!"
        className="h-10 flex-1 rounded-md border border-border bg-bg-primary px-3 text-sm focus:border-neon focus:outline-none disabled:opacity-50"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label="Remover"
        className="grid h-9 w-9 place-items-center rounded-md text-gray-400 hover:bg-danger/10 hover:text-danger disabled:opacity-30"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
