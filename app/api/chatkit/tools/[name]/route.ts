import { NextRequest } from 'next/server'

const AGENT_BASE =
  process.env.AGENT_BASE_URL ?? 'http://localhost:3000/api/agent'

export async function POST(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const upstream = await fetch(`${AGENT_BASE}/${params.name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Manager-Key': process.env.MANAGER_API_KEY ?? '',
    },
    body: await req.text(),
  })

  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: {
      'Content-Type':
        upstream.headers.get('Content-Type') ?? 'application/json',
    },
  })
}
