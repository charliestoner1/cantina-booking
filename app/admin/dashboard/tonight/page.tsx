// app/admin/dashboard/tonight/page.tsx
'use client'

import { TonightBookingCard } from '@/components/admin/TonightBookingCard'
import { Calendar, Clock, DollarSign, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

type Booking = {
  id: string
  confirmationCode: string
  customerName: string
  customerEmail: string
  customerPhone: string
  date: Date
  partySize: number
  status: string
  minimumSpend: number
  bottleSubtotal: number
  occasion: string | null
  specialRequests: string | null
  tableType: {
    name: string
    slug: string
  }
  bottles: Array<{
    quantity: number
    bottle: {
      name: string
      category: string
    }
  }>
}

type Stats = {
  totalBookings: number
  pending: number
  confirmed: number
  completed: number
  noShows: number
  cancelled: number
  expectedRevenue: number
  actualRevenue: number
}

export default function TonightDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/tonights-bookings')
      if (!response.ok) throw new Error('Failed to fetch bookings')

      const data = await response.json()
      setBookings(data.bookings)
      setStats(data.stats)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()

    // Refresh every 30 seconds
    const interval = setInterval(fetchBookings, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update status')

      // Refresh bookings
      await fetchBookings()
    } catch (err) {
      console.error('Error updating booking status:', err)
      alert('Failed to update booking status')
    }
  }

  const formatDate = () => {
    const today = new Date()
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-gray-600">
          Loading tonight's bookings...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Tonight's Service</h1>
          </div>
          <p className="text-emerald-100 text-xl">{formatDate()}</p>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="max-w-7xl mx-auto px-6 -mt-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Total Bookings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Bookings
                  </p>
                  <p className="text-4xl font-bold text-gray-900 mt-1">
                    {stats.totalBookings}
                  </p>
                </div>
                <Users className="w-12 h-12 text-emerald-600" />
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Need Confirmation
                  </p>
                  <p className="text-4xl font-bold text-red-600 mt-1">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-red-600" />
              </div>
            </div>

            {/* Confirmed */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Confirmed</p>
                  <p className="text-4xl font-bold text-green-600 mt-1">
                    {stats.confirmed}
                  </p>
                </div>
                <Users className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Expected Revenue */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Expected Revenue
                  </p>
                  <p className="text-4xl font-bold text-emerald-600 mt-1">
                    ${stats.expectedRevenue.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bookings List */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-600 mb-2">
              No bookings for tonight
            </h3>
            <p className="text-gray-500">
              Enjoy the quiet evening or check back later!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <TonightBookingCard
                key={booking.id}
                booking={booking}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
