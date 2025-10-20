import { prisma } from '@/lib/prisma'
import { assertManager } from '@/lib/rbac'
import { endOfDay, startOfDay } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const tz = 'America/New_York'

// Accepts optional date; defaults to “today” local to NY.
// shift can be "evening" (>=18:00 local) or "all"
const Schema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  shift: z.enum(['evening', 'all']).default('all'),
})

export async function POST(req: NextRequest) {
  // RBAC guard: assertManager() should throw a NextResponse on failure.
  try {
    assertManager(req)
  } catch (r: unknown) {
    return r as NextResponse
  }

  // Parse body safely and satisfy TS
  let body: z.infer<typeof Schema>
  try {
    const raw = (await req.json().catch(() => ({}))) as unknown
    body = Schema.parse(raw)
  } catch (e: unknown) {
    const details =
      typeof e === 'object' && e !== null && 'issues' in e
        ? (e as { issues?: unknown }).issues
        : String(e)
    return NextResponse.json(
      { error: 'Invalid payload', details },
      { status: 400 }
    )
  }

  // Resolve the target day in America/New_York
  const nowLocal = toZonedTime(new Date(), tz)
  const targetLocal = body.date
    ? toZonedTime(new Date(`${body.date}T00:00:00Z`), tz)
    : nowLocal

  // Compute start/end of that local day, then convert to UTC for DB query
  const localStart = startOfDay(targetLocal)
  const localEnd = endOfDay(targetLocal)
  const startUtc = fromZonedTime(localStart, tz)
  const endUtc = fromZonedTime(localEnd, tz)

  const rows = await prisma.reservation.findMany({
    where: { date: { gte: startUtc, lte: endUtc } },
    select: {
      id: true,
      customerName: true,
      partySize: true,
      date: true,
      status: true,
      tableType: {
        select: { id: true, name: true, section: true, slug: true },
      },
    },
    orderBy: { date: 'asc' },
  })

  // Shift filter in local time (NY)
  const filtered = rows.filter((r) => {
    if (body.shift === 'all') return true
    const local = toZonedTime(r.date, tz)
    return local.getHours() >= 18 // evening == 6pm+
  })

  // Format YYYY-MM-DD in local tz
  const yyyy = localStart.getFullYear()
  const mm = String(localStart.getMonth() + 1).padStart(2, '0')
  const dd = String(localStart.getDate()).padStart(2, '0')
  const dateStr = body.date ?? `${yyyy}-${mm}-${dd}`

  return NextResponse.json({
    date: dateStr,
    shift: body.shift,
    count: filtered.length,
    bookings: filtered.map((r) => {
      const local = toZonedTime(r.date, tz)
      return {
        bookingId: r.id,
        guest: r.customerName,
        size: r.partySize,
        timeUtc: r.date.toISOString(),
        timeLocal: local.toISOString(),
        status: r.status,
        tableTypeId: r.tableType?.id ?? null,
        tableTypeName: r.tableType?.name ?? '',
        section: r.tableType?.section ?? null,
        slug: r.tableType?.slug ?? null,
      }
    }),
  })
}
