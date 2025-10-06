// app/api/admin/bookings/route.ts
import { prisma } from '@/lib/prisma'
import { Prisma, ReservationStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

// GET - List all bookings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const date = searchParams.get('date')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: Prisma.ReservationWhereInput = {}

    if (status && status !== 'ALL') {
      where.status = status as ReservationStatus
    }

    if (search) {
      where.OR = [
        { confirmationCode: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
      ]
    }

    if (date) {
      const selectedDate = new Date(date)
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0))
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999))

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      }
    }

    const bookings = await prisma.reservation.findMany({
      where,
      include: {
        tableType: true,
        bottles: {
          include: {
            bottle: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
      take: limit,
    })

    // Get summary stats
    const stats = await prisma.reservation.groupBy({
      by: ['status'],
      _count: true,
    })

    const totalRevenue = await prisma.reservation.aggregate({
      where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
      _sum: {
        bottleSubtotal: true,
        depositAmount: true,
      },
    })

    return NextResponse.json({
      bookings,
      stats,
      totalRevenue: {
        total: Number(totalRevenue._sum.bottleSubtotal || 0),
        deposits: Number(totalRevenue._sum.depositAmount || 0),
      },
    })
  } catch (error) {
    console.error('Admin bookings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// PATCH - Update booking status
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, status, notes } = body

    if (!bookingId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'COMPLETED',
      'CANCELLED',
      'NO_SHOW',
    ]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const booking = await prisma.reservation.update({
      where: { id: bookingId },
      data: {
        status,
        // Add notes field if you want to track admin notes
        // notes: notes || undefined,
      },
      include: {
        tableType: true,
        bottles: {
          include: {
            bottle: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, booking })
  } catch (error) {
    console.error('Admin booking update error:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
