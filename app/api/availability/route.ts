// app/api/availability/route.ts - Matches your exact schema
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tableId = searchParams.get('tableId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!tableId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Fetch inventory for date range
    const inventory = await prisma.tableInventory.findMany({
      where: {
        tableTypeId: tableId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        blocked: false, // Don't include blocked dates
      },
    })

    // Count existing reservations
    const reservations = await prisma.reservation.findMany({
      where: {
        tableTypeId: tableId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      select: {
        date: true,
      },
    })

    // Create reservation count map
    const reservationCounts = new Map<string, number>()
    reservations.forEach((res) => {
      const dateStr = res.date.toISOString().split('T')[0]
      reservationCounts.set(dateStr, (reservationCounts.get(dateStr) || 0) + 1)
    })

    // Build availability response using your schema's actual column names
    const availability = inventory.map((inv) => {
      const dateStr = inv.date.toISOString().split('T')[0]
      const reserved = reservationCounts.get(dateStr) || 0

      // Your schema has both 'totalCount' and 'available' fields
      // 'available' is the current availability
      // 'totalCount' is the total capacity
      const currentlyAvailable = Math.max(0, inv.available - reserved)

      // Simple day of week check for pricing
      const dayOfWeek = inv.date.getDay()
      let priceMultiplier = 1
      const isSpecialEvent = false

      // Weekend pricing (Friday = 5, Saturday = 6)
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        priceMultiplier = 1.5
      }

      return {
        date: dateStr,
        available: currentlyAvailable,
        total: inv.totalCount,
        priceMultiplier,
        isSpecialEvent,
      }
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch availability',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
