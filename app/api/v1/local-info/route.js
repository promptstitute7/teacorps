import { db } from '@/lib/db'

export async function GET() {
  const entries = await db.localInfo.findMany({
    where: { isActive: true },
    orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
  })
  return Response.json(entries)
}
