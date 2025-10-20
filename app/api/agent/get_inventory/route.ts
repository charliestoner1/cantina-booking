import { prisma } from '@/lib/prisma'
import { assertManager } from '@/lib/rbac'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const Schema = z.object({
  skuOrName: z.string().trim().min(1).optional(),
  limit: z.number().int().min(1).max(500).default(100),
})

const Row = z.object({
  id: z.string(),
  sku: z.string().nullable(),
  name: z.string(),
  brand: z.string(),
  category: z.string(),
  size: z.string(),
  price: z.number(),
  onhand: z.number(),
  par: z.number(),
  active: z.boolean(),
  instock: z.boolean(),
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

  const { skuOrName, limit } = body

  // Use raw SQL to include custom columns (sku, onHand, par) that Prisma schema doesn't know about
  const rows = skuOrName
    ? await prisma.$queryRaw<Array<unknown>>`
        SELECT id, sku, name, brand, category, size,
               price::float AS price,
               COALESCE("onHand", 0) AS onhand,
               COALESCE("par", 0) AS par,
               "active", "inStock" AS instock
        FROM "Bottle"
        WHERE ("sku" ILIKE ${skuOrName} OR name ILIKE ${'%' + skuOrName + '%'} OR brand ILIKE ${'%' + skuOrName + '%'})
          AND "active" = true
        ORDER BY brand ASC, name ASC
        LIMIT ${limit}
      `
    : await prisma.$queryRaw<Array<unknown>>`
        SELECT id, sku, name, brand, category, size,
               price::float AS price,
               COALESCE("onHand", 0) AS onhand,
               COALESCE("par", 0) AS par,
               "active", "inStock" AS instock
        FROM "Bottle"
        WHERE "active" = true
        ORDER BY brand ASC, name ASC
        LIMIT ${limit}
      `

  const parsed = rows.map((r) => Row.parse(r))

  return NextResponse.json({
    count: parsed.length,
    items: parsed.map((b) => ({
      id: b.id,
      sku: b.sku,
      name: b.name,
      brand: b.brand,
      category: b.category,
      size: b.size,
      price: b.price,
      onHand: b.onhand,
      par: b.par,
      active: b.active,
      inStock: b.instock,
    })),
  })
}
