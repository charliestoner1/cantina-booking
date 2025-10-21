// app/admin/layout.tsx
// Server Component Layout

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
      {/* Client component wrapper for the assistant */}
      <AssistantWrapper />
    </div>
  )
}
