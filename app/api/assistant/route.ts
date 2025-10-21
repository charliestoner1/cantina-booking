// app/api/assistant/route.ts
// AI Assistant API endpoint for Claude-powered bar management queries
/* eslint-disable @typescript-eslint/no-explicit-any */

import Anthropic from '@anthropic-ai/sdk'
import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

console.log(
  '🔑 API Key loaded:',
  process.env.ANTHROPIC_API_KEY ? 'YES ✅' : 'NO ❌'
)

const prisma = new PrismaClient()
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Tool definitions for Claude to use
const tools = [
  {
    name: 'get_low_stock_bottles',
    description:
      'Get bottles that are running low on inventory (below par level or critically low)',
    input_schema: {
      type: 'object',
      properties: {
        threshold: {
          type: 'string',
          description:
            'Threshold type: "below_par" (below par level) or "critical" (less than 5 bottles)',
          enum: ['below_par', 'critical'],
        },
      },
      required: ['threshold'],
    },
  },
  {
    name: 'get_todays_reservations',
    description:
      'Get all reservations for today or a specific date, including table assignments and guest info',
    input_schema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description:
            'Date in YYYY-MM-DD format. Defaults to today if not specified.',
        },
      },
    },
  },
  {
    name: 'get_top_spenders',
    description: 'Get the highest spending customers for a given time period',
    input_schema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          description: 'Time period: "month", "week", "year", or "all_time"',
          enum: ['month', 'week', 'year', 'all_time'],
        },
        limit: {
          type: 'number',
          description: 'Number of top spenders to return (default: 10)',
        },
      },
      required: ['period'],
    },
  },
  {
    name: 'get_revenue_stats',
    description: 'Get revenue statistics for a given period',
    input_schema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          description: 'Time period: "today", "week", "month", "year"',
          enum: ['today', 'week', 'month', 'year'],
        },
      },
      required: ['period'],
    },
  },
  {
    name: 'search_reservations',
    description:
      'Search for reservations by customer name, email, phone, or confirmation code',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search term (name, email, phone, or confirmation code)',
        },
      },
      required: ['query'],
    },
  },
]

// Tool implementation functions
async function getLowStockBottles(threshold: 'below_par' | 'critical') {
  // Fetch all active bottles and filter in memory since Prisma doesn't support
  // comparing two fields directly (onHand < par)
  const allBottles = await prisma.bottle.findMany({
    where: {
      active: true,
      inStock: true,
    },
    select: {
      name: true,
      brand: true,
      category: true,
      onHand: true,
      par: true,
      price: true,
    },
    orderBy: {
      onHand: 'asc',
    },
  })

  // Filter based on threshold
  const bottles = allBottles.filter((bottle) => {
    if (threshold === 'below_par') {
      return bottle.onHand < bottle.par
    } else {
      return bottle.onHand < 5
    }
  })

  return bottles
}

