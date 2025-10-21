# AI Bar Manager Assistant - Complete Documentation

## Overview

This AI-powered assistant integrates Claude 4.5 Sonnet directly into your Cantina booking system's admin dashboard. It provides natural language access to your database, allowing bar managers to query reservations, inventory, analytics, and customer data through conversational interactions.

**Key Features:**
- 🤖 Powered by Anthropic's Claude 4.5 Sonnet (latest model)
- 🔧 5 database tools for real-time queries
- 💬 Full chat interface with message history
- 📊 Revenue analytics and customer insights
- 📦 Inventory management alerts
- 🎯 Natural language queries (no SQL needed)

---

## Table of Contents

1. [Architecture](#architecture)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [File Structure](#file-structure)
5. [Component Details](#component-details)
6. [API Tools Reference](#api-tools-reference)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)
9. [Customization](#customization)
10. [Security Considerations](#security-considerations)

---

## Architecture

### System Flow

```
User Types Question
       ↓
AssistantWrapper Component (Client)
       ↓
POST /api/assistant
       ↓
Anthropic Claude API
       ↓
Tool Selection & Execution
       ↓
Prisma Database Queries
       ↓
Response to User
```

### Component Hierarchy

```
app/admin/layout.tsx (Server Component)
└── AssistantWrapper.tsx (Client Component)
    └── Chat UI + API Calls
        └── /api/assistant/route.ts
            └── Claude + Database Tools
```

### Key Design Decisions

1. **Separate Client Wrapper:** Next.js 15 layouts are server components by default. We use a separate client component wrapper to handle state management and user interactions.

2. **Tool-Based Architecture:** Claude uses function calling to execute specific database queries based on user intent, providing structured and reliable responses.

3. **Inline Styles:** The component uses inline styles to avoid dependency on CSS frameworks, ensuring it works in any environment.

---

## Prerequisites

### Required Software
- Node.js 18+
- PostgreSQL database (running)
- Next.js 15.5.3+
- Prisma ORM configured

### Required Accounts
- Anthropic API account ([console.anthropic.com](https://console.anthropic.com))
- Active API key with Claude access

### Estimated Cost
- Claude 4.5 Sonnet: ~$3 per million input tokens, ~$15 per million output tokens
- Typical query: 500-2000 tokens total (~$0.01-0.04 per query)
- Expected monthly cost for small bar: $5-20/month

---

## Installation

### Step 1: Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### Step 2: Configure Environment Variables

Add to your `.env.local`:

```env
# Anthropic API Configuration
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# Get your key from: https://console.anthropic.com/settings/keys
```

**IMPORTANT:** Restart your dev server after adding environment variables!

### Step 3: Create Required Files

Copy these files from the outputs folder to your project:

```bash
# API Route
mkdir -p app/api/assistant
cp app/api/assistant/route.ts app/api/assistant/route.ts

# Client Component Wrapper
mkdir -p components/admin
cp components/admin/AssistantWrapper.tsx components/admin/AssistantWrapper.tsx

# Update Admin Layout
cp app/admin/layout.tsx app/admin/layout.tsx
```

### Step 4: Verify Installation

```bash
# Start dev server
npm run dev

# Navigate to any admin page
# You should see a teal chat button in bottom-right corner
```

---

## File Structure

```
your-project/
├── app/
│   ├── admin/
│   │   └── layout.tsx              # Server layout that imports wrapper
│   └── api/
│       └── assistant/
│           └── route.ts            # AI API endpoint with tools
├── components/
│   └── admin/
│       └── AssistantWrapper.tsx   # Client chat component
├── prisma/
│   └── schema.prisma              # Database schema (required)
└── .env.local                     # API keys (gitignored)
```

---

## Component Details

### 1. API Route (`app/api/assistant/route.ts`)

**Purpose:** Backend endpoint that handles AI requests, executes database queries, and returns responses.

**Key Sections:**

```typescript
// Initialize clients
const prisma = new PrismaClient()
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Define tools for Claude to use
const tools = [
  {
    name: 'get_low_stock_bottles',
    description: 'Get bottles running low on inventory',
    input_schema: { ... }
  },
  // ... 4 more tools
]

// Tool implementations
async function getLowStockBottles(threshold) { ... }
async function getTodaysReservations(date) { ... }
async function getTopSpenders(period) { ... }
async function getRevenueStats(period) { ... }
async function searchReservations(query) { ... }

// Main endpoint
export async function POST(request: NextRequest) {
  // 1. Get user message
  // 2. Send to Claude with tools
  // 3. Execute tool calls if needed
  // 4. Return response
}
```

**Environment Variables Required:**
- `ANTHROPIC_API_KEY` - Your Anthropic API key

**Database Access:**
- Uses Prisma Client to query your PostgreSQL database
- Read-only queries (no writes/updates for safety)

**Error Handling:**
- Catches all errors and returns user-friendly messages
- Logs errors to console for debugging
- Returns 500 status on failures

### 2. Client Wrapper (`components/admin/AssistantWrapper.tsx`)

**Purpose:** UI component that provides the chat interface and manages state.

**Key Features:**

```typescript
'use client'; // Required for state management

export default function AssistantWrapper() {
  // State management
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([...])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // API communication
  const sendMessage = async (messageText: string) => {
    const response = await fetch('/api/assistant', {
      method: 'POST',
      body: JSON.stringify({
        message: messageText,
        conversationHistory: messages,
      }),
    })
    // Handle response...
  }

  // Render UI
  return (
    <>
      {/* Floating button */}
      {/* Chat window */}
      {/* Message history */}
      {/* Input form */}
    </>
  )
}
```

**Why It's Separate:**
- Next.js 15 layouts are server components
- State management requires client component
- Separation allows server layout to remain fast

**Styling Approach:**
- Uses inline styles (no CSS dependencies)
- Teal color theme (#14b8a6)
- Mobile-responsive design
- Fixed positioning (doesn't affect page layout)

### 3. Admin Layout (`app/admin/layout.tsx`)

**Purpose:** Server component that wraps all admin pages and includes the assistant.

```typescript
import { AdminNav } from '@/components/admin/AdminNav'
import AssistantWrapper from '@/components/admin/AssistantWrapper'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main>{children}</main>
      {/* Assistant floats on all admin pages */}
      <AssistantWrapper />
    </div>
  )
}
```

**Why This Structure:**
- Layout is server component (fast, SEO-friendly)
- AssistantWrapper is client component (interactive)
- Assistant available on all admin pages automatically

---

## API Tools Reference

### Tool 1: `get_low_stock_bottles`

**Purpose:** Identify bottles that need restocking.

**Parameters:**
- `threshold` (required): "below_par" or "critical"
  - `below_par`: Bottles where onHand < par level
  - `critical`: Bottles with less than 5 units

**Example Queries:**
- "What bottles are we low on?"
- "Show me critical inventory"
- "Which bottles are below par?"

**Database Query:**
```typescript
// Fetches all bottles and filters in-memory
// (Prisma doesn't support field-to-field comparison)
const bottles = allBottles.filter((bottle) => {
  if (threshold === 'below_par') {
    return bottle.onHand < bottle.par
  } else {
    return bottle.onHand < 5
  }
})
```

**Returns:**
```typescript
[
  {
    name: "Grey Goose Vodka",
    brand: "Grey Goose",
    category: "VODKA",
    onHand: 3,
    par: 10,
    price: 350.00
  },
  // ... more bottles
]
```

### Tool 2: `get_todays_reservations`

**Purpose:** Retrieve reservations for a specific date.

**Parameters:**
- `date` (optional): "YYYY-MM-DD" format, defaults to today

**Example Queries:**
- "Who has tables tonight?"
- "Show me tomorrow's reservations"
- "What bookings do we have on October 25th?"

**Database Query:**
```typescript
const reservations = await prisma.reservation.findMany({
  where: {
    date: {
      gte: targetDate,
      lt: nextDay,
    },
  },
  include: {
    tableType: { ... },
    bottles: { ... },
  },
})
```

**Returns:**
```typescript
[
  {
    confirmationCode: "CMGMJYPWA00F...",
    customerName: "John Smith",
    customerEmail: "john.smith@gmail.com",
    customerPhone: "555-123-4567",
    partySize: 6,
    status: "CONFIRMED",
    tableName: "VIP Booth",
    section: "VIP",
    bottleSubtotal: 1200.00,
    minimumSpend: 1000.00,
    depositAmount: 180.00,
    bottles: [
      { name: "Grey Goose Vodka", quantity: 2 },
      { name: "Dom Perignon", quantity: 1 }
    ]
  },
  // ... more reservations
]
```

### Tool 3: `get_top_spenders`

**Purpose:** Identify highest-value customers.

**Parameters:**
- `period` (required): "month" | "week" | "year" | "all_time"
- `limit` (optional): Number of results (default: 10)

**Example Queries:**
- "Who are our top 5 spenders this month?"
- "Show me the highest spenders all time"
- "Top 3 customers this week"

**Database Query:**
```typescript
const reservations = await prisma.reservation.groupBy({
  by: ['customerEmail', 'customerName', 'customerPhone'],
  where: {
    status: { in: ['CONFIRMED', 'COMPLETED'] },
    date: { gte: startDate },
  },
  _sum: { bottleSubtotal: true },
  _count: { id: true },
  orderBy: { _sum: { bottleSubtotal: 'desc' } },
  take: limit,
})
```

**Returns:**
```typescript
[
  {
    name: "Sarah Johnson",
    email: "sarah.j@gmail.com",
    phone: "555-987-6543",
    totalSpent: 5400.00,
    bookingCount: 3
  },
  // ... more customers
]
```

### Tool 4: `get_revenue_stats`

**Purpose:** Calculate revenue metrics for a time period.

**Parameters:**
- `period` (required): "today" | "week" | "month" | "year"

**Example Queries:**
- "What's our revenue this week?"
- "Show me today's earnings"
- "How much did we make this month?"

**Database Query:**
```typescript
const reservations = await prisma.reservation.findMany({
  where: {
    status: { in: ['CONFIRMED', 'COMPLETED'] },
    date: { gte: startDate },
  },
  select: {
    bottleSubtotal: true,
    depositAmount: true,
  },
})

// Calculate totals and averages
```

**Returns:**
```typescript
{
  period: "week",
  totalRevenue: 24500.00,
  depositsCollected: 3675.00,
  bookingCount: 15,
  averageBookingValue: 1633.33
}
```

### Tool 5: `search_reservations`

**Purpose:** Find reservations by customer info or confirmation code.

**Parameters:**
- `query` (required): Search term (name, email, phone, or code)

**Example Queries:**
- "Find reservation for John Smith"
- "Search for sarah@gmail.com"
- "Look up confirmation code CMGM..."

**Database Query:**
```typescript
const reservations = await prisma.reservation.findMany({
  where: {
    OR: [
      { customerName: { contains: query, mode: 'insensitive' } },
      { customerEmail: { contains: query, mode: 'insensitive' } },
      { customerPhone: { contains: query } },
      { confirmationCode: { contains: query, mode: 'insensitive' } },
    ],
  },
  take: 10,
})
```

**Returns:**
```typescript
[
  {
    confirmationCode: "CMGM...",
    customerName: "John Smith",
    customerEmail: "john.smith@gmail.com",
    customerPhone: "555-123-4567",
    reservationDate: "2025-10-25T00:00:00.000Z",
    status: "CONFIRMED",
    tableName: "VIP Booth",
    bottleSubtotal: 1200.00,
    partySize: 6
  },
  // ... more matches
]
```

---

## Usage Examples

### Inventory Management

**Query:** "What bottles are we low on?"

**Claude's Process:**
1. Identifies intent → inventory check
2. Calls `get_low_stock_bottles` with threshold "below_par"
3. Receives list of bottles where onHand < par
4. Formats response naturally

**Response:**
> "You have 3 bottles running low:
> 
> 1. **Grey Goose Vodka** - Only 3 bottles (par: 10)
> 2. **Hennessy VSOP** - 4 bottles (par: 8)
> 3. **Don Julio 1942** - 2 bottles (par: 6)
> 
> I recommend restocking these soon to avoid running out during peak hours."

### Reservation Queries

**Query:** "Who has tables tonight?"

**Claude's Process:**
1. Determines date → tonight/today
2. Calls `get_todays_reservations`
3. Receives full reservation list
4. Summarizes key info

**Response:**
> "You have 5 reservations tonight:
> 
> 1. **Sarah Johnson** - VIP Booth, party of 8, 7:00 PM
> 2. **Mike Davis** - Dance Floor Table, party of 6, 8:30 PM
> 3. **Emily Chen** - Regular Table, party of 4, 9:00 PM
> 4. **James Wilson** - Balcony Table, party of 10, 7:30 PM
> 5. **Lisa Brown** - VIP Booth, party of 6, 10:00 PM
> 
> Total guests expected: 34"

### Analytics

**Query:** "Who are our top 3 spenders this month?"

**Claude's Process:**
1. Identifies analytics request → top spenders
2. Calls `get_top_spenders` with period "month", limit 3
3. Receives aggregated customer data
4. Presents in ranked format

**Response:**
> "Your top 3 spenders this month:
> 
> 1. **Sarah Johnson** - $5,400 across 3 bookings
> 2. **Michael Chen** - $4,200 across 2 bookings
> 3. **David Miller** - $3,800 across 4 bookings
> 
> Total from top 3: $13,400"

### Revenue Tracking

**Query:** "What's our revenue this week?"

**Claude's Process:**
1. Recognizes revenue query
2. Calls `get_revenue_stats` with period "week"
3. Receives calculated statistics
4. Formats financial summary

**Response:**
> "Here's your revenue for this week:
> 
> - **Total Revenue:** $24,500
> - **Deposits Collected:** $3,675
> - **Number of Bookings:** 15
> - **Average per Booking:** $1,633
> 
> This is looking strong! You're averaging about $3,500 per day."

### Search Operations

**Query:** "Find reservation for Smith"

**Claude's Process:**
1. Detects search intent
2. Calls `search_reservations` with query "Smith"
3. Receives matching reservations
4. Lists results

**Response:**
> "Found 2 reservations for 'Smith':
> 
> 1. **John Smith** - Confirmed for Oct 25, VIP Booth, party of 6
>    Email: john.smith@gmail.com | Phone: 555-123-4567
>    Confirmation: CMGMJYPWA00F...
> 
> 2. **Sarah Smith** - Completed on Oct 15, Regular Table, party of 4
>    Email: sarah.smith@yahoo.com | Phone: 555-987-6543
>    Confirmation: CMGMROANU0003...
> 
> Would you like more details on either booking?"

---

## Troubleshooting

### Issue: Button Not Showing

**Symptoms:**
- No teal chat button in bottom-right corner
- Layout renders but component missing

**Diagnosis:**
```bash
# Check file exists
ls components/admin/AssistantWrapper.tsx

# Check layout imports it
grep "AssistantWrapper" app/admin/layout.tsx

# Check browser console for errors
# (F12 → Console tab)
```

**Solutions:**

1. **Wrong file location:**
   ```bash
   # Component must be at:
   components/admin/AssistantWrapper.tsx
   
   # NOT at:
   components/BarManagerAssistant.tsx
   ```

2. **Import path mismatch:**
   ```typescript
   // In app/admin/layout.tsx, should be:
   import AssistantWrapper from '@/components/admin/AssistantWrapper'
   
   // NOT:
   import AssistantWrapper from '@/components/AssistantWrapper'
   ```

3. **Missing 'use client' directive:**
   ```typescript
   // First line of AssistantWrapper.tsx MUST be:
   'use client';
   ```

4. **Server not restarted:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Issue: API Errors

**Symptoms:**
- Button works but messages fail
- "Failed to process request" error
- 500 error in console

**Diagnosis:**
```bash
# Check API key is set
grep ANTHROPIC .env.local

# Check API route exists
ls app/api/assistant/route.ts

# Check server logs for errors
# (Look at terminal where npm run dev is running)
```

**Solutions:**

1. **Missing API key:**
   ```bash
   # Add to .env.local:
   ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
   
   # MUST restart server after adding:
   npm run dev
   ```

2. **Invalid API key:**
   - Go to https://console.anthropic.com/settings/keys
   - Generate new key
   - Update .env.local
   - Restart server

3. **API route not found (404):**
   ```bash
   # Ensure file is exactly at:
   app/api/assistant/route.ts
   
   # NOT at:
   pages/api/assistant.ts  # Wrong (Pages Router)
   api/assistant/route.ts   # Wrong (missing app/)
   ```

4. **Database connection error:**
   ```bash
   # Check Prisma is working:
   npx prisma studio
   
   # If fails, check DATABASE_URL in .env
   ```

### Issue: "Cannot find module '@anthropic-ai/sdk'"

**Solution:**
```bash
npm install @anthropic-ai/sdk

# Then restart server
npm run dev
```

### Issue: TypeScript Errors

**Symptoms:**
- Red squiggly lines in VS Code
- Build fails with type errors

**Solution:**

The route file has this at the top:
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
```

This is intentional because the Anthropic SDK has complex types. Don't remove it!

If you have other TypeScript errors:
```bash
# Check your tsconfig.json has:
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: Component Renders But Looks Wrong

**Symptoms:**
- Button appears but styling is off
- Chat window is unstyled
- Layout breaks

**Cause:** The component uses inline styles to avoid CSS dependencies. If styles aren't working, there's likely a JavaScript error preventing the component from rendering fully.

**Solution:**
```bash
# Check browser console (F12) for errors
# Look for:
# - Syntax errors
# - Import errors
# - Runtime errors

# Common fix: Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: Slow Responses

**Symptoms:**
- Messages take 5-10+ seconds
- Loading indicator stays too long

**This is normal!** Claude API calls take 2-8 seconds depending on:
- Tool complexity
- Number of database records
- Network latency
- Claude's processing time

**To improve:**
1. Add database indexes on frequently queried fields
2. Limit result sets (already implemented)
3. Use caching for repeated queries (future enhancement)

### Issue: Wrong/Inaccurate Responses

**Symptoms:**
- Claude gives wrong information
- Numbers don't match database
- Confusion about business logic

**Solutions:**

1. **Check your data:**
   ```bash
   npx prisma studio
   # Verify data is correct
   ```

2. **Improve prompts:**
   The system prompt and tool descriptions can be improved. Edit `app/api/assistant/route.ts` and enhance the descriptions.

3. **Add constraints:**
   Tool definitions can include more specific constraints:
   ```typescript
   {
     name: 'get_revenue_stats',
     description: 'Get revenue ONLY from CONFIRMED or COMPLETED reservations, excluding CANCELLED and NO_SHOW',
     // ...
   }
   ```

---

## Customization

### Change Assistant Personality

Edit the initial message in `AssistantWrapper.tsx`:

```typescript
const [messages, setMessages] = useState<Message[]>([
  {
    role: 'assistant',
    content: "YOUR CUSTOM GREETING HERE",
  },
]);
```

Examples:
- **Casual:** "Hey! I'm your bar's AI buddy. What can I help with?"
- **Professional:** "Good evening. I'm your management assistant. How may I assist you today?"
- **Fun:** "🎉 Welcome to Cantina! I'm your AI bartender's assistant (minus the drinks). What's up?"

### Add New Tools

To add a new capability:

1. **Define the tool** in `route.ts`:
```typescript
const tools = [
  // ... existing tools
  {
    name: 'get_upcoming_birthdays',
    description: 'Get customers with birthdays in the next 30 days',
    input_schema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to look ahead',
        },
      },
    },
  },
];
```

2. **Implement the function:**
```typescript
async function getUpcomingBirthdays(days: number = 30) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  const reservations = await prisma.reservation.findMany({
    where: {
      occasion: { contains: 'birthday', mode: 'insensitive' },
      date: {
        gte: new Date(),
        lte: futureDate,
      },
    },
    select: {
      customerName: true,
      date: true,
      occasion: true,
    },
  });
  
  return reservations;
}
```

3. **Add to switch statement:**
```typescript
async function processToolCall(toolName: string, toolInput: Record<string, unknown>) {
  switch (toolName) {
    // ... existing cases
    case 'get_upcoming_birthdays':
      return await getUpcomingBirthdays(toolInput.days as number);
    default:
      return { error: 'Unknown tool' };
  }
}
```

### Modify Quick Questions

Edit `AssistantWrapper.tsx`:

```typescript
const quickQuestions = [
  "What bottles are we low on?",
  "Who has tables tonight?",
  "Show me this month's top spenders",
  // Add your own:
  "What's our busiest day this week?",
  "Show me VIP bookings only",
];
```

### Change Color Scheme

The assistant uses teal (#14b8a6). To change:

**In AssistantWrapper.tsx**, find all instances of `#14b8a6` and replace with your color:

```typescript
// Example: Change to purple
backgroundColor: '#9333ea'  // Replace #14b8a6

// Or use CSS variables:
backgroundColor: 'var(--brand-color)'
```

### Adjust Chat Window Size

In `AssistantWrapper.tsx`:

```typescript
// Find the chat window style:
style={{
  width: '400px',    // Change width
  height: '600px',   // Change height
  // ...
}}
```

### Add Keyboard Shortcuts

Add to `AssistantWrapper.tsx`:

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Ctrl+K or Cmd+K to open
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(true);
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

### Restrict to Specific Admin Pages

Currently, the assistant appears on ALL admin pages. To restrict:

**Option 1: Conditional rendering in layout:**
```typescript
'use client';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  
  // Only show on dashboard pages
  const showAssistant = pathname.startsWith('/admin/dashboard');
  
  return (
    <div>
      <AdminNav />
      <main>{children}</main>
      {showAssistant && <AssistantWrapper />}
    </div>
  );
}
```

**Option 2: Add to specific pages only:**

Remove from layout, add to individual pages:
```typescript
// app/admin/dashboard/page.tsx
import AssistantWrapper from '@/components/admin/AssistantWrapper';

export default function DashboardPage() {
  return (
    <div>
      {/* Your page content */}
      <AssistantWrapper />
    </div>
  );
}
```

---

## Security Considerations

### API Key Security

**✅ DO:**
- Store API key in `.env.local` (gitignored by default)
- Use environment variables only (never hardcode)
- Rotate keys periodically
- Use separate keys for dev/staging/production

**❌ DON'T:**
- Commit API keys to git
- Share keys in Slack/Discord
- Use production keys in development
- Expose keys in client-side code

### Rate Limiting

The assistant has no built-in rate limiting. Consider adding:

```typescript
// app/api/assistant/route.ts
import rateLimit from 'express-rate-limit';

// Add rate limiter (requires express middleware setup)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
});
```

Or use a service like [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting).

### Authentication

**CRITICAL:** The assistant API has NO authentication by default!

Anyone who knows the endpoint can use it. For production:

**Option 1: Check session/auth:**
```typescript
// app/api/assistant/route.ts
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // ... rest of code
}
```

**Option 2: API key verification:**
```typescript
export async function POST(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key');
  
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // ... rest of code
}
```

### Data Privacy

The assistant sends user queries to Anthropic's API. Consider:

**1. Data Handling Agreement:**
- Review Anthropic's data policies
- Ensure compliance with GDPR/CCPA if applicable
- Consider customer data sensitivity

**2. PII Filtering:**
```typescript
// Before sending to Claude, sanitize:
function sanitizeQuery(query: string): string {
  // Remove potential credit card numbers
  query = query.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[REDACTED]');
  
  // Remove SSNs
  query = query.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED]');
  
  return query;
}
```

**3. Audit Logging:**
```typescript
// Log all queries for compliance
await prisma.auditLog.create({
  data: {
    userId: session.user.id,
    action: 'AI_QUERY',
    query: message,
    timestamp: new Date(),
  },
});
```

### Tool Permissions

Currently, all tools are read-only. If adding write operations:

**Add confirmation for destructive actions:**
```typescript
{
  name: 'cancel_reservation',
  description: 'Cancel a reservation - REQUIRES CONFIRMATION',
  input_schema: {
    properties: {
      confirmationCode: { type: 'string' },
      confirmed: { 
        type: 'boolean',
        description: 'Must be true to proceed'
      }
    },
    required: ['confirmationCode', 'confirmed']
  }
}
```

**Implement approval workflow:**
```typescript
async function cancelReservation(code: string, confirmed: boolean) {
  if (!confirmed) {
    return { 
      error: 'Cancellation requires explicit confirmation',
      confirmationRequired: true 
    };
  }
  
  // Proceed with cancellation
}
```

### Cost Controls

To prevent runaway costs:

**1. Set usage limits in Anthropic console**
- Go to Settings → Usage Limits
- Set monthly spending cap

**2. Monitor usage:**
```typescript
// Add simple tracking
let requestCount = 0;

export async function POST(request: NextRequest) {
  requestCount++;
  
  if (requestCount > 1000) { // Daily limit
    return NextResponse.json(
      { error: 'Daily limit reached' },
      { status: 429 }
    );
  }
  
  // ... rest of code
}
```

**3. Cache repeated queries:**
```typescript
const cache = new Map<string, { response: string; timestamp: number }>();

export async function POST(request: NextRequest) {
  const { message } = await request.json();
  
  // Check cache (5 minute TTL)
  const cached = cache.get(message);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return NextResponse.json({ message: cached.response });
  }
  
  // ... make API call, then cache result
}
```

---

## Performance Optimization

### Database Indexes

Add indexes for frequently queried fields:

```prisma
// prisma/schema.prisma
model Reservation {
  // ... existing fields
  
  @@index([date, status])           // For revenue/reservation queries
  @@index([customerEmail])          // For customer search
  @@index([status])                 // For status filtering
}

model Bottle {
  // ... existing fields
  
  @@index([active, inStock])        // For inventory queries
  @@index([category])               // For category filtering
}
```

Apply indexes:
```bash
npx prisma migrate dev --name add_performance_indexes
```

### Response Streaming

For longer responses, consider streaming:

```typescript
// Future enhancement - stream responses
export async function POST(request: NextRequest) {
  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    messages: [...],
  });
  
  return new Response(stream.toReadableStream());
}
```

### Caching Strategy

Implement Redis caching for expensive queries:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

async function getCachedOrFetch(key: string, fetcher: () => Promise<any>) {
  // Check cache
  const cached = await redis.get(key);
  if (cached) return cached;
  
  // Fetch fresh data
  const data = await fetcher();
  
  // Cache for 5 minutes
  await redis.set(key, data, { ex: 300 });
  
  return data;
}
```

---

## Testing

### Manual Testing

Use these test queries to verify functionality:

```typescript
// Inventory
"What bottles are we low on?"
"Show me critical inventory levels"
"Which vodkas are below par?"

// Reservations
"Who has tables tonight?"
"Show me tomorrow's bookings"
"How many reservations next Saturday?"

// Analytics
"Who are our top 10 spenders this month?"
"What's our revenue this week?"
"Show me average booking value"

// Search
"Find reservation for Smith"
"Search for john@gmail.com"
"Look up confirmation code CMGM..."

// Edge cases
"Show me reservations from 2020" // Should handle old dates
"What's our revenue in 2050?" // Should handle future dates
"Find reservation for zzz999xyz" // Should handle no results
```

### Automated Testing

Create test file `__tests__/assistant.test.ts`:

```typescript
import { POST } from '@/app/api/assistant/route';
import { NextRequest } from 'next/server';

describe('AI Assistant API', () => {
  it('responds to inventory queries', async () => {
    const request = new NextRequest('http://localhost:3000/api/assistant', {
      method: 'POST',
      body: JSON.stringify({
        message: 'What bottles are we low on?',
        conversationHistory: [],
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.message).toBeDefined();
    expect(data.message.length).toBeGreaterThan(0);
  });
  
  // More tests...
});
```

Run tests:
```bash
npm test
```

---

## Deployment

### Environment Setup

**Development:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-dev-key-here
DATABASE_URL=postgresql://localhost:5432/cantina_dev
```

**Production:**
```env
ANTHROPIC_API_KEY=sk-ant-api03-prod-key-here
DATABASE_URL=postgresql://prod-server:5432/cantina_prod
```

### Vercel Deployment

1. **Add environment variables in Vercel dashboard:**
   - Go to Project Settings → Environment Variables
   - Add `ANTHROPIC_API_KEY`
   - Add `DATABASE_URL`

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Verify:**
   - Check /admin pages load
   - Test assistant responds
   - Monitor Vercel logs for errors

### Self-Hosted Deployment

**Requirements:**
- Node.js 18+ runtime
- PostgreSQL database
- HTTPS (for security)

**Docker setup:**
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Docker Compose:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres
  
  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=cantina
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Monitoring & Maintenance

### Usage Tracking

Monitor in Anthropic console:
- Go to https://console.anthropic.com/dashboard
- View API usage, costs, rate limits
- Set up usage alerts

### Error Monitoring

Add error tracking:

```typescript
// app/api/assistant/route.ts
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  try {
    // ... existing code
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        component: 'ai-assistant',
        endpoint: '/api/assistant',
      },
    });
    
    console.error('Assistant API Error:', error);
    // ... error response
  }
}
```

### Logging

Implement structured logging:

```typescript
function logAssistantQuery(data: {
  userId: string;
  query: string;
  toolsUsed: string[];
  responseTime: number;
  success: boolean;
}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    component: 'ai-assistant',
    ...data,
  }));
}
```

### Health Checks

Add health endpoint:

```typescript
// app/api/assistant/health/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Anthropic from '@anthropic-ai/sdk';

const prisma = new PrismaClient();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    checks: {
      database: false,
      anthropic: false,
    },
  };
  
  try {
    // Test database
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
    checks.status = 'unhealthy';
  }
  
  try {
    // Test Anthropic API (use minimal request)
    await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'test' }],
    });
    checks.checks.anthropic = true;
  } catch (error) {
    console.error('Anthropic health check failed:', error);
    checks.status = 'unhealthy';
  }
  
  const statusCode = checks.status === 'healthy' ? 200 : 503;
  return NextResponse.json(checks, { status: statusCode });
}
```

---

## FAQ

### Q: How much does this cost to run?

**A:** For a typical small bar with ~50-100 queries/day:
- **Development:** Free tier covers most testing
- **Production:** $10-30/month depending on usage
- Claude 4.5 Sonnet costs ~$0.01-0.04 per query
- Most expensive: complex queries with multiple tool calls

### Q: Can I use GPT-4 instead of Claude?

**A:** Yes, but requires significant code changes:
- Replace `@anthropic-ai/sdk` with OpenAI SDK
- Rewrite tool definitions (OpenAI uses different format)
- Adjust API calls and response parsing
- Claude is recommended for better function calling

### Q: Does it work on mobile?

**A:** Yes! The component is responsive:
- Works on phones, tablets, desktop
- Chat window resizes automatically
- Touch-friendly interface
- May want to adjust sizing for very small screens

### Q: Can I add voice input?

**A:** Yes, using Web Speech API:

```typescript
const recognition = new (window as any).webkitSpeechRecognition();

recognition.onresult = (event: any) => {
  const transcript = event.results[0][0].transcript;
  setInput(transcript);
};

// Add microphone button that calls:
recognition.start();
```

### Q: Will it work offline?

**A:** No, requires internet connection:
- Needs to call Anthropic API
- Requires database access
- No offline mode available

### Q: Can I export chat history?

**A:** Not currently implemented, but easy to add:

```typescript
const exportChat = () => {
  const chatText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n\n');
  
  const blob = new Blob([chatText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `chat-${Date.now()}.txt`;
  a.click();
};
```

### Q: How do I update to a newer Claude model?

**A:** Edit `app/api/assistant/route.ts`:

```typescript
// Change this line:
model: 'claude-sonnet-4-20250514',

// To a newer model (when available):
model: 'claude-sonnet-4.5-20260101',
```

Check [Anthropic's models page](https://docs.anthropic.com/claude/docs/models-overview) for latest models.

### Q: Can multiple admins use it simultaneously?

**A:** Yes! Each user gets their own:
- Independent chat sessions
- Separate conversation history
- No conflicts or shared state

However, database queries are shared (same data source).

### Q: Does it remember previous conversations?

**A:** Only within the current chat session:
- Message history maintained while chat is open
- Refreshing page clears history
- To add persistence, store messages in database

### Q: Can I restrict what it can query?

**A:** Yes, by modifying tools:

```typescript
// Remove tools you don't want:
const tools = [
  // Keep only these:
  tools[0], // Low stock bottles
  tools[1], // Today's reservations
  // Remove: Top spenders, Revenue stats, Search
];
```

Or add permissions checking in tool functions.

---

## Support & Resources

### Official Documentation
- **Anthropic Claude Docs:** https://docs.anthropic.com
- **Next.js Documentation:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs

### Community
- **Anthropic Discord:** https://discord.gg/anthropic
- **Next.js Discord:** https://discord.gg/nextjs

### Getting Help

If you encounter issues:

1. **Check this documentation first**
2. **Search existing GitHub issues**
3. **Check browser console for errors** (F12)
4. **Review server logs** (terminal where `npm run dev` runs)
5. **Test with simpler queries** to isolate the problem

### Reporting Bugs

When reporting issues, include:
- **Node.js version:** `node --version`
- **Next.js version:** Check `package.json`
- **Error messages:** Full stack trace
- **Steps to reproduce:** What did you do?
- **Expected vs actual behavior**
- **Screenshots if applicable**

---

## Changelog

### Version 1.0.0 (Current)

**Initial Release** - October 2025

**Features:**
- ✅ Claude 4.5 Sonnet integration
- ✅ 5 database query tools
- ✅ Full chat interface
- ✅ Message history within session
- ✅ Quick question buttons
- ✅ Loading states and error handling
- ✅ Responsive design
- ✅ TypeScript support

**Known Limitations:**
- No conversation persistence across sessions
- No rate limiting
- No authentication (requires manual setup)
- No multi-language support
- No voice input/output

**Future Enhancements:**
- [ ] Conversation history persistence
- [ ] Multi-language support
- [ ] Voice interface
- [ ] Advanced analytics tools
- [ ] Export chat history
- [ ] Suggested follow-up questions
- [ ] Admin tool approvals for write operations
- [ ] Integration with Toast POS
- [ ] SMS/Email sending capabilities

---

## License

This AI Assistant implementation is part of the Cantina Booking System.

**Usage:**
- ✅ Free to use in your own projects
- ✅ Modify as needed
- ✅ No attribution required

**Restrictions:**
- ❌ Don't redistribute as a standalone package
- ❌ Anthropic API key required (subject to Anthropic's terms)

---

## Credits

**Built with:**
- [Anthropic Claude](https://www.anthropic.com) - AI model
- [Next.js 15](https://nextjs.org) - React framework
- [Prisma](https://www.prisma.io) - Database ORM
- [PostgreSQL](https://www.postgresql.org) - Database
- [TypeScript](https://www.typescriptlang.org) - Type safety

**Developed for:**
Cantina Booking System - Modern nightclub reservation platform

---

**🎉 Congratulations! You've successfully implemented an AI-powered bar management assistant!**

For questions or support, refer to the troubleshooting section or check the official documentation links above.
