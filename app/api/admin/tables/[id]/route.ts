// app/api/admin/tables/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PATCH update table
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    const body = await request.json()
    const {
      name,
      slug,
      description,
      shortDescription, // ADD THIS
      capacity,
      baseMinimumSpend,
      amenities,
      imageUrl,
    } = body

    // If slug is changing, check it doesn't already exist
    if (slug) {
      const existing = await prisma.tableType.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Table with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const updatedTable = await prisma.tableType.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(shortDescription && { shortDescription }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(baseMinimumSpend && {
          baseMinimumSpend: parseFloat(baseMinimumSpend),
        }),
        ...(amenities && { amenities }),
        ...(imageUrl !== undefined && { imageUrl }),
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
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    // Check if there are any bookings with this table type
    const bookingCount = await prisma.reservation.count({
      where: { tableTypeId: id },
    })

    if (bookingCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete table type with ${bookingCount} existing bookings`,
        },
        { status: 400 }
      )
    }

    await prisma.tableType.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json(
      { error: 'Failed to delete table' },
      { status: 500 }
    )
  }
}
