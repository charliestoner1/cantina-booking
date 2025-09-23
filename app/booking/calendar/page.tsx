// app/booking/calendar/page.tsx
import CalendarComponent from '@/components/booking/calendar-component'
import { Suspense } from 'react'

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Select Your Date
        </h1>
        <Suspense fallback={<CalendarSkeleton />}>
          <CalendarComponent />
        </Suspense>
      </div>
    </div>
  )
}

function CalendarSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8 animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
