// app/booking/bottles/page.tsx
import BottleSelector from '@/components/booking/bottle-selector'
import { Suspense } from 'react'

export default function BottlesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Select Your Bottles
        </h1>
        <Suspense fallback={<BottleSkeleton />}>
          <BottleSelector />
        </Suspense>
      </div>
    </div>
  )
}

function BottleSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-8 animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-6"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
