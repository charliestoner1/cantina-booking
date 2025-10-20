import { prisma } from '@/lib/prisma'
import { assertManager } from '@/lib/rbac'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const Item = z.object({
  skuOrName: z.string().trim().min(1),
  quantity: z.number().int().positive(),
})

const Schema = z.object({
  items: z.array(Item).min(1),
  supplierEmail: z.string().email(),
  notes: z.string().trim().optional(),
})

const BottlePick = z.object({
  id: z.string(),
  sku: z.string().nullable(),
  brand: z.string(),
  name: z.string(),
  size: z.string(),
})

async function findBottleForPO(skuOrName: string) {
  const bySku = await prisma.$queryRaw<Array<unknown>>`
    SELECT id, sku, brand, name, size
    FROM "Bottle"
    WHERE "sku" ILIKE ${skuOrName}
    LIMIT 1
  `
  if (bySku.length === 1) return BottlePick.parse(bySku[0])

  const fuzzy = await prisma.$queryRaw<Array<unknown>>`
    SELECT id, sku, brand, name, size
    FROM "Bottle"
    WHERE (name ILIKE ${'%' + skuOrName + '%'} OR brand ILIKE ${'%' + skuOrName + '%'})
      AND "active" = true
    ORDER BY brand ASC, name ASC
    LIMIT 5
  `
  const parsed = fuzzy.map((x) => BottlePick.parse(x))
  if (parsed.length === 1) return parsed[0]
  return { multiple: parsed }
}

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

  const resolved: Array<{
    bottleId: string
    label: string
    quantity: number
    sku: string | null
  }> = []

  for (const it of body.items) {
    const hit = await findBottleForPO(it.skuOrName)
    if ('multiple' in hit) {
      return NextResponse.json(
        {
          disambiguationRequired: true,
          for: it.skuOrName,
          candidates: hit.multiple.map((b) => ({
            id: b.id,
            sku: b.sku,
            brand: b.brand,
            name: b.name,
            size: b.size,
          })),
        },
        { status: 409 }
      )
    }
    resolved.push({
      bottleId: hit.id,
      label: `${hit.brand} ${hit.name} ${hit.size}`,
      quantity: it.quantity,
      sku: hit.sku,
    })
  }

  const payload = {
    createdAt: new Date().toISOString(),
    supplierEmail: body.supplierEmail,
    notes: body.notes ?? null,
    items: resolved,
  }

  await prisma.settings.upsert({
    where: { key: 'lastPurchaseOrder' },
    update: { value: payload, description: 'Latest generated purchase order' },
    create: {
      key: 'lastPurchaseOrder',
      value: payload,
      description: 'Latest generated purchase order',
    },
  })

  const emailDraft = [
    `To: ${body.supplierEmail}`,
    `Subject: Purchase Order`,
    ``,
    `Hello,`,
    `Please confirm the following order:`,
    ``,
    ...resolved.map(
      (r) => `- ${r.label}${r.sku ? ` (SKU ${r.sku})` : ''}: ${r.quantity}`
    ),
    ``,
    body.notes ? `Notes: ${body.notes}` : '',
    `Thank you.`,
  ]
    .filter(Boolean)
    .join('\n')

  return NextResponse.json({
    savedKey: 'lastPurchaseOrder',
    itemCount: resolved.length,
    emailDraft,
  })
}
