'use client'

import * as React from 'react'
import { Link2, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useAnalytics } from '@/lib/analytics/use-analytics'
import { cn } from '@/lib/utils'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.5a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.04z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

type Props = {
  productName: string
  productUrl: string
}

export function ShareButtons({ productName, productUrl }: Props) {
  const { track } = useAnalytics()
  const [copied, setCopied] = React.useState(false)

  function handleShare(channel: string, action: () => void) {
    track('share_click', { metadata: { channel, productUrl } })
    action()
  }

  const text = `Olha esse produto da Cariri Chuteiras: ${productName}`

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${text} ${productUrl}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(productUrl)}`,
    tiktok: `https://www.tiktok.com/upload?text=${encodeURIComponent(`${text} ${productUrl}`)}`,
    instagram: 'https://www.instagram.com/',
  }

  function copyLink() {
    navigator.clipboard.writeText(productUrl).then(() => {
      setCopied(true)
      toast.success('Link copiado!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function openInstagramShare() {
    copyLink()
    toast.info('Cole no Instagram Stories', {
      description: 'O link foi copiado. Abra o Instagram e cole nos stories.',
    })
    window.open(shareLinks.instagram, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-wider text-gray-400">
        Compartilhar
      </p>
      <div className="flex flex-wrap gap-2">
        <ShareButton
          label="WhatsApp"
          icon={<WhatsAppIcon className="h-4 w-4" />}
          onClick={() =>
            handleShare('whatsapp', () =>
              window.open(shareLinks.whatsapp, '_blank', 'noopener,noreferrer'),
            )
          }
          className="hover:!border-whatsapp hover:!bg-whatsapp hover:!text-white"
        />
        <ShareButton
          label="Instagram"
          icon={<InstagramIcon className="h-4 w-4" />}
          onClick={() => handleShare('instagram', openInstagramShare)}
        />
        <ShareButton
          label="TikTok"
          icon={<TiktokIcon className="h-4 w-4" />}
          onClick={() =>
            handleShare('tiktok', () =>
              window.open(shareLinks.tiktok, '_blank', 'noopener,noreferrer'),
            )
          }
        />
        <ShareButton
          label="Facebook"
          icon={<FacebookIcon className="h-4 w-4" />}
          onClick={() =>
            handleShare('facebook', () =>
              window.open(shareLinks.facebook, '_blank', 'noopener,noreferrer'),
            )
          }
        />
        <ShareButton
          label="X"
          icon={<XIcon className="h-4 w-4" />}
          onClick={() =>
            handleShare('x', () =>
              window.open(shareLinks.x, '_blank', 'noopener,noreferrer'),
            )
          }
        />
        <ShareButton
          label={copied ? 'Copiado' : 'Copiar link'}
          icon={
            copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Link2 className="h-4 w-4" />
            )
          }
          onClick={() => handleShare('copy-link', copyLink)}
        />
      </div>
    </div>
  )
}

function ShareButton({
  label,
  icon,
  onClick,
  className,
}: {
  label: string
  icon: React.ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border bg-bg-secondary px-3 py-2 text-xs text-foreground transition-all hover:border-neon hover:text-neon',
        className,
      )}
    >
      {icon}
      {label}
    </button>
  )
}
