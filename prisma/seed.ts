// prisma/seed.ts
import {
  BottleCategory,
  DayType,
  Prisma,
  PrismaClient,
  ReservationStatus,
} from '@prisma/client'

const prisma = new PrismaClient()

function usd(n: number) {
  return new Prisma.Decimal(n)
}

function todayNY() {
  // naive “local” today; your app interprets in America/New_York
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function addDays(d: Date, n: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}

async function seedTableTypes() {
  const tableTypes = [
    {
      slug: 'dance-floor-a',
      name: 'Dance Floor A',
      description: 'Closest to the DJ, high energy',
      capacity: 6,
      section: 'Dance Floor',
      amenities: ['Bottle Service', 'Prime View'],
      images: [],
      baseMinimumSpend: usd(300),
      sortOrder: 1,
    },
    {
      slug: 'dance-floor-b',
      name: 'Dance Floor B',
      description: 'Near the DJ booth',
      capacity: 6,
      section: 'Dance Floor',
      amenities: ['Bottle Service'],
      images: [],
      baseMinimumSpend: usd(300),
      sortOrder: 2,
    },
    {
      slug: 'lounge-a',
      name: 'Lounge A',
      description: 'Comfortable lounge seating',
      capacity: 8,
      section: 'Lounge',
      amenities: ['Bottle Service', 'Sofas'],
      images: [],
      baseMinimumSpend: usd(250),
      sortOrder: 3,
    },
    {
      slug: 'balcony-a',
      name: 'Balcony A',
      description: 'Balcony view over dance floor',
      capacity: 4,
      section: 'Balcony',
      amenities: ['Bottle Service', 'View'],
      images: [],
      baseMinimumSpend: usd(200),
      sortOrder: 4,
    },
  ]

  for (const t of tableTypes) {
    const tableType = await prisma.tableType.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        description: t.description,
        capacity: t.capacity,
        section: t.section,
        amenities: t.amenities,
        images: t.images,
        baseMinimumSpend: t.baseMinimumSpend,
        sortOrder: t.sortOrder,
        active: true,
      },
      create: t,
      select: { id: true, slug: true },
    })

    // Default WEEKDAY/WEEKEND rules using the non-null unique (tableTypeId, dayType, isDefault)
    const weekdayMin = t.baseMinimumSpend
    const weekendMin = t.baseMinimumSpend.mul(1.5)

    await prisma.pricingRule.upsert({
      where: {
        tableTypeId_dayType_isDefault: {
          tableTypeId: tableType.id,
          dayType: DayType.WEEKDAY,
          isDefault: true,
        },
      },
      update: { minimumSpend: weekdayMin, active: true, priority: 0 },
      create: {
        tableTypeId: tableType.id,
        dayType: DayType.WEEKDAY,
        minimumSpend: weekdayMin,
        depositRate: usd(0.15),
        isDefault: true,
        active: true,
        priority: 0,
      },
    })

    await prisma.pricingRule.upsert({
      where: {
        tableTypeId_dayType_isDefault: {
          tableTypeId: tableType.id,
          dayType: DayType.WEEKEND,
          isDefault: true,
        },
      },
      update: { minimumSpend: weekendMin, active: true, priority: 0 },
      create: {
        tableTypeId: tableType.id,
        dayType: DayType.WEEKEND,
        minimumSpend: weekendMin,
        depositRate: usd(0.2),
        isDefault: true,
        active: true,
        priority: 0,
      },
    })
  }
}

async function seedInventoryCalendar() {
  const start = todayNY()
  const days = 14

  const tableTypes = await prisma.tableType.findMany({
    where: { active: true },
    select: { id: true, slug: true, capacity: true, section: true },
  })

  for (let i = 0; i < days; i++) {
    const d = addDays(start, i)
    for (const tt of tableTypes) {
      const defaultCount = tt.section.toLowerCase().includes('dance')
        ? 3
        : tt.section.toLowerCase().includes('lounge')
          ? 4
          : 2

      await prisma.tableInventory.upsert({
        where: { tableTypeId_date: { tableTypeId: tt.id, date: d } },
        update: {
          totalCount: defaultCount,
          available: defaultCount,
          blocked: false,
        },
        create: {
          tableTypeId: tt.id,
          date: d,
          totalCount: defaultCount,
          available: defaultCount,
          blocked: false,
        },
      })
    }
  }
}

async function seedBottles() {
  const bottles = [
    {
      name: 'Patron Silver 750ml',
      brand: 'Patron',
      category: BottleCategory.TEQUILA,
      size: '750ml',
      price: usd(120),
      inStock: true,
      active: true,
      sortOrder: 1,
      sku: 'SKU-PATRON-750',
      onHand: 84,
      par: 120,
    },
    {
      name: 'Grey Goose 1L',
      brand: 'Grey Goose',
      category: BottleCategory.VODKA,
      size: '1L',
      price: usd(150),
      inStock: true,
      active: true,
      sortOrder: 2,
      sku: 'SKU-GOOSE-1L',
      onHand: 60,
      par: 90,
    },
    {
      name: 'Veuve Clicquot Brut',
      brand: 'Veuve Clicquot',
      category: BottleCategory.CHAMPAGNE,
      size: '750ml',
      price: usd(180),
      inStock: true,
      active: true,
      sortOrder: 3,
      sku: 'SKU-VEUVE-750',
      onHand: 36,
      par: 48,
    },
  ]

  for (const b of bottles) {
    await prisma.bottle.upsert({
      where: { sku: b.sku! },
      update: {
        name: b.name,
        brand: b.brand,
        category: b.category,
        size: b.size,
        price: b.price,
        inStock: b.inStock,
        active: b.active,
        sortOrder: b.sortOrder,
        onHand: b.onHand,
        par: b.par,
      },
      create: b,
    })
  }
}

async function seedSampleReservation() {
  const tonight = new Date()
  tonight.setHours(22, 0, 0, 0) // 10:00 PM local

  const table = await prisma.tableType.findFirst({
    where: { slug: { contains: 'dance-floor' } },
    select: { id: true, name: true },
  })

  if (!table) return

  await prisma.reservation.upsert({
    where: { confirmationCode: 'SEED-DEMO-001' },
    update: {
      tableTypeId: table.id,
      date: tonight,
      status: ReservationStatus.CONFIRMED,
      customerName: 'Alex Garcia',
      customerEmail: 'alex@example.com',
      customerPhone: '555-0100',
      partySize: 6,
      minimumSpend: usd(300),
      bottleSubtotal: usd(0),
      depositAmount: usd(50),
      depositPaid: true,
      specialRequests: 'Birthday 🎉 — sparkler at 11pm?',
    },
    create: {
      confirmationCode: 'SEED-DEMO-001',
      tableTypeId: table.id,
      date: tonight,
      status: ReservationStatus.CONFIRMED,
      customerName: 'Alex Garcia',
      customerEmail: 'alex@example.com',
      customerPhone: '555-0100',
      partySize: 6,
      minimumSpend: usd(300),
      bottleSubtotal: usd(0),
      depositAmount: usd(50),
      depositPaid: true,
      specialRequests: 'Birthday 🎉 — sparkler at 11pm?',
    },
  })
}

async function main() {
  console.log('Seeding TableTypes + PricingRules…')
  await seedTableTypes()

  console.log('Seeding TableInventory (next 14 days)…')
  await seedInventoryCalendar()

  console.log('Seeding Bottles (with SKUs & stock)…')
  await seedBottles()

  console.log('Seeding sample Reservation for tonight…')
  await seedSampleReservation()

  console.log('✓ Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
