// app/manager/page.tsx
import AssistantPanel from './AssistantPanel'

export const dynamic = 'force-dynamic' // makes sure the session endpoint is fresh

export default function ManagerPage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Bar Manager Assistant</h1>
      <AssistantPanel />
    </main>
  )
}
