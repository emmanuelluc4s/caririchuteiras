import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const cfg = await prisma.siteConfig.findUnique({
    where: { id: 'singleton' },
  })
  if (!cfg) {
    console.log('Nenhum SiteConfig encontrado.')
    return
  }
  const current = Array.isArray(cfg.promoBarMessages)
    ? (cfg.promoBarMessages as unknown[])
    : []
  const filtered = current.filter(
    (m): m is string =>
      typeof m === 'string' && !m.toLowerCase().includes('sem juros'),
  )
  console.log(`Mensagens antes: ${current.length} | depois: ${filtered.length}`)
  if (current.length === filtered.length) {
    console.log('Nenhuma mensagem com "sem juros" — nada a fazer.')
    return
  }
  await prisma.siteConfig.update({
    where: { id: 'singleton' },
    data: { promoBarMessages: filtered },
  })
  console.log('OK — promoBarMessages atualizado.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
