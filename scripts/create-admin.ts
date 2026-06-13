/**
 * Cria o primeiro usuário admin (ou outros) interativamente.
 * Uso: pnpm create-admin
 *
 * 1) Cria usuário no Supabase Auth (com email confirmado)
 * 2) Cria registro AdminUser com a role escolhida
 */
import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'
import * as readline from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

const prisma = new PrismaClient()
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
)

async function main() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error(
      '❌ Faltam NEXT_PUBLIC_SUPABASE_URL e/ou SUPABASE_SERVICE_ROLE_KEY no ambiente.',
    )
    console.error(
      '   Rode com: pnpm tsx --env-file=.env.local scripts/create-admin.ts',
    )
    process.exit(1)
  }

  const rl = readline.createInterface({ input, output })
  console.log('\n🔐 Criar admin Cariri Chuteiras\n')

  const email = (await rl.question('Email: ')).trim().toLowerCase()
  const name = (await rl.question('Nome completo: ')).trim()
  const password = (await rl.question('Senha (mín 8 chars): ')).trim()
  const roleInput =
    (await rl.question('Role (admin/editor/viewer) [admin]: ')).trim() ||
    'admin'
  rl.close()

  if (!['admin', 'editor', 'viewer'].includes(roleInput)) {
    console.error('❌ Role inválida.')
    process.exit(1)
  }
  if (password.length < 8) {
    console.error('❌ Senha precisa ter no mínimo 8 caracteres.')
    process.exit(1)
  }
  if (name.length < 2) {
    console.error('❌ Nome muito curto.')
    process.exit(1)
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (existing) {
    console.error(`❌ Já existe admin com email ${email}`)
    process.exit(1)
  }

  const { data: supabaseUser, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

  if (createError || !supabaseUser.user) {
    console.error('❌ Erro ao criar no Supabase:', createError?.message)
    process.exit(1)
  }

  const adminUser = await prisma.adminUser.create({
    data: {
      supabaseId: supabaseUser.user.id,
      email,
      name,
      role: roleInput as 'admin' | 'editor' | 'viewer',
      isActive: true,
    },
  })

  console.log(`\n✅ Admin criado!`)
  console.log(`   Email: ${adminUser.email}`)
  console.log(`   Nome:  ${adminUser.name}`)
  console.log(`   Role:  ${adminUser.role}`)
  console.log(`   ID:    ${adminUser.id}`)
  console.log(`\n🚀 Acesse /admin/login para entrar.\n`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
