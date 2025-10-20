import { prisma } from '@/lib/prisma'
import { assertManager } from '@/lib/rbac'
import { endOfDay, startOfDay } from 'date-fns'
import { fromZonedTime, toZonedTime } from 'date-fns-tz'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const tz = 'America/New_York'

const Schema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().email().optional(),
  confirmationCode: z.string().trim().min(1).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(), // YYYY-MM-DD
})

export async function POST(req: NextRequest) {
  try {
    assertManager(req)
  } catch (r: unknown) {
    return r as NextResponse
  }

  let body: z.infer<typeof Schema>
  try {
    body = Schema.parse(await req.json())
  } catch (e: unknown) {
    return NextResponse.json(
      {
        error: 'Invalid payload',
        details: e instanceof z.ZodError ? e.issues : String(e),
      },
      { status: 400 }
    )
  }

  const where: Record<string, unknown> = {}

  if (body.name)
    where.customerName = { contains: body.name, mode: 'insensitive' }
  if (body.email)
    where.customerEmail = { equals: body.email, mode: 'insensitive' }
  if (body.confirmationCode) where.confirmationCode = body.confirmationCode

  if (body.date) {
    // local (NY) day -> UTC bounds
    const localMidnight = toZonedTime(new Date(`${body.date}T00:00:00Z`), tz)
    const startUtc = fromZonedTime(startOfDay(localMidnight), tz)
    const endUtc = fromZonedTime(endOfDay(localMidnight), tz)
    where.date = { gte: startUtc, lte: endUtc }
  }

  const rows = await prisma.reservation.findMany({
    where,
    include: {
      tableType: true,
      bottles: { include: { bottle: true } },
    },
    orderBy: { date: 'asc' },
    take: 100,
  })

  return NextResponse.json({
    count: rows.length,
    results: rows.map((r) => ({
      id: r.id,
      confirmationCode: r.confirmationCode,
      status: r.status,
      guest: r.customerName,
      email: r.customerEmail,
      phone: r.customerPhone,
      partySize: r.partySize,
      timeUtc: r.date.toISOString(),
      tableType: r.tableType
        ? {
            id: r.tableType.id,
            name: r.tableType.name,
            section: r.tableType.section,
            slug: r.tableType.slug,
          }
        : null,
      bottles: r.bottles.map((b) => ({
        id: b.bottle.id,
        name: b.bottle.name,
        brand: b.bottle.brand,
        quantity: b.quantity,
        totalPrice: Number(b.totalPrice),
      })),
      minimumSpend: Number(r.minimumSpend),
      bottleSubtotal: Number(r.bottleSubtotal),
      depositAmount: Number(r.depositAmount),
    })),
  })
}
