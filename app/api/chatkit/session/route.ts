import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  const workflowId = process.env.CHATKIT_WORKFLOW_ID

  if (!apiKey || !workflowId) {
    return NextResponse.json(
      { error: 'Missing OPENAI_API_KEY or CHATKIT_WORKFLOW_ID' },
      { status: 500 }
    )
  }

  const res = await fetch('https://api.openai.com/v1/chatkit/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'chatkit_beta=v1',
    },
    body: JSON.stringify({
      workflow: { id: workflowId },
      user: 'bar_manager', // Changed from { id: 'bar_manager' } to just string
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    console.error('Session creation failed:', errorText)
    return NextResponse.json(
      { error: 'Failed to create session', details: errorText },
      { status: 500 }
    )
  }

  const j = await res.json()

  // Handle both string and object forms of client_secret
  const secret =
    typeof j?.client_secret === 'string'
      ? j.client_secret
      : j?.client_secret?.value

  if (!secret) {
    return NextResponse.json(
      { error: 'Malformed sessions response', details: j },
      { status: 500 }
    )
  }

  return NextResponse.json({ client_secret: secret })
}
