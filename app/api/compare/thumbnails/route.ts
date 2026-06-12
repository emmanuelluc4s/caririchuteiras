import { NextResponse } from 'next/server'
import { getCompareThumbnails } from '@/lib/queries/compare'
import { COMPARE_MAX_ITEMS } from '@/lib/compare/types'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const idsParam = url.searchParams.get('ids') ?? ''
    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, COMPARE_MAX_ITEMS)

    if (ids.length === 0) {
      return NextResponse.json({ thumbnails: [] })
    }

    const thumbnails = await getCompareThumbnails(ids)
    return NextResponse.json({ thumbnails })
  } catch (error) {
    console.error('[compare/thumbnails] error:', error)
    return NextResponse.json({ thumbnails: [] }, { status: 500 })
  }
}
