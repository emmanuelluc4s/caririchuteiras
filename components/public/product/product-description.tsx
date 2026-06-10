import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { sanitizeProductHtml } from '@/lib/sanitize-html'

type Props = {
  description?: string | null
  attributes: {
    material?: string | null
    weight?: string | null
    collar?: string | null
    technology?: string | null
    useIndication?: string | null
    warranty?: string | null
    origin?: string | null
  }
}

export function ProductDescription({ description, attributes }: Props) {
  const hasAttributes = Object.values(attributes).some(Boolean)

  if (!description && !hasAttributes) return null

  return (
    <Accordion
      type="multiple"
      defaultValue={['description']}
      className="space-y-2"
    >
      {description && (
        <AccordionItem
          value="description"
          className="rounded-lg border border-border bg-bg-secondary px-4 md:px-5"
        >
          <AccordionTrigger className="font-display text-lg uppercase tracking-tight hover:no-underline">
            Descrição
          </AccordionTrigger>
          <AccordionContent>
            <div
              className="prose prose-invert prose-sm max-w-none text-gray-100 [&_a]:text-neon [&_a]:underline [&_h2]:text-foreground [&_h3]:text-foreground [&_li]:my-1 [&_p]:my-2 [&_strong]:text-foreground [&_ul]:my-2"
              dangerouslySetInnerHTML={{
                __html: sanitizeProductHtml(description),
              }}
            />
          </AccordionContent>
        </AccordionItem>
      )}

      {hasAttributes && (
        <AccordionItem
          value="attributes"
          className="rounded-lg border border-border bg-bg-secondary px-4 md:px-5"
        >
          <AccordionTrigger className="font-display text-lg uppercase tracking-tight hover:no-underline">
            Especificações
          </AccordionTrigger>
          <AccordionContent>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 pt-1 text-sm sm:grid-cols-2">
              {attributes.material && (
                <AttributeRow label="Material" value={attributes.material} />
              )}
              {attributes.weight && (
                <AttributeRow label="Peso" value={attributes.weight} />
              )}
              {attributes.collar && (
                <AttributeRow label="Gola" value={attributes.collar} />
              )}
              {attributes.technology && (
                <AttributeRow label="Tecnologia" value={attributes.technology} />
              )}
              {attributes.useIndication && (
                <AttributeRow
                  label="Indicação"
                  value={attributes.useIndication}
                />
              )}
              {attributes.warranty && (
                <AttributeRow label="Garantia" value={attributes.warranty} />
              )}
              {attributes.origin && (
                <AttributeRow label="Origem" value={attributes.origin} />
              )}
            </dl>
          </AccordionContent>
        </AccordionItem>
      )}

      <AccordionItem
        value="delivery"
        className="rounded-lg border border-border bg-bg-secondary px-4 md:px-5"
      >
        <AccordionTrigger className="font-display text-lg uppercase tracking-tight hover:no-underline">
          Entrega e atendimento
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2 text-sm text-gray-100">
            <li>🚚 Entregamos para todo o Cariri</li>
            <li>📍 Retirada na loja física em Barbalha/CE</li>
            <li>💬 Negociação de frete e prazos pelo WhatsApp</li>
            <li>✅ Garantia de 3 meses contra defeitos de fabricação</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

function AttributeRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/50 py-2">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value}</dd>
    </div>
  )
}
