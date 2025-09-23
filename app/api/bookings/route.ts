// app/api/bookings/route.ts - Properly typed for your schema
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface BottleInput {
  id: string
  bottleId?: string
  quantity: number
  price: number
  priceAtTime?: number
  name: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      tableTypeId,
      date,
      customerFirstName,
      customerLastName,
      customerEmail,
      customerPhone,
      partySize,
      occasion,
      specialRequests,
      total,
      bottles,
    } = body

    // Combine first and last name for your schema
    const customerName = `${customerFirstName} ${customerLastName}`.trim()

    // Calculate deposit (15% of total)
    const depositAmount = Math.round(total * 0.15)

    // Type the bottles array properly
    const bottlesData = (bottles as BottleInput[]).map((bottle) => ({
      bottleId: bottle.bottleId || bottle.id,
      quantity: bottle.quantity,
      pricePerUnit: bottle.priceAtTime || bottle.price,
      totalPrice: (bottle.priceAtTime || bottle.price) * bottle.quantity,
    }))

    // Create the reservation with bottles
    const reservation = await prisma.reservation.create({
      data: {
        tableTypeId,
        date: new Date(date),
        customerName,
        customerEmail,
        customerPhone,
        partySize: Number(partySize),
        occasion: occasion || null,
        specialRequests: specialRequests || null,
        status: 'PENDING',
        minimumSpend: Number(total),
        bottleSubtotal: Number(total),
        depositAmount: Number(depositAmount),
        depositPaid: false,
        bottles: {
          create: bottlesData,
        },
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

    // Create notification record
    try {
      await prisma.notification.create({
        data: {
          reservationId: reservation.id,
          type: 'CONFIRMATION',
          recipient: customerEmail,
          subject: 'Reservation Confirmation',
          content: `Your reservation for ${customerName} on ${new Date(date).toLocaleDateString()} has been confirmed.`,
        },
      })
    } catch (notificationError) {
      console.log('Notification creation skipped')
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      {
        error: 'Failed to create reservation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (id) {
      // Get single reservation
      const reservation = await prisma.reservation.findUnique({
        where: { id },
        include: {
          tableType: true,
          bottles: {
            include: {
              bottle: true,
            },
          },
        },
      })

      if (!reservation) {
        return NextResponse.json(
          { error: 'Reservation not found' },
          { status: 404 }
        )
      }

      // Add split names for compatibility with frontend
      const nameParts = reservation.customerName.split(' ')
      const enhancedReservation = {
        ...reservation,
        customerFirstName: nameParts[0] || '',
        customerLastName: nameParts.slice(1).join(' ') || '',
        totalAmount: reservation.bottleSubtotal,
      }

      return NextResponse.json(enhancedReservation)
    } else {
      // Get all reservations (for admin)
      const reservations = await prisma.reservation.findMany({
        include: {
          tableType: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return NextResponse.json(reservations)
    }
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch reservations',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
