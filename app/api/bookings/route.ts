// app/api/bookings/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface BottleInput {
  bottleId: string
  quantity: number
  pricePerUnit: number
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

    // Parse and format the date
    const selectedDate = new Date(date)
    const dateOnly = new Date(selectedDate.toISOString().split('T')[0])

    // Check table availability
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
          occasion: occasion || null,
          specialRequests: specialRequests || null,
          minimumSpend: Number(minimumSpend),
          bottleSubtotal: Number(bottleSubtotal),
          depositAmount: Number(depositAmount),
          status: 'PENDING',
          bottles: {
            create: (bottles as BottleInput[]).map((bottle) => ({
              bottleId: bottle.bottleId,
              quantity: bottle.quantity,
              pricePerUnit: Number(bottle.pricePerUnit),
              totalPrice: Number(bottle.quantity) * Number(bottle.pricePerUnit),
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
          content: `Your booking for ${newReservation.tableType.name} on ${selectedDate.toLocaleDateString()} has been confirmed.`,
        },
      })

      return newReservation
    })

    // Return the complete reservation with confirmation code
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

// GET route to list bookings (optional, for admin or user history)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where = email ? { customerEmail: email } : {}

    const reservations = await prisma.reservation.findMany({
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

    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Booking fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
