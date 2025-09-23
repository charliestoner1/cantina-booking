// app/api/bottles/route.ts - Matches your schema
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const bottles = await prisma.bottle.findMany({
      where: {
        inStock: true,
        active: true, // Your schema also has an 'active' field
      },
      orderBy: [
        { category: 'asc' },
        { sortOrder: 'asc' }, // Your schema has sortOrder
        { price: 'asc' },
      ],
    })

    // Transform the data to include any missing fields the frontend expects
    const transformedBottles = bottles.map((bottle) => ({
      ...bottle,
      imageUrl: bottle.image, // Your schema uses 'image' not 'imageUrl'
      price: Number(bottle.price), // Ensure price is a number
    }))

    return NextResponse.json(transformedBottles)
  } catch (error) {
    console.error('Error fetching bottles:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch bottles',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
