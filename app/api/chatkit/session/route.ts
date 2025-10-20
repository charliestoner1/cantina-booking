import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  const workflowId = process.env.CHATKIT_WORKFLOW_ID
  if (!apiKey || !workflowId) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY or CHATKIT_WORKFLOW_ID' }, { status: 500 })
  }

  const res = await fetch('https://api.openai.com/v1/chatkit/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'OpenAI-Beta': 'chatkit_beta=v1',
    },
    body: JSON.stringify({ workflow: { id: workflowId }, user: 'bar_manager' }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to create session', details: await res.text() }, { status: 500 })
  }

  const { client_secret } = await res.json()
  return NextResponse.json({ client_secret })
}
