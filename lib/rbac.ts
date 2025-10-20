import { NextRequest, NextResponse } from 'next/server'

// Temporary manager-only guard using a header.
// Replace with real auth (NextAuth/JWT/Clerk) in production.
export function assertManager(req: NextRequest) {
  const required = process.env.MANAGER_API_KEY
  if (!required) return
  const got = req.headers.get('x-manager-key')
  if (got !== required) {
    throw NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }
}
