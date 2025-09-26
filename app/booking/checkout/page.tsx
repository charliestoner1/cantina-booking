'use client'

import { useBookingStore } from '@/lib/store/booking-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

// Validation schema
const checkoutSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z
    .string()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits'),
  partySize: z.coerce
    .number()
    .min(1, 'Party size must be at least 1')
    .max(20, 'Party size cannot exceed 20'),
  occasion: z.string().optional(),
  specialRequests: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [depositAmount, setDepositAmount] = useState(0)

  const {
    tableType,
    selectedDate,
    selectedBottles,
    getTotalBottleSpend,
    setCustomerInfo,
    clearBooking,
  } = useBookingStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      partySize: tableType?.capacity || 6,
      termsAccepted: false,
    },
  })

  // Calculate deposit (15% of total)
  useEffect(() => {
    const totalSpend = getTotalBottleSpend()
    setDepositAmount(totalSpend * 0.15)
  }, [selectedBottles, getTotalBottleSpend])

  // Redirect if no booking data
  useEffect(() => {
    if (!tableType || !selectedDate || selectedBottles.length === 0) {
      router.push('/booking/calendar')
    }
  }, [tableType, selectedDate, selectedBottles, router])

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true)

    try {
      // Save customer info to store
      setCustomerInfo({
        name: data.name,
        email: data.email,
        phone: data.phone,
        partySize: data.partySize,
        occasion: data.occasion,
        specialRequests: data.specialRequests,
      })

      // Prepare date - handle both Date objects and strings
      let dateToSend: string
      if (selectedDate instanceof Date) {
        dateToSend = selectedDate.toISOString()
      } else if (typeof selectedDate === 'string') {
        dateToSend = new Date(selectedDate).toISOString()
      } else {
        dateToSend = new Date().toISOString()
      }

      // Create booking via API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableTypeId: tableType?.id,
          date: dateToSend,
          customerName: data.name, // Send as single field matching schema
          customerEmail: data.email,
          customerPhone: data.phone,
          partySize: data.partySize,
          occasion: data.occasion,
          specialRequests: data.specialRequests,
          minimumSpend: Number(tableType?.minimumSpend) || 0,
          bottleSubtotal: getTotalBottleSpend(), // Actual total of bottles
          depositAmount: depositAmount,
          bottles: selectedBottles.map((b) => ({
            id: b.id,
            bottleId: b.id,
            quantity: b.quantity,
            price: b.price,
            pricePerUnit: b.price,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to create booking')
      }

      const booking = await response.json()

      // Clear booking data and redirect to confirmation
      clearBooking()
      router.push(`/booking/confirmation?code=${booking.confirmationCode}`)
    } catch (error) {
      console.error('Booking error:', error)
      alert(
        `Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!tableType || !selectedDate) {
    return null
  }

  const totalSpend = getTotalBottleSpend()
  const termsAccepted = watch('termsAccepted')

  // Format date safely
  const formattedDate = selectedDate
    ? format(
        selectedDate instanceof Date ? selectedDate : new Date(selectedDate),
        'EEEE, MMMM d, yyyy'
      )
    : ''

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Complete Your Booking</h1>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Booking Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Table Type:</span>
              <span className="font-medium">{tableType.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formattedDate}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Minimum Spend:</span>
              <span className="font-medium">
                $
                {tableType.minimumSpend
                  ? Number(tableType.minimumSpend).toFixed(2)
                  : '0.00'}
              </span>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Selected Bottles:</h3>
              {selectedBottles.map((bottle) => (
                <div
                  key={bottle.id}
                  className="flex justify-between text-sm mb-1"
                >
                  <span>
                    {bottle.name} x{bottle.quantity}
                  </span>
                  <span>${(bottle.price * bottle.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between font-semibold">
                <span>Total Bottle Spend:</span>
                <span>${totalSpend.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-blue-600 font-semibold mt-2">
                <span>Deposit Due (15%):</span>
                <span>${depositAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold mb-6">Customer Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register('name')}
                type="text"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                {...register('email')}
                type="email"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                {...register('phone')}
                type="tel"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="(555) 123-4567"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Party Size *
              </label>
              <input
                {...register('partySize')}
                type="number"
                min="1"
                max="20"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.partySize ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.partySize && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.partySize.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Occasion (Optional)
              </label>
              <input
                {...register('occasion')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Birthday, Anniversary, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                {...register('specialRequests')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special requests or notes..."
              />
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <div className="flex items-start">
              <input
                {...register('termsAccepted')}
                type="checkbox"
                id="terms"
                className="mt-1 mr-3"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the terms and conditions, including the cancellation
                policy. The deposit of ${depositAmount.toFixed(2)} is
                non-refundable for no-shows or cancellations made less than 24
                hours before the reservation.
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="mt-2 text-sm text-red-500">
                {errors.termsAccepted.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !termsAccepted}
              className={`flex-1 px-6 py-3 rounded-md text-white font-medium transition-colors ${
                isSubmitting || !termsAccepted
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting
                ? 'Processing...'
                : `Pay Deposit ($${depositAmount.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