async function getTodaysReservations(dateStr?: string) {
  const targetDate = dateStr ? new Date(dateStr) : new Date()
  targetDate.setHours(0, 0, 0, 0)

  const nextDay = new Date(targetDate)
  nextDay.setDate(nextDay.getDate() + 1)

  const reservations = await prisma.reservation.findMany({
    where: {
      date: {
        gte: targetDate,
        lt: nextDay,
      },
    },
    include: {
      tableType: {
        select: {
          name: true,
          section: true,
        },
      },
      bottles: {
        include: {
          bottle: {
            select: {
              name: true,
              brand: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  return reservations.map((r) => ({
    confirmationCode: r.confirmationCode,
    customerName: r.customerName,
    customerEmail: r.customerEmail,
    customerPhone: r.customerPhone,
    partySize: r.partySize,
    status: r.status,
    tableName: r.tableType.name,
    section: r.tableType.section,
    bottleSubtotal: r.bottleSubtotal,
    minimumSpend: r.minimumSpend,
    depositAmount: r.depositAmount,
    bottles: r.bottles.map((b) => ({
      name: `${b.bottle.brand} ${b.bottle.name}`,
      quantity: b.quantity,
    })),
  }))
}

async function getTopSpenders(
  period: 'month' | 'week' | 'year' | 'all_time',
  limit: number = 10
) {
  const now = new Date()
  let startDate: Date | undefined

  switch (period) {
    case 'week':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'year':
      startDate = new Date(now)
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  const reservations = await prisma.reservation.groupBy({
    by: ['customerEmail', 'customerName', 'customerPhone'],
    where: {
      status: {
        in: ['CONFIRMED', 'COMPLETED'],
      },
      ...(startDate && {
        date: {
          gte: startDate,
        },
      }),
    },
    _sum: {
      bottleSubtotal: true,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _sum: {
        bottleSubtotal: 'desc',
      },
    },
    take: limit,
  })

  return reservations.map((r) => ({
    name: r.customerName,
    email: r.customerEmail,
    phone: r.customerPhone,
    totalSpent: r._sum.bottleSubtotal || 0,
    bookingCount: r._count.id,
  }))
}

async function getRevenueStats(period: 'today' | 'week' | 'month' | 'year') {
  const now = new Date()
  let startDate: Date

  switch (period) {
    case 'today':
      startDate = new Date(now)
      startDate.setHours(0, 0, 0, 0)
      break
    case 'week':
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
      break
    case 'month':
      startDate = new Date(now)
      startDate.setMonth(now.getMonth() - 1)
      break
    case 'year':
      startDate = new Date(now)
      startDate.setFullYear(now.getFullYear() - 1)
      break
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      status: {
        in: ['CONFIRMED', 'COMPLETED'],
      },
      date: {
        gte: startDate,
      },
    },
    select: {
      bottleSubtotal: true,
      depositAmount: true,
      status: true,
    },
  })

  const totalRevenue = reservations.reduce(
    (sum, r) => sum + Number(r.bottleSubtotal),
    0
  )
  const depositsCollected = reservations.reduce(
    (sum, r) => sum + Number(r.depositAmount),
    0
  )

  return {
    period,
    totalRevenue,
    depositsCollected,
    bookingCount: reservations.length,
    averageBookingValue:
      reservations.length > 0 ? totalRevenue / reservations.length : 0,
  }
}

async function searchReservations(query: string) {
  const reservations = await prisma.reservation.findMany({
    where: {
      OR: [
        { customerName: { contains: query, mode: 'insensitive' } },
        { customerEmail: { contains: query, mode: 'insensitive' } },
        { customerPhone: { contains: query } },
        { confirmationCode: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      tableType: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
    take: 10,
  })

  return reservations.map((r) => ({
    confirmationCode: r.confirmationCode,
    customerName: r.customerName,
    customerEmail: r.customerEmail,
    customerPhone: r.customerPhone,
    reservationDate: r.date,
    status: r.status,
    tableName: r.tableType.name,
    bottleSubtotal: r.bottleSubtotal,
    partySize: r.partySize,
  }))
}

// Process tool calls from Claude
async function processToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
) {
  switch (toolName) {
    case 'get_low_stock_bottles':
      return await getLowStockBottles(
        toolInput.threshold as 'below_par' | 'critical'
      )
    case 'get_todays_reservations':
      return await getTodaysReservations(toolInput.date as string | undefined)
    case 'get_top_spenders':
      return await getTopSpenders(
        toolInput.period as 'month' | 'week' | 'year' | 'all_time',
        toolInput.limit as number | undefined
      )
    case 'get_revenue_stats':
      return await getRevenueStats(
        toolInput.period as 'today' | 'week' | 'month' | 'year'
      )
    case 'search_reservations':
      return await searchReservations(toolInput.query as string)
    default:
      return { error: 'Unknown tool' }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json()

    // Type for messages array
    type MessageParam = {
      role: 'user' | 'assistant'
      content: string | Array<{ type: string; [key: string]: unknown }>
    }

    const messages: MessageParam[] = [
      ...conversationHistory,
      {
        role: 'user' as const,
        content: message,
      },
    ]

    // Initial request to Claude
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      tools: tools as any, // SDK type complexity
      messages: messages as any, // SDK type complexity
    })

    // Handle tool use loop
    while (response.stop_reason === 'tool_use') {
      const toolUse = response.content.find(
        (block: any) => block.type === 'tool_use'
      ) as any

      if (!toolUse || toolUse.type !== 'tool_use') break

      // Execute the tool
      const toolResult = await processToolCall(
        toolUse.name,
        toolUse.input as Record<string, unknown>
      )

      // Continue the conversation with tool result
      messages.push({
        role: 'assistant' as const,
        content: response.content as any, // SDK type complexity
      })

      messages.push({
        role: 'user' as const,
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(toolResult),
          },
        ] as any, // SDK type complexity
      })

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        tools: tools as any, // SDK type complexity
        messages: messages as any, // SDK type complexity
      })
    }

    // Extract text response
    const textContent = response.content.find(
      (block: any) => block.type === 'text'
    ) as any
    const assistantMessage =
      textContent && textContent.type === 'text'
        ? textContent.text
        : 'I apologize, I could not generate a response.'

    return NextResponse.json({
      message: assistantMessage,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: assistantMessage },
      ],
    })
  } catch (error) {
    console.error('Assistant API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
