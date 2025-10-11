// app/api/admin/pricing/[id]/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET single pricing rule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pricingRule = await prisma.pricingRule.findUnique({
      where: { id },
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

    if (!pricingRule) {
      return NextResponse.json(
        { error: 'Pricing rule not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(pricingRule)
  } catch (error) {
    console.error('Error fetching pricing rule:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pricing rule' },
      { status: 500 }
    )
  }
}

// PATCH update pricing rule
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Validate day type if provided
    if (dayType) {
      const validDayTypes = ['WEEKDAY', 'WEEKEND', 'SPECIAL_EVENT']
      if (!validDayTypes.includes(dayType)) {
        return NextResponse.json(
          {
            error:
              'Invalid dayType. Must be WEEKDAY, WEEKEND, or SPECIAL_EVENT',
          },
          { status: 400 }
        )
      }
    }

    const updatedPricingRule = await prisma.pricingRule.update({
      where: { id },
      data: {
        ...(tableTypeId !== undefined && { tableTypeId }),
        ...(dayType !== undefined && { dayType }),
        ...(minimumSpend !== undefined && {
          minimumSpend: parseFloat(minimumSpend),
        }),
        ...(depositRate !== undefined && {
          depositRate: parseFloat(depositRate),
        }),
        ...(eventName !== undefined && { eventName }),
        ...(startDate !== undefined && {
          startDate: startDate ? new Date(startDate) : null,
        }),
        ...(endDate !== undefined && {
          endDate: endDate ? new Date(endDate) : null,
        }),
        ...(priority !== undefined && { priority: parseInt(priority) }),
        ...(active !== undefined && { active }),
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

    return NextResponse.json(updatedPricingRule)
  } catch (error) {
    console.error('Error updating pricing rule:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing rule' },
      { status: 500 }
    )
  }
}

// DELETE pricing rule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Optional: Check if this rule is critical (base weekday pricing)
    const rule = await prisma.pricingRule.findUnique({
      where: { id },
    })

    if (!rule) {
      return NextResponse.json(
        { error: 'Pricing rule not found' },
        { status: 404 }
      )
    }

    await prisma.pricingRule.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Pricing rule deleted successfully' })
  } catch (error) {
    console.error('Error deleting pricing rule:', error)
    return NextResponse.json(
      { error: 'Failed to delete pricing rule' },
      { status: 500 }
    )
  }
}
