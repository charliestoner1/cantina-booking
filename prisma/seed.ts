// prisma/seed.ts

import { faker } from '@faker-js/faker'
import { BottleCategory, DayType, PrismaClient } from '@prisma/client'
import { addDays, startOfDay } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data
  await prisma.notification.deleteMany()
  await prisma.reservationBottle.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.tableInventory.deleteMany()
  await prisma.pricingRule.deleteMany()
  await prisma.bottle.deleteMany()
  await prisma.tableType.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cantina.com',
      name: 'Admin User',
      password: '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36Z4LM5r1iKJbPKJTYMTKji', // password: admin123
      role: 'admin',
    },
  })
  console.log('✅ Admin user created')

  // Create table types
  const tableTypes = await Promise.all([
    prisma.tableType.create({
      data: {
        name: 'Regular Table',
        slug: 'regular-table',
        description:
          'Perfect for small groups looking for an intimate dining experience with premium bottle service.',
        shortDescription: 'Intimate seating for small groups',
        capacity: 6,
        section: 'Main Floor',
        amenities: [
          'Dedicated Server',
          'Premium Mixers',
          'Complimentary Appetizer',
        ],
        images: [
          'https://images.unsplash.com/photo-1514933651103-005eec06c04b',
          'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3',
        ],
        baseMinimumSpend: 500,
        sortOrder: 1,
        active: true,
      },
    }),
    prisma.tableType.create({
      data: {
        name: 'VIP Booth',
        slug: 'vip-booth',
        description:
          'Exclusive VIP booths with premium bottle service, dedicated cocktail server, and prime location overlooking the main floor.',
        shortDescription: 'Exclusive VIP experience with premium service',
        capacity: 10,
        section: 'VIP Section',
        amenities: [
          'Private Server',
          'Premium Mixers',
          'Champagne Presentation',
          'Reserved Parking',
          'VIP Entry',
        ],
        images: [
          'https://images.unsplash.com/photo-1543007630-9710e4a00a20',
          'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2',
        ],
        baseMinimumSpend: 1500,
        sortOrder: 2,
        active: true,
      },
    }),
    prisma.tableType.create({
      data: {
        name: 'Balcony Table',
        slug: 'balcony-table',
        description:
          'Elevated experience with panoramic views of the venue, perfect for special celebrations.',
        shortDescription: 'Elevated seating with panoramic views',
        capacity: 8,
        section: 'Balcony Level',
        amenities: [
          'Dedicated Server',
          'Premium Mixers',
          'Priority Reservations',
          'Coat Check',
        ],
        images: [
          'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf',
          'https://images.unsplash.com/photo-1519671845924-1fd18db430b8',
        ],
        baseMinimumSpend: 1000,
        sortOrder: 3,
        active: true,
      },
    }),
    prisma.tableType.create({
      data: {
        name: 'Dance Floor Table',
        slug: 'dance-floor-table',
        description:
          'High-energy tables right next to the dance floor. Perfect for groups who want to be at the center of the action.',
        shortDescription: 'High-energy seating by the dance floor',
        capacity: 12,
        section: 'Dance Floor',
        amenities: [
          'Bottle Parade',
          'Sparklers',
          'DJ Shout-out',
          'Premium Mixers',
        ],
        images: [
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7',
          'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
        ],
        baseMinimumSpend: 2000,
        sortOrder: 4,
        active: true,
      },
    }),
  ])
  console.log(`✅ Created ${tableTypes.length} table types`)

  // Create pricing rules for each table type
  for (const tableType of tableTypes) {
    // Weekday pricing
    await prisma.pricingRule.create({
      data: {
        tableTypeId: tableType.id,
        dayType: DayType.WEEKDAY,
        minimumSpend: tableType.baseMinimumSpend,
        depositRate: 0.15,
        priority: 0,
        active: true,
      },
    })

    // Weekend pricing (1.5x)
    await prisma.pricingRule.create({
      data: {
        tableTypeId: tableType.id,
        dayType: DayType.WEEKEND,
        minimumSpend: Number(tableType.baseMinimumSpend) * 1.5,
        depositRate: 0.15,
        priority: 0,
        active: true,
      },
    })

    // Special event pricing (2x) - New Year's Eve
    await prisma.pricingRule.create({
      data: {
        tableTypeId: tableType.id,
        dayType: DayType.SPECIAL_EVENT,
        minimumSpend: Number(tableType.baseMinimumSpend) * 2,
        depositRate: 0.25,
        eventName: "New Year's Eve Celebration",
        startDate: new Date('2024-12-31'),
        endDate: new Date('2025-01-01'),
        priority: 10,
        active: true,
      },
    })
  }
  console.log('✅ Created pricing rules')

  // Create inventory for the next 60 days
  const today = startOfDay(new Date())
  for (const tableType of tableTypes) {
    for (let i = 0; i < 60; i++) {
      const date = addDays(today, i)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6

      await prisma.tableInventory.create({
        data: {
          tableTypeId: tableType.id,
          date,
          totalCount: tableType.name === 'VIP Booth' ? 4 : 8,
          available: tableType.name === 'VIP Booth' ? 4 : 8,
          blocked: false,
        },
      })
    }
  }
  console.log('✅ Created inventory for next 60 days')

  // Create bottles
  const bottles = await Promise.all([
    // Vodka
    prisma.bottle.create({
      data: {
        name: 'Grey Goose',
        brand: 'Grey Goose',
        category: BottleCategory.VODKA,
        size: '750ml',
        price: 350,
        image: 'https://images.unsplash.com/photo-1608885898946-e6bb96c61b3f',
        description: 'Premium French vodka',
        sortOrder: 1,
      },
    }),
    prisma.bottle.create({
      data: {
        name: 'Belvedere',
        brand: 'Belvedere',
        category: BottleCategory.VODKA,
        size: '750ml',
        price: 325,
        sortOrder: 2,
      },
    }),
    prisma.bottle.create({
      data: {
        name: "Tito's",
        brand: "Tito's",
        category: BottleCategory.VODKA,
        size: '750ml',
        price: 250,
        sortOrder: 3,
      },
    }),

    // Whiskey
    prisma.bottle.create({
      data: {
        name: 'Hennessy VS',
        brand: 'Hennessy',
        category: BottleCategory.WHISKEY,
        size: '750ml',
        price: 400,
        sortOrder: 4,
      },
    }),
    prisma.bottle.create({
      data: {
        name: 'Jameson',
        brand: 'Jameson',
        category: BottleCategory.WHISKEY,
        size: '750ml',
        price: 280,
        sortOrder: 5,
      },
    }),
    prisma.bottle.create({
      data: {
        name: 'Macallan 12',
        brand: 'Macallan',
        category: BottleCategory.WHISKEY,
        size: '750ml',
        price: 550,
        sortOrder: 6,
      },
    }),

    // Tequila
    prisma.bottle.create({
      data: {
        name: 'Don Julio 1942',
        brand: 'Don Julio',
        category: BottleCategory.TEQUILA,
        size: '750ml',
        price: 450,
        sortOrder: 7,
      },
    }),
    prisma.bottle.create({
      data: {
        name: 'Patron Silver',
        brand: 'Patron',
        category: BottleCategory.TEQUILA,
        size: '750ml',
        price: 375,
        sortOrder: 8,
      },
    }),
    prisma.bottle.create({
      data: {
        name: 'Casamigos Reposado',
        brand: 'Casamigos',
        category: BottleCategory.TEQUILA,
        size: '750ml',
        price: 350,
        sortOrder: 9,
      },
    }),

    // Champagne
    prisma.bottle.create({
      data: {
        name: 'Dom Pérignon',
        brand: 'Dom Pérignon',
        category: BottleCategory.CHAMPAGNE,
        size: '750ml',
        price: 800,
        description: 'Luxury champagne for special celebrations',
        sortOrder: 10,
      },
    }),
    prisma.bottle.create({
      data: {
        name: 'Veuve Clicquot',
        brand: 'Veuve Clicquot',
        category: BottleCategory.CHAMPAGNE,
        size: '750ml',
        price: 400,
        sortOrder: 11,
      },
    }),
    prisma.bottle.create({
      data: {
        name: 'Moët & Chandon',
        brand: 'Moët',
        category: BottleCategory.CHAMPAGNE,
        size: '750ml',
        price: 350,
        sortOrder: 12,
      },
    }),
  ])
  console.log(`✅ Created ${bottles.length} bottles`)

  // Create sample reservations
  const sampleReservations = []
  for (let i = 0; i < 5; i++) {
    const tableType = faker.helpers.arrayElement(tableTypes)
    const date = addDays(today, faker.number.int({ min: 1, max: 30 }))

    const reservation = await prisma.reservation.create({
      data: {
        tableTypeId: tableType.id,
        date,
        status: faker.helpers.arrayElement(['PENDING', 'CONFIRMED']),
        customerName: faker.person.fullName(),
        customerEmail: faker.internet.email(),
        customerPhone: faker.phone.number(),
        occasion: faker.helpers.arrayElement([
          'Birthday',
          'Anniversary',
          'Celebration',
          null,
        ]),
        partySize: faker.number.int({ min: 2, max: tableType.capacity }),
        minimumSpend: tableType.baseMinimumSpend,
        bottleSubtotal:
          Number(tableType.baseMinimumSpend) +
          faker.number.int({ min: 0, max: 500 }),
        depositAmount: Number(tableType.baseMinimumSpend) * 0.15,
        depositPaid: faker.datatype.boolean(),
      },
    })

    // Add bottles to reservation
    const selectedBottles = faker.helpers.arrayElements(
      bottles,
      faker.number.int({ min: 2, max: 4 })
    )
    for (const bottle of selectedBottles) {
      const quantity = faker.number.int({ min: 1, max: 2 })
      await prisma.reservationBottle.create({
        data: {
          reservationId: reservation.id,
          bottleId: bottle.id,
          quantity,
          pricePerUnit: bottle.price,
          totalPrice: Number(bottle.price) * quantity,
        },
      })
    }

    sampleReservations.push(reservation)
  }
  console.log(`✅ Created ${sampleReservations.length} sample reservations`)

  // Create or update settings (using upsert to avoid duplicates on re-seed)
  await prisma.settings.upsert({
    where: { key: 'business_hours' },
    update: {
      value: {
        thursday: { open: '20:00', close: '02:00' },
        friday: { open: '20:00', close: '03:00' },
        saturday: { open: '20:00', close: '03:00' },
        sunday: { open: '18:00', close: '00:00' },
      },
      description: 'Business operating hours',
    },
    create: {
      key: 'business_hours',
      value: {
        thursday: { open: '20:00', close: '02:00' },
        friday: { open: '20:00', close: '03:00' },
        saturday: { open: '20:00', close: '03:00' },
        sunday: { open: '18:00', close: '00:00' },
      },
      description: 'Business operating hours',
    },
  })

  await prisma.settings.upsert({
    where: { key: 'contact_info' },
    update: {
      value: {
        phone: '+1 (352) 781-2050',
        email: 'bookings@cantinaanejo.com',
        address: '1680 W University Ave, Gainesville, FL 32603',
      },
      description: 'Contact information',
    },
    create: {
      key: 'contact_info',
      value: {
        phone: '+1 (352) 781-2050',
        email: 'bookings@cantinaanejo.com',
        address: '1680 W University Ave, Gainesville, FL 32603',
      },
      description: 'Contact information',
    },
  })

  console.log('✅ Created settings')

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
