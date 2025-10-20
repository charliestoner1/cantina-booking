import { prisma } from '@/lib/prisma'
import { assertManager } from '@/lib/rbac'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const Schema = z.object({
  skuOrName: z.string().trim().min(1),
  setOnHand: z.number().int().optional(),
  deltaOnHand: z.number().int().optional(),
  setPar: z.number().int().optional(),
})

const BottleRow = z.object({
  id: z.string(),
  sku: z.string().nullable(),
  brand: z.string(),
  name: z.string(),
  size: z.string(),
  onhand: z.number(),
  par: z.number(),
})

async function resolveBottleSingle(skuOrName: string) {
  const bySku = await prisma.$queryRaw<Array<unknown>>`
    SELECT id, sku, brand, name, size,
           COALESCE("onHand", 0) AS onhand,
           COALESCE("par", 0) AS par
    FROM "Bottle"
    WHERE "sku" ILIKE ${skuOrName}
    LIMIT 1
  `
  if (bySku.length === 1) return BottleRow.parse(bySku[0])

  const fuzzy = await prisma.$queryRaw<Array<unknown>>`
    SELECT id, sku, brand, name, size,
           COALESCE("onHand", 0) AS onhand,
           COALESCE("par", 0) AS par
    FROM "Bottle"
    WHERE (name ILIKE ${'%' + skuOrName + '%'} OR brand ILIKE ${'%' + skuOrName + '%'})
      AND "active" = true
    ORDER BY brand ASC, name ASC
    LIMIT 5
  `
  const parsed = fuzzy.map((x) => BottleRow.parse(x))
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

  const { skuOrName, setOnHand, deltaOnHand, setPar } = body
  if (setOnHand == null && deltaOnHand == null && setPar == null) {
    return NextResponse.json(
      { error: 'Provide setOnHand, deltaOnHand, or setPar.' },
      { status: 400 }
    )
  }

  const resolved = await resolveBottleSingle(skuOrName)
  if ('multiple' in resolved) {
    return NextResponse.json(
      {
        disambiguationRequired: true,
        candidates: resolved.multiple.map((b) => ({
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

  const current = resolved
  const nextOnHand =
    setOnHand ??
    (deltaOnHand != null ? current.onhand + deltaOnHand : current.onhand)
  const nextPar = setPar ?? current.par

  // Update via raw to touch custom columns
  await prisma.$executeRaw`
    UPDATE "Bottle"
    SET "onHand" = ${nextOnHand}, "par" = ${nextPar}, "inStock" = ${nextOnHand > 0}
    WHERE id = ${current.id}
  `

  return NextResponse.json({
    updated: {
      id: current.id,
      sku: current.sku,
      brand: current.brand,
      name: current.name,
      onHand: nextOnHand,
      par: nextPar,
    },
    message: `Inventory updated for ${current.brand} ${current.name}.`,
  })
}
