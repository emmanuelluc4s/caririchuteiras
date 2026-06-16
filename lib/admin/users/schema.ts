import { z } from 'zod'

export const AdminRoleEnum = z.enum(['admin', 'editor', 'viewer'])

export const CreateAdminSchema = z.object({
  email: z.string().email('Email inválido').max(200).toLowerCase(),
  name: z.string().min(2, 'Nome muito curto').max(80),
  role: AdminRoleEnum,
})

export const UpdateAdminSchema = z.object({
  name: z.string().min(2).max(80),
  role: AdminRoleEnum,
  isActive: z.boolean(),
})

export type CreateAdminValues = z.infer<typeof CreateAdminSchema>
export type UpdateAdminValues = z.infer<typeof UpdateAdminSchema>

export function generateTempPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghjkmnpqrstuvwxyz'
  const digits = '23456789'
  const symbols = '!@#$%&*'
  function pick(set: string, n: number): string {
    let out = ''
    for (let i = 0; i < n; i++) {
      out += set[Math.floor(Math.random() * set.length)]
    }
    return out
  }
  const raw =
    pick(upper, 3) + pick(lower, 3) + pick(digits, 3) + pick(symbols, 3)
  const arr = raw.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr.join('')
}
