// app/api/bookings/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Helper to determine if string is a UUID or confirmation code
function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

// GET single booking (by ID or confirmation code)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const idOrCode = resolvedParams.id

    console.log('API: Fetching booking with:', idOrCode)

    if (!idOrCode) {
      return NextResponse.json(
        { error: 'No ID or confirmation code provided' },
        { status: 400 }
      )
    }

    // Determine if this is a UUID (database ID) or confirmation code
    const whereClause = isUUID(idOrCode)
      ? { id: idOrCode }
      : { confirmationCode: idOrCode }

    const reservation = await prisma.reservation.findUnique({
      where: whereClause,
      include: {
        tableType: true,
        bottles: {
          include: {
            bottle: true,
          },
        },
      },
    })

    console.log(
      'API: Database query result:',
      reservation ? 'Found' : 'Not found'
    )

    if (!reservation) {
      return NextResponse.json(
        { error: `Booking not found for: ${idOrCode}` },
        { status: 404 }
      )
    }

    // Convert Decimal fields to strings for JSON serialization
    const serializedReservation = {
      ...reservation,
      minimumSpend: reservation.minimumSpend.toString(),
      bottleSubtotal: reservation.bottleSubtotal.toString(),
      depositAmount: reservation.depositAmount.toString(),
      bottles: reservation.bottles.map((bottle) => ({
        ...bottle,
        pricePerUnit: bottle.pricePerUnit.toString(),
        totalPrice: bottle.totalPrice.toString(),
      })),
      tableType: {
        ...reservation.tableType,
        baseMinimumSpend: reservation.tableType.baseMinimumSpend.toString(),
      },
    }

    return NextResponse.json(serializedReservation)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch booking',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// PATCH update booking status (by database ID only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    // PATCH only works with database IDs
    if (!isUUID(id)) {
      return NextResponse.json(
        { error: 'PATCH requires database ID, not confirmation code' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { status } = body

    // Validate status
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

    const updatedBooking = await prisma.reservation.update({
      where: { id },
      data: { status },
      include: {
        tableType: true,
        bottles: {
          include: {
            bottle: true,
          },
        },
      },
    })

    // Serialize Decimal fields
    const serializedBooking = {
      ...updatedBooking,
      minimumSpend: updatedBooking.minimumSpend.toString(),
      bottleSubtotal: updatedBooking.bottleSubtotal.toString(),
      depositAmount: updatedBooking.depositAmount.toString(),
      bottles: updatedBooking.bottles.map((bottle) => ({
        ...bottle,
        pricePerUnit: bottle.pricePerUnit.toString(),
        totalPrice: bottle.totalPrice.toString(),
      })),
      tableType: {
        ...updatedBooking.tableType,
        baseMinimumSpend: updatedBooking.tableType.baseMinimumSpend.toString(),
      },
    }

    return NextResponse.json(serializedBooking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE booking (by database ID only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const id = resolvedParams.id

    // DELETE only works with database IDs
    if (!isUUID(id)) {
      return NextResponse.json(
        { error: 'DELETE requires database ID, not confirmation code' },
        { status: 400 }
      )
    }

    await prisma.reservation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    )
  }
}
