// app/api/admin/bottles/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET all bottles
export async function GET(request: NextRequest) {
  try {
    const bottles = await prisma.bottle.findMany({
      orderBy: {
        category: 'asc',
      },
    })

    return NextResponse.json(bottles)
  } catch (error) {
    console.error('Error fetching bottles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bottles' },
      { status: 500 }
    )
  }
}

// POST create new bottle
export async function POST(request: NextRequest) {
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

    // Validate required fields (size is required in schema!)
    if (!name || !brand || !category || !size || price === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields (name, brand, category, size, price)',
        },
        { status: 400 }
      )
    }

    const newBottle = await prisma.bottle.create({
      data: {
        name,
        brand,
        category,
        size, // Required field!
        price: parseFloat(price),
        description: description || '',
        image: imageUrl || '', // Schema uses 'image' not 'imageUrl'
        inStock: available !== undefined ? available : true,
        active: true,
      },
    })

    return NextResponse.json(newBottle, { status: 201 })
  } catch (error) {
    console.error('Error creating bottle:', error)
    return NextResponse.json(
      { error: 'Failed to create bottle' },
      { status: 500 }
    )
  }
}
