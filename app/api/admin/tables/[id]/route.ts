// app/api/admin/bottles/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET single bottle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bottle = await prisma.bottle.findUnique({
      where: { id: params.id },
    })

    if (!bottle) {
      return NextResponse.json({ error: 'Bottle not found' }, { status: 404 })
    }

    return NextResponse.json(bottle)
  } catch (error) {
    console.error('Error fetching bottle:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bottle' },
      { status: 500 }
    )
  }
}

// PATCH update bottle
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      brand,
      category,
      size,
      price,
      description,
      imageUrl,
      available,
    } = body

    const updatedBottle = await prisma.bottle.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(brand !== undefined && { brand }),
        ...(category !== undefined && { category }),
        ...(size !== undefined && { size }), // Required field
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { image: imageUrl }), // Schema uses 'image'
        ...(available !== undefined && { inStock: available }),
      },
    })

    return NextResponse.json(updatedBottle)
  } catch (error) {
    console.error('Error updating bottle:', error)
    return NextResponse.json(
      { error: 'Failed to update bottle' },
      { status: 500 }
    )
  }
}

// DELETE bottle
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if bottle is in any active reservations
    const activeReservations = await prisma.reservationBottle.count({
      where: {
        bottleId: params.id,
        reservation: {
          status: {
            in: ['PENDING', 'CONFIRMED'],
          },
        },
      },
    })

    if (activeReservations > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete bottle that is in active reservations. Mark as inactive instead.',
        },
        { status: 400 }
      )
    }

    await prisma.bottle.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Bottle deleted successfully' })
  } catch (error) {
    console.error('Error deleting bottle:', error)
    return NextResponse.json(
      { error: 'Failed to delete bottle' },
      { status: 500 }
    )
  }
}
