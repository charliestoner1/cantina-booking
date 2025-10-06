'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Bottle {
  id: string
  name: string
  brand: string
  price: string // String from Prisma Decimal
  category: string
}

interface ReservationBottle {
  id: string
  bottleId: string
  quantity: number
  pricePerUnit: string // String from Prisma Decimal
  totalPrice: string // String from Prisma Decimal
  bottle: Bottle
}

interface TableType {
  id: string
  name: string
  slug: string
  description: string
  capacity: number
}

interface Booking {
  id: string
  confirmationCode: string
  tableType: TableType
  date: string
  customerName: string
  customerEmail: string
  customerPhone: string
  partySize: number
  bottleSubtotal: string // String from Prisma Decimal
  depositAmount: string // String from Prisma Decimal
  minimumSpend: string // String from Prisma Decimal
  bottles: ReservationBottle[]
  occasion?: string | null
  specialRequests?: string | null
  status: string
}

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check for both 'code' and 'id' parameters for compatibility
  const confirmationCode = searchParams.get('code') || searchParams.get('id')

  useEffect(() => {
    if (confirmationCode) {
      fetchBooking(confirmationCode)
    } else {
      setError('No confirmation code provided')
      setLoading(false)
    }
  }, [confirmationCode])

  const fetchBooking = async (code: string) => {
    try {
      const response = await fetch(`/api/bookings/${code}`)
      if (response.ok) {
        const data = await response.json()
        setBooking(data)
      } else {
        setError('Booking not found')
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleAddToCalendar = () => {
    if (!booking) return

    const date = new Date(booking.date)
    const endDate = new Date(date.getTime() + 3 * 60 * 60 * 1000) // 3 hours later

    const event = {
      text: `Table Reservation at Cantina Añejo`,
      dates: `${date.toISOString().replace(/[-:]/g, '').replace('.000Z', 'Z')}/${endDate.toISOString().replace(/[-:]/g, '').replace('.000Z', 'Z')}`,
      details: `Confirmation: ${booking.confirmationCode}\\nTable: ${booking.tableType.name}\\nParty Size: ${booking.partySize}`,
      location: 'Cantina Añejo',
    }

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.text)}&dates=${event.dates}&details=${encodeURIComponent(event.details)}&location=${encodeURIComponent(event.location)}`

    window.open(googleUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <div className="text-xl">Loading your reservation...</div>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            {error || 'No booking found'}
          </h1>
          <p className="text-gray-400 mb-4">
            Please check your confirmation code or contact support.
          </p>
          <Link href="/" className="text-cyan-400 hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  const remainingBalance =
    Number(booking.bottleSubtotal) - Number(booking.depositAmount)
  const bookingDate = new Date(booking.date)

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold mb-2">Booking Confirmed!</h1>
          <p className="text-xl text-gray-300">
            Your table at Cantina Añejo has been reserved
          </p>
        </div>

        {/* Main Confirmation Card */}
        <div className="bg-gray-800 rounded-lg p-8 space-y-6">
          {/* Confirmation Code */}
          <div className="text-center border-b border-gray-700 pb-4">
            <p className="text-sm text-gray-400 mb-2">Confirmation Code</p>
            <p className="text-3xl font-mono font-bold text-yellow-400">
              {booking.confirmationCode.toUpperCase().slice(0, 8)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Save this code for your records
            </p>
          </div>

          {/* Booking Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400">Table</p>
              <p className="text-lg font-semibold">{booking.tableType.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Date</p>
              <p className="text-lg font-semibold">
                {bookingDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="text-lg font-semibold">{booking.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Party Size</p>
              <p className="text-lg font-semibold">
                {booking.partySize} guests
              </p>
            </div>
          </div>

          {/* Bottle Selection */}
          {booking.bottles && booking.bottles.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-3">Bottle Selection</p>
              <div className="space-y-2">
                {booking.bottles.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.bottle.name} x{item.quantity}
                    </span>
                    <span>${Number(item.totalPrice).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total Spend</span>
                    <span>${Number(booking.bottleSubtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-yellow-400 mt-1">
                    <span>Deposit Paid (15%)</span>
                    <span>${Number(booking.depositAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-cyan-400 mt-1">
                    <span>Balance Due at Venue</span>
                    <span>${remainingBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Special Details */}
          {(booking.occasion || booking.specialRequests) && (
            <div className="space-y-3">
              {booking.occasion && (
                <div>
                  <p className="text-sm text-gray-400">Occasion</p>
                  <p className="text-lg">{booking.occasion}</p>
                </div>
              )}
              {booking.specialRequests && (
                <div>
                  <p className="text-sm text-gray-400">Special Requests</p>
                  <p className="text-lg">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          )}

          {/* Important Information */}
          <div className="border-t border-gray-700 pt-6">
            <p className="text-sm text-gray-400 mb-3">Important Information</p>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>
                  A confirmation email has been sent to {booking.customerEmail}
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-green-400 mr-2">✓</span>
                <span>
                  Please arrive 15 minutes before your reservation time
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-400 mr-2">!</span>
                <span>
                  Remaining balance of ${remainingBalance.toFixed(2)} due at the
                  venue
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">×</span>
                <span>No-shows will forfeit the deposit</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-8 space-x-4">
          <Link
            href="/"
            className="inline-block bg-gray-700 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition"
          >
            Back to Home
          </Link>
          <button
            onClick={handlePrint}
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Print Confirmation
          </button>
          <button
            onClick={handleAddToCalendar}
            className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            Add to Calendar
          </button>
        </div>

        {/* Support Contact */}
        <div className="text-center mt-8 text-sm text-gray-400">
          <p>Need help? Contact us at (555) 123-4567</p>
        </div>
      </div>
    </div>
  )
}
