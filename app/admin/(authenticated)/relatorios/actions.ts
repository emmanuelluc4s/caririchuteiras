'use server'

import Papa from 'papaparse'
import { requireRole } from '@/lib/admin/auth'
import { parseMonth, getMonthlyReport } from '@/lib/admin/reports/queries'

type ExportResult =
  | { ok: true; csv: string; filename: string }
  | { ok: false; error: string }

export async function exportMonthlyReportAction(
  monthKey: string,
): Promise<ExportResult> {
  try {
    await requireRole(['admin', 'editor'])
    const month = parseMonth(monthKey)
    const report = await getMonthlyReport(month)

    const sections: string[] = []

    sections.push('# RELATÓRIO MENSAL — ' + report.monthLabel.toUpperCase())
    sections.push('')
    sections.push('## KPIs')
    sections.push(
      Papa.unparse(
        [
          {
            Metrica: 'Visitantes',
            Valor: report.visitors,
            VariacaoPct: report.variations.visitors,
          },
          {
            Metrica: 'Page Views',
            Valor: report.pageViews,
            VariacaoPct: report.variations.pageViews,
          },
          {
            Metrica: 'Cliques WhatsApp',
            Valor: report.whatsappClicks,
            VariacaoPct: report.variations.whatsappClicks,
          },
          {
            Metrica: 'Itens no Carrinho',
            Valor: report.cartAdds,
            VariacaoPct: report.variations.cartAdds,
          },
          {
            Metrica: 'Novas Avaliacoes',
            Valor: report.newReviews,
            VariacaoPct: report.variations.newReviews,
          },
          {
            Metrica: 'Taxa de Conversao (%)',
            Valor: report.conversionRate.toFixed(2),
            VariacaoPct: report.variations.conversionRate,
          },
        ],
        { delimiter: ';' },
      ),
    )
    sections.push('')
    sections.push('## TOP PRODUTOS')
    sections.push(
      Papa.unparse(
        report.topProducts.map((p) => ({
          Produto: p.name,
          Marca: p.brand,
          Visualizacoes: p.views,
          CliquesWhatsApp: p.whatsappClicks,
        })),
        { delimiter: ';' },
      ),
    )
    sections.push('')
    sections.push('## TOP TERMOS BUSCADOS')
    sections.push(
      Papa.unparse(
        report.topSearches.map((s) => ({ Termo: s.query, Buscas: s.count })),
        { delimiter: ';' },
      ),
    )
    sections.push('')
    sections.push('## ORIGEM DOS CLIQUES WHATSAPP')
    sections.push(
      Papa.unparse(
        report.sources.map((s) => ({ Origem: s.source, Cliques: s.count })),
        { delimiter: ';' },
      ),
    )

    return {
      ok: true,
      csv: sections.join('\n'),
      filename: `relatorio_${report.month}.csv`,
    }
  } catch (error) {
    console.error('[exportMonthlyReport]', error)
    return { ok: false, error: 'Erro ao gerar relatório' }
  }
}
