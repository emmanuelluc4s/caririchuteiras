'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { getCurrentAdmin } from '@/lib/admin/auth'

export async function logoutAction() {
  try {
    const admin = await getCurrentAdmin()
    if (admin) {
      await prisma.siteEvent.create({
        data: {
          type: 'admin_logout',
          metadata: {
            adminUserId: admin.id,
            email: admin.email,
          },
        },
      })
    }
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('[logoutAction] error:', error)
  }
  redirect('/admin/login')
}
