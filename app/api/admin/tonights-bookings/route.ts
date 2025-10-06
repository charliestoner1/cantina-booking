// app/api/admin/tonights-bookings/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get today's date in YOUR timezone (not UTC)
    const now = new Date()
    const todayLocal = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    )

    // Fetch all bookings
    const allBookings = await prisma.reservation.findMany({
      include: {
        tableType: true,
        bottles: {
          include: {
            bottle: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Filter bookings where the UTC date matches today's local date
    const bookings = allBookings.filter((booking) => {
      const bookingDateUTC = new Date(booking.date)
      // Get the UTC date components
      const bookingYear = bookingDateUTC.getUTCFullYear()
      const bookingMonth = bookingDateUTC.getUTCMonth()
      const bookingDay = bookingDateUTC.getUTCDate()

      const bookingLocalDate = new Date(bookingYear, bookingMonth, bookingDay)

      return bookingLocalDate.toDateString() === todayLocal.toDateString()
    })

    console.log(`Found ${bookings.length} bookings for today`)

    const stats = {
      totalBookings: bookings.length,
      pending: bookings.filter((b) => b.status === 'PENDING').length,
      confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      noShows: bookings.filter((b) => b.status === 'NO_SHOW').length,
      cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
      expectedRevenue: bookings
        .filter((b) => ['PENDING', 'CONFIRMED'].includes(b.status))
        .reduce((sum, b) => sum + Number(b.minimumSpend), 0),
      actualRevenue: bookings
        .filter((b) => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + Number(b.minimumSpend), 0),
    }

    return NextResponse.json({
      bookings,
      stats,
      date: now.toISOString(),
    })
  } catch (error) {
    console.error("Error fetching tonight's bookings:", error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
