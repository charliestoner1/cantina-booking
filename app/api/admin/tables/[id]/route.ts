// app/api/admin/tables/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET single table
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const table = await prisma.tableType.findUnique({
      where: { id: params.id },
    })

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 })
    }

    return NextResponse.json(table)
  } catch (error) {
    console.error('Error fetching table:', error)
    return NextResponse.json(
      { error: 'Failed to fetch table' },
      { status: 500 }
    )
  }
}

// PATCH update table
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      name,
      slug,
      description,
      capacity,
      baseMinimumSpend,
      amenities,
      imageUrl,
    } = body

    // Check if slug already exists on another table
    if (slug) {
      const existing = await prisma.tableType.findFirst({
        where: {
          slug,
          NOT: { id: params.id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'A table with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const updatedTable = await prisma.tableType.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description }),
        ...(capacity !== undefined && { capacity: parseInt(capacity) }),
        ...(baseMinimumSpend !== undefined && {
          baseMinimumSpend: parseFloat(baseMinimumSpend),
        }),
        ...(amenities !== undefined && { amenities }),
        ...(imageUrl !== undefined && { images: [imageUrl] }),
      },
    })

    return NextResponse.json(updatedTable)
  } catch (error) {
    console.error('Error updating table:', error)
    return NextResponse.json(
      { error: 'Failed to update table' },
      { status: 500 }
    )
  }
}

// DELETE table
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if there are any active reservations for this table
    const activeReservations = await prisma.reservation.count({
      where: {
        tableTypeId: params.id,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    })

    if (activeReservations > 0) {
      return NextResponse.json(
        {
          error:
            'Cannot delete table type with active reservations. Cancel reservations first.',
        },
        { status: 400 }
      )
    }

    await prisma.tableType.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Table deleted successfully' })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    )
  }
}
