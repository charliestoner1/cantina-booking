// app/api/admin/pricing/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET all pricing rules
export async function GET(request: NextRequest) {
  try {
    const pricingRules = await prisma.pricingRule.findMany({
      include: {
        tableType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { tableTypeId: 'asc' },
        { priority: 'desc' },
        { dayType: 'asc' },
      ],
    })

    return NextResponse.json(pricingRules)
  } catch (error) {
    console.error('Error fetching pricing rules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing rules' },
      { status: 500 }
    )
  }
}

// POST create new pricing rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tableTypeId,
      dayType,
      minimumSpend,
      depositRate,
      eventName,
      startDate,
      endDate,
      priority,
      active,
    } = body

    // Validate required fields
    if (!tableTypeId || !dayType || minimumSpend === undefined) {
      return NextResponse.json(
        {
          error: 'Missing required fields (tableTypeId, dayType, minimumSpend)',
        },
        { status: 400 }
      )
    }

    // Validate day type
    const validDayTypes = ['WEEKDAY', 'WEEKEND', 'SPECIAL_EVENT']
    if (!validDayTypes.includes(dayType)) {
      return NextResponse.json(
        {
          error: 'Invalid dayType. Must be WEEKDAY, WEEKEND, or SPECIAL_EVENT',
        },
        { status: 400 }
      )
    }

    // For special events, validate date range
    if (dayType === 'SPECIAL_EVENT') {
      if (!startDate || !endDate) {
        return NextResponse.json(
          { error: 'Special events require startDate and endDate' },
          { status: 400 }
        )
      }
      if (!eventName) {
        return NextResponse.json(
          { error: 'Special events require an eventName' },
          { status: 400 }
        )
      }
    }

    const newPricingRule = await prisma.pricingRule.create({
      data: {
        tableTypeId,
        dayType,
        minimumSpend: parseFloat(minimumSpend),
        depositRate: depositRate !== undefined ? parseFloat(depositRate) : 0.15,
        eventName: eventName || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        priority: priority !== undefined ? parseInt(priority) : 0,
        active: active !== undefined ? active : true,
      },
      include: {
        tableType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(newPricingRule, { status: 201 })
  } catch (error) {
    console.error('Error creating pricing rule:', error)
    return NextResponse.json(
      { error: 'Failed to create pricing rule' },
      { status: 500 }
    )
  }
}
