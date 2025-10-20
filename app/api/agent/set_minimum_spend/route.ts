// app/api/agent/set_minimum_spend/route.ts
import { prisma } from '@/lib/prisma'
import { assertManager } from '@/lib/rbac'
import type { Prisma as PrismaNS } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Zod: either a single date OR start+end
const Schema = z
  .object({
    tableType: z.string().min(1, 'tableType is required'),
    amount: z.coerce.number().positive('amount must be > 0'),
    // either `date` or (`startDate` + `endDate`)
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .optional(),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .optional(),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'YYYY-MM-DD')
      .optional(),
    depositRate: z.coerce.number().min(0).max(1).default(0.15).optional(),
    eventName: z.string().optional(),
  })
  .refine((v) => !!v.date || (!!v.startDate && !!v.endDate), {
    message: 'Provide either `date` or both `startDate` and `endDate`.',
  })

export async function POST(req: NextRequest) {
  // RBAC
  try {
    assertManager(req)
  } catch (r: unknown) {
    return r as NextResponse
  }

  // Parse JSON body
  let body: z.infer<typeof Schema>
  try {
    body = Schema.parse(await req.json())
  } catch (e) {
    return NextResponse.json(
      {
        error: 'Invalid payload',
        details: (e as z.ZodError).issues ?? String(e),
      },
      { status: 400 }
    )
  }

  // Find the TableType by slug or name
  const tt = await prisma.tableType.findFirst({
    where: {
      OR: [{ slug: body.tableType }, { name: body.tableType }],
    },
    select: { id: true, name: true, slug: true },
  })
  if (!tt) {
    return NextResponse.json(
      { error: `TableType not found for '${body.tableType}'` },
      { status: 404 }
    )
  }

  // Convert money/decimal inputs to Prisma.Decimal without any casts
  const minimumSpend: PrismaNS.Decimal = new (
    await import('@prisma/client')
  ).Prisma.Decimal(
    body.amount.toFixed(2) // keep 2dp for @db.Decimal(10,2)
  )
  const depositRate: PrismaNS.Decimal = new (
    await import('@prisma/client')
  ).Prisma.Decimal(
    Number(body.depositRate ?? 0.15).toFixed(2) // @db.Decimal(3,2)
  )

  // Build date window
  let startDate: Date | null = null
  let endDate: Date | null = null

  if (body.date) {
    // single-day rule (local midnight to 23:59:59 in UTC string; adjust if you later add TZ handling)
    startDate = new Date(`${body.date}T00:00:00.000Z`)
    endDate = new Date(`${body.date}T23:59:59.999Z`)
  } else {
    // range rule
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    startDate = new Date(`${body.startDate!}T00:00:00.000Z`)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    endDate = new Date(`${body.endDate!}T23:59:59.999Z`)
  }

  // Create a SPECIAL_EVENT PricingRule
  const rule = await prisma.pricingRule.create({
    data: {
      tableTypeId: tt.id,
      dayType: 'SPECIAL_EVENT',
      minimumSpend,
      depositRate,
      eventName: body.eventName ?? null,
      startDate,
      endDate,
      priority: 10,
      active: true,
    },
    select: {
      id: true,
      minimumSpend: true,
      depositRate: true,
      startDate: true,
      endDate: true,
    },
  })

  return NextResponse.json({
    created: {
      id: rule.id,
      tableType: { id: tt.id, name: tt.name, slug: tt.slug },
      minimumSpend: Number(rule.minimumSpend),
      depositRate: Number(rule.depositRate),
      startDate: rule.startDate?.toISOString() ?? null,
      endDate: rule.endDate?.toISOString() ?? null,
    },
  })
}
