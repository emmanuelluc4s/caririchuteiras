type Props = {
  embedUrl?: string | null
  address?: string | null
}

// Mapa default centralizado em Barbalha/CE
const DEFAULT_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3974.0!2d-39.3!3d-7.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!2s!5e0!3m2!1spt-BR!2sbr!4v1700000000000'

export function ContactMap({ embedUrl, address }: Props) {
  const src = embedUrl?.trim() ? embedUrl : DEFAULT_EMBED

  return (
    <div className="space-y-2">
      <h2 className="font-display text-2xl uppercase tracking-tight">
        Como nos <span className="text-neon">encontrar</span>
      </h2>
      <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-bg-secondary md:aspect-[4/3]">
        <iframe
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={address ? `Mapa: ${address}` : 'Localização da loja'}
          className="absolute inset-0 h-full w-full grayscale-[30%] transition-all duration-500 hover:grayscale-0"
        />
      </div>
      {address && (
        <p className="text-sm text-gray-400">
          <strong className="text-foreground">{address}</strong>
        </p>
      )}
    </div>
  )
}
