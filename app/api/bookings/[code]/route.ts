// app/api/bookings/[code]/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// This is the correct type for Next.js 13+ dynamic route params
interface RouteParams {
  params: Promise<{ code: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    // Await the params since it's a Promise in Next.js 13+
    const resolvedParams = await params
    const code = resolvedParams.code

    console.log('API: Fetching booking with code:', code)

    if (!code) {
      console.log('API: No code provided')
      return NextResponse.json(
        { error: 'No confirmation code provided' },
        { status: 400 }
      )
    }

    // Fetch the reservation with all related data
    const reservation = await prisma.reservation.findUnique({
      where: {
        confirmationCode: code,
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

    console.log(
      'API: Database query result:',
      reservation ? 'Found' : 'Not found'
    )

    if (!reservation) {
      console.log('API: Reservation not found for code:', code)
      return NextResponse.json(
        { error: `Booking not found for code: ${code}` },
        { status: 404 }
      )
    }

    console.log('API: Returning reservation:', reservation.id)

    // Convert Decimal fields to numbers for JSON serialization
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
