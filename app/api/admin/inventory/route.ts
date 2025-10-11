// app/api/admin/inventory/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch inventory records with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tableTypeId = searchParams.get('tableTypeId')
    const date = searchParams.get('date')

    const where: {
      tableTypeId?: string
      date?: Date
    } = {}

    if (tableTypeId && tableTypeId !== 'all') {
      where.tableTypeId = tableTypeId
    }

    if (date) {
      where.date = new Date(date)
    }

    const inventory = await prisma.tableInventory.findMany({
      where,
      include: {
        tableType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { tableType: { name: 'asc' } }],
    })

    // Convert dates to ISO strings for JSON serialization
    const serializedInventory = inventory.map((record) => ({
      ...record,
      date: record.date.toISOString().split('T')[0],
      available: record.available,
      totalCount: record.totalCount,
    }))

    return NextResponse.json(serializedInventory)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

// POST - Create inventory records for a date range
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tableTypeId, startDate, endDate, totalCount, blocked } = body

    if (!tableTypeId || !startDate || !endDate || totalCount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate date range
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      return NextResponse.json(
        { error: 'Start date must be before or equal to end date' },
        { status: 400 }
      )
    }

    // Generate all dates in the range
    const dates: Date[] = []
    const currentDate = new Date(start)

    while (currentDate <= end) {
      dates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Create inventory records for each date
    const createdRecords = []

    for (const date of dates) {
      try {
        // Check if record already exists
        const existing = await prisma.tableInventory.findUnique({
          where: {
            tableTypeId_date: {
              tableTypeId,
              date,
            },
          },
        })

        if (existing) {
          // Update existing record
          const updated = await prisma.tableInventory.update({
            where: {
              id: existing.id,
            },
            data: {
              totalCount,
              available: totalCount, // Reset available to totalCount
              blocked: blocked || false,
            },
          })
          createdRecords.push(updated)
        } else {
          // Create new record
          const created = await prisma.tableInventory.create({
            data: {
              tableTypeId,
              date,
              totalCount,
              available: totalCount,
              blocked: blocked || false,
            },
          })
          createdRecords.push(created)
        }
      } catch (error) {
        console.error(`Error creating inventory for date ${date}:`, error)
      }
    }

    return NextResponse.json({
      message: `Created/updated ${createdRecords.length} inventory records`,
      records: createdRecords,
    })
  } catch (error) {
    console.error('Error creating inventory:', error)
    return NextResponse.json(
      {
        error: 'Failed to create inventory',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
