// components/admin/TonightBookingCard.tsx
'use client'

import { CheckCircle, Clock, MessageSquare, Phone, XCircle } from 'lucide-react'
import { useState } from 'react'

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

type Props = {
  booking: Booking
  onStatusChange: (bookingId: string, newStatus: string) => Promise<void>
}

export function TonightBookingCard({ booking, onStatusChange }: Props) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      await onStatusChange(booking.id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-red-500'
      case 'CONFIRMED':
        return 'bg-green-500'
      case 'COMPLETED':
        return 'bg-blue-500'
      case 'CANCELLED':
        return 'bg-gray-500'
      case 'NO_SHOW':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'NEEDS CONFIRMATION'
      case 'CONFIRMED':
        return 'CONFIRMED'
      case 'COMPLETED':
        return 'COMPLETED'
      case 'CANCELLED':
        return 'CANCELLED'
      case 'NO_SHOW':
        return 'NO SHOW'
      default:
        return status
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleCall = () => {
    window.location.href = `tel:${booking.customerPhone}`
  }

  const handleSMS = () => {
    window.location.href = `sms:${booking.customerPhone}`
  }

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 overflow-hidden">
      {/* Header with status and time */}
      <div
        className={`${getStatusColor(booking.status)} px-6 py-3 flex justify-between items-center`}
      >
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-white" />
          <span className="text-white font-bold text-lg">
            {formatTime(booking.date)}
          </span>
          <span className="text-white font-semibold">
            {getStatusText(booking.status)}
          </span>
        </div>
        <span className="text-white text-sm font-medium">
          {booking.confirmationCode}
        </span>
      </div>

      {/* Booking details */}
      <div className="p-6">
        {/* Table type */}
        <div className="text-emerald-600 font-semibold text-sm mb-2">
          {booking.tableType.name}
        </div>

        {/* Customer name - large and prominent */}
        <h3 className="text-3xl font-bold text-gray-900 mb-3">
          {booking.customerName}
        </h3>

        {/* Party size and spend */}
        <div className="flex gap-6 mb-4 text-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👥</span>
            <span className="font-semibold">{booking.partySize} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="font-semibold">
              ${booking.minimumSpend.toLocaleString()} minimum
            </span>
          </div>
        </div>

        {/* Bottles */}
        {booking.bottles.length > 0 && (
          <div className="mb-4 space-y-1">
            {booking.bottles.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-gray-700">
                <span className="text-xl">🥂</span>
                <span className="font-medium">
                  {item.quantity}x {item.bottle.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Special requests */}
        {(booking.occasion || booking.specialRequests) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            {booking.occasion && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎉</span>
                <span className="font-semibold text-gray-900">
                  {booking.occasion}
                </span>
              </div>
            )}
            {booking.specialRequests && (
              <div className="text-sm text-gray-700">
                <strong>📝 Note:</strong> {booking.specialRequests}
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {booking.status === 'PENDING' && (
            <button
              onClick={() => handleStatusChange('CONFIRMED')}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
            >
              <CheckCircle className="w-5 h-5" />
              Confirm
            </button>
          )}

          {booking.status === 'CONFIRMED' && (
            <>
              <button
                onClick={() => handleStatusChange('COMPLETED')}
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                Complete
              </button>
              <button
                onClick={() => handleStatusChange('NO_SHOW')}
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                No Show
              </button>
            </>
          )}

          <button
            onClick={handleCall}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            <Phone className="w-5 h-5" />
            Call
          </button>

          <button
            onClick={handleSMS}
            className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition"
          >
            <MessageSquare className="w-5 h-5" />
            Text
          </button>
        </div>

        {/* Contact info (smaller) */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600 space-y-1">
          <div>📞 {booking.customerPhone}</div>
          <div>✉️ {booking.customerEmail}</div>
        </div>
      </div>
    </div>
  )
}
