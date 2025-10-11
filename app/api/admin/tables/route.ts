// app/api/admin/tables/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET all tables
export async function GET(request: NextRequest) {
  try {
    const tables = await prisma.tableType.findMany({
      orderBy: {
        baseMinimumSpend: 'asc',
      },
    })

    return NextResponse.json(tables)
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tables' },
      { status: 500 }
    )
  }
}

// POST create new table
export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (
      !name ||
      !slug ||
      !description ||
      !shortDescription ||
      !capacity ||
      !baseMinimumSpend
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.tableType.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Table with this slug already exists' },
        { status: 400 }
      )
    }

    const newTable = await prisma.tableType.create({
      data: {
        name,
        slug,
        description,
        shortDescription, // ADD THIS
        capacity: parseInt(capacity),
        baseMinimumSpend: parseFloat(baseMinimumSpend),
        amenities: amenities || [],
        imageUrl: imageUrl || '',
      },
    })

    return NextResponse.json(newTable, { status: 201 })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json(
      { error: 'Failed to create table' },
      { status: 500 }
    )
  }
}
