'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryType: 'shoe' | 'apparel'
}

const SHOE_SIZES = [
  { br: '36', us: '5.5', eu: '36', cm: '23' },
  { br: '37', us: '6', eu: '37', cm: '23.5' },
  { br: '38', us: '7', eu: '38', cm: '24' },
  { br: '39', us: '7.5', eu: '39', cm: '24.5' },
  { br: '40', us: '8', eu: '40', cm: '25' },
  { br: '41', us: '9', eu: '41', cm: '26' },
  { br: '42', us: '9.5', eu: '42', cm: '26.5' },
  { br: '43', us: '10.5', eu: '43', cm: '27.5' },
  { br: '44', us: '11', eu: '44', cm: '28' },
]

const APPAREL_SIZES = [
  { size: 'P', chest: '90-94', waist: '74-78' },
  { size: 'M', chest: '95-99', waist: '79-83' },
  { size: 'G', chest: '100-104', waist: '84-88' },
  { size: 'GG', chest: '105-109', waist: '89-93' },
]

export function SizeChartModal({ open, onOpenChange, categoryType }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-bg-secondary">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl uppercase tracking-tight">
            Tabela de numerações
          </DialogTitle>
        </DialogHeader>

        {categoryType === 'shoe' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-neon">
                    BR
                  </th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-400">
                    US
                  </th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-400">
                    EU
                  </th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-400">
                    CM
                  </th>
                </tr>
              </thead>
              <tbody>
                {SHOE_SIZES.map((s) => (
                  <tr
                    key={s.br}
                    className="border-b border-border/40 hover:bg-bg-tertiary"
                  >
                    <td className="px-3 py-2 font-bold text-foreground">
                      {s.br}
                    </td>
                    <td className="px-3 py-2 text-gray-100">{s.us}</td>
                    <td className="px-3 py-2 text-gray-100">{s.eu}</td>
                    <td className="px-3 py-2 text-gray-100">{s.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-neon">
                    Tamanho
                  </th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-400">
                    Tórax (cm)
                  </th>
                  <th className="px-3 py-2 text-left text-xs uppercase tracking-wider text-gray-400">
                    Cintura (cm)
                  </th>
                </tr>
              </thead>
              <tbody>
                {APPAREL_SIZES.map((s) => (
                  <tr
                    key={s.size}
                    className="border-b border-border/40 hover:bg-bg-tertiary"
                  >
                    <td className="px-3 py-2 font-bold text-foreground">
                      {s.size}
                    </td>
                    <td className="px-3 py-2 text-gray-100">{s.chest}</td>
                    <td className="px-3 py-2 text-gray-100">{s.waist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="pt-2 text-xs text-gray-400">
          Em caso de dúvida sobre numeração, fale conosco no WhatsApp.
        </p>
      </DialogContent>
    </Dialog>
  )
}
