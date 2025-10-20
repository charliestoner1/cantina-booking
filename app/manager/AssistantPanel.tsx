'use client'
import { ChatKit, useChatKit } from '@openai/chatkit-react'
import * as React from 'react'

export default function AssistantPanel() {
  const [err, setErr] = React.useState<string | null>(null)

  const { control } = useChatKit({
    api: {
      async getClientSecret(
        currentClientSecret: string | null
      ): Promise<string> {
        try {
          const r = await fetch('/api/chatkit/session', { method: 'POST' })
          if (!r.ok) throw new Error(`Session ${r.status}`)
          const j: { client_secret: string } = await r.json()
          return j.client_secret
        } catch (e: unknown) {
          setErr(e instanceof Error ? e.message : 'Failed to get client secret')
          throw e
        }
      },
    },
  })

  return (
    <div className="rounded-xl border overflow-hidden w-[380px] h-[640px] relative">
      {err && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-red-50 text-red-700 p-4">
          Failed to start assistant: {err}
        </div>
      )}
      <ChatKit control={control} className="h-full w-full" />
    </div>
  )
}
