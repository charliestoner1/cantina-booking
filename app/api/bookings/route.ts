import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// Define bottle input type
interface BottleInput {
  id: string
  bottleId?: string
  quantity: number
  price?: number
  pricePerUnit?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      tableTypeId,
      date,
      customerName,
      customerEmail,
      customerPhone,
      partySize,
      occasion,
      specialRequests,
      bottles,
      minimumSpend,
      bottleSubtotal,
      depositAmount,
    } = body

    // Validate required fields
    if (
      !tableTypeId ||
      !date ||
      !customerName ||
      !customerEmail ||
      !customerPhone
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check table availability
    const selectedDate = new Date(date)
    const dateOnly = new Date(selectedDate.toISOString().split('T')[0])

    const inventory = await prisma.tableInventory.findUnique({
      where: {
        tableTypeId_date: {
          tableTypeId,
          date: dateOnly,
        },
      },
    })

    if (!inventory || inventory.available <= 0) {
      return NextResponse.json(
        { error: 'Table not available for selected date' },
        { status: 400 }
      )
    }

    // Create reservation with bottles in a transaction
    const reservation = await prisma.$transaction(async (tx) => {
      // Create the reservation
      const newReservation = await tx.reservation.create({
        data: {
          tableTypeId,
          date: selectedDate,
          customerName,
          customerEmail,
          customerPhone,
          partySize,
          occasion,
          specialRequests,
          minimumSpend,
          bottleSubtotal,
          depositAmount,
          status: 'PENDING',
          bottles: {
            create: (bottles as BottleInput[]).map((bottle) => ({
              bottleId: bottle.bottleId || bottle.id,
              quantity: bottle.quantity,
              pricePerUnit: bottle.pricePerUnit || bottle.price || 0,
              totalPrice:
                bottle.quantity * (bottle.pricePerUnit || bottle.price || 0),
            })),
          },
        },
        include: {
          bottles: {
            include: {
              bottle: true,
            },
          },
          tableType: true,
        },
      })

      // Update inventory
      await tx.tableInventory.update({
        where: {
          tableTypeId_date: {
            tableTypeId,
            date: dateOnly,
          },
        },
        data: {
          available: {
            decrement: 1,
          },
        },
      })

      // Create confirmation notification (optional)
      await tx.notification.create({
        data: {
          reservationId: newReservation.id,
          type: 'CONFIRMATION',
          recipient: customerEmail,
          subject: `Booking Confirmation - ${newReservation.confirmationCode}`,
          content: `Your booking for ${newReservation.tableType.name} on ${date} has been confirmed.`,
        },
      })

      return newReservation
    })

    return NextResponse.json({
      success: true,
      confirmationCode: reservation.confirmationCode,
      reservation,
    })
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create booking',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const confirmationCode = searchParams.get('code')
    const email = searchParams.get('email')

    let reservation

    if (confirmationCode) {
      reservation = await prisma.reservation.findUnique({
        where: { confirmationCode },
        include: {
          tableType: true,
          bottles: {
            include: {
              bottle: true,
            },
          },
        },
      })
    } else if (email) {
      const reservations = await prisma.reservation.findMany({
        where: { customerEmail: email },
        include: {
          tableType: true,
          bottles: {
            include: {
              bottle: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      })

      return NextResponse.json(reservations)
    }

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reservation)
  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}
