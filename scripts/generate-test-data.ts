// scripts/generate-test-data.ts
// Generate realistic test data for the Cantina booking system

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Realistic customer names
const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Barbara', 'David', 'Elizabeth', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
];

const occasions = [
  'Birthday', 'Anniversary', 'Bachelorette Party', 'Bachelor Party', 
  'Corporate Event', 'Graduation', 'Reunion', 'Girls Night Out',
  'Celebration', 'Date Night', null, null, null, // nulls make it more realistic
];

// Helper functions
function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const domain = randomElement(domains);
  const formats = [
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${lastName.toLowerCase()}@${domain}`,
    `${firstName.toLowerCase()}${randomInt(1, 99)}@${domain}`,
  ];
  return randomElement(formats);
}

function generatePhone(): string {
  return `${randomInt(200, 999)}-${randomInt(200, 999)}-${randomInt(1000, 9999)}`;
}

async function main() {
  console.log('🌱 Starting test data generation...\n');

  // Get existing data
  const tableTypes = await prisma.tableType.findMany();
  const bottles = await prisma.bottle.findMany({ where: { active: true } });

  if (tableTypes.length === 0 || bottles.length === 0) {
    console.error('❌ Error: Please run the main seed script first (npm run seed)');
    process.exit(1);
  }

  console.log(`📋 Found ${tableTypes.length} table types and ${bottles.length} bottles\n`);

  // Generate reservations for the past 90 days and next 30 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90); // 90 days ago
  
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30); // 30 days future

  const numberOfReservations = 150; // Generate 150 reservations
  
  console.log(`📅 Generating ${numberOfReservations} reservations from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}\n`);

  const statuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'PENDING'];
  const reservations = [];

  for (let i = 0; i < numberOfReservations; i++) {
    const firstName = randomElement(firstNames);
    const lastName = randomElement(lastNames);
    const customerName = `${firstName} ${lastName}`;
    const customerEmail = generateEmail(firstName, lastName);
    const customerPhone = generatePhone();
    
    const tableType = randomElement(tableTypes);
    const reservationDate = randomDate(startDate, endDate);
    
    // Past dates are more likely to be COMPLETED or NO_SHOW
    // Future dates are CONFIRMED or PENDING
    let status;
    if (reservationDate < new Date()) {
      // Past reservation
      const pastStatuses = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'NO_SHOW', 'CANCELLED'];
      status = randomElement(pastStatuses);
    } else {
      // Future reservation
      const futureStatuses = ['CONFIRMED', 'CONFIRMED', 'PENDING'];
      status = randomElement(futureStatuses);
    }

    const partySize = randomInt(2, 12);
    const occasion = randomElement(occasions);
    
    // Select 1-4 random bottles
    const numBottles = randomInt(1, 4);
    const selectedBottles = [];
    const usedBottleIds = new Set();
    
    for (let j = 0; j < numBottles; j++) {
      let bottle;
      do {
        bottle = randomElement(bottles);
      } while (usedBottleIds.has(bottle.id));
      
      usedBottleIds.add(bottle.id);
      const quantity = randomInt(1, 3);
      
      selectedBottles.push({
        bottleId: bottle.id,
        quantity,
        pricePerUnit: bottle.price,
        totalPrice: bottle.price * quantity,
      });
    }

    const bottleSubtotal = selectedBottles.reduce((sum, b) => sum + Number(b.totalPrice), 0);
    const minimumSpend = Number(tableType.baseMinimumSpend);
    const depositAmount = bottleSubtotal * 0.15; // 15% deposit
    
    reservations.push({
      tableTypeId: tableType.id,
      date: reservationDate,
      status,
      customerName,
      customerEmail,
      customerPhone,
      occasion,
      specialRequests: i % 5 === 0 ? 'Please have champagne chilled and ready' : null,
      partySize,
      minimumSpend,
      bottleSubtotal,
      depositAmount,
      depositPaid: status !== 'PENDING',
      bottles: selectedBottles,
    });

    // Progress indicator
    if ((i + 1) % 25 === 0) {
      console.log(`  ✓ Generated ${i + 1}/${numberOfReservations} reservations`);
    }
  }

  console.log(`\n💾 Saving reservations to database...\n`);

  // Create reservations with bottles
  for (const reservation of reservations) {
    const { bottles: bottleData, ...reservationData } = reservation;
    
    await prisma.reservation.create({
      data: {
        ...reservationData,
        bottles: {
          create: bottleData,
        },
      },
    });
  }

  console.log('✅ Successfully created reservations!\n');

  // Update bottle inventory (simulate usage)
  console.log('📦 Updating bottle inventory levels...\n');
  
  for (const bottle of bottles) {
    // Random current stock between 0 and par level + 10
    const onHand = randomInt(0, bottle.par + 10);
    
    await prisma.bottle.update({
      where: { id: bottle.id },
      data: { onHand },
    });
  }

  console.log('✅ Inventory levels updated!\n');

  // Print statistics
  const stats = {
    total: reservations.length,
    confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
    completed: reservations.filter(r => r.status === 'COMPLETED').length,
    pending: reservations.filter(r => r.status === 'PENDING').length,
    cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
    noShow: reservations.filter(r => r.status === 'NO_SHOW').length,
  };

  const totalRevenue = reservations
    .filter(r => r.status === 'CONFIRMED' || r.status === 'COMPLETED')
    .reduce((sum, r) => sum + r.bottleSubtotal, 0);

  console.log('📊 STATISTICS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Reservations: ${stats.total}`);
  console.log(`├─ Confirmed: ${stats.confirmed}`);
  console.log(`├─ Completed: ${stats.completed}`);
  console.log(`├─ Pending: ${stats.pending}`);
  console.log(`├─ Cancelled: ${stats.cancelled}`);
  console.log(`└─ No Show: ${stats.noShow}`);
  console.log(`\nTotal Revenue: $${totalRevenue.toFixed(2)}`);
  console.log(`Average Booking: $${(totalRevenue / (stats.confirmed + stats.completed)).toFixed(2)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('🎉 Test data generation complete!\n');
  console.log('Try these queries with your AI assistant:');
  console.log('  • "What bottles are we low on?"');
  console.log('  • "Who are our top spenders this month?"');
  console.log('  • "What\'s our revenue this week?"');
  console.log('  • "Who has tables tonight?"\n');
}

main()
  .catch((e) => {
    console.error('❌ Error generating test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
