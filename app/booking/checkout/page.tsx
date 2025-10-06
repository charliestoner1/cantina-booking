'use client'

import { useBookingStore } from '@/lib/store/booking-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, isValid, parseISO } from 'date-fns'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
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
  const isNavigatingToConfirmation = useRef(false)

  const {
    tableType,
    selectedDate,
    selectedBottles,
    getTotalBottleSpend,
    setCustomerInfo,
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

  // Redirect if no booking data - but not if we're navigating to confirmation
  //useEffect(() => {
  //if (!isNavigatingToConfirmation.current &&
  //(!tableType || !selectedDate || selectedBottles.length === 0)) {
  //console.log('[CHECKOUT] No booking data found, redirecting to calendar')
  //router.push('/booking/calendar')
  //}
  //}, [tableType, selectedDate, selectedBottles, router])

  // Helper function to safely convert selectedDate to Date object
  const getDateObject = (dateValue: Date | string | null): Date | null => {
    if (!dateValue) return null

    if (dateValue instanceof Date) {
      return isValid(dateValue) ? dateValue : null
    }

    if (typeof dateValue === 'string') {
      // Try parsing as ISO string first
      try {
        const parsed = parseISO(dateValue)
        return isValid(parsed) ? parsed : null
      } catch {
        // Fall back to Date constructor
        const fallback = new Date(dateValue)
        return isValid(fallback) ? fallback : null
      }
    }

    return null
  }

  const onSubmit = async (data: CheckoutFormData) => {
    // Double check we have required data
    if (!tableType || !selectedDate || selectedBottles.length === 0) {
      alert('Missing booking information. Please start over.')
      router.push('/booking/calendar')
      return
    }

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

      // Get valid date object
      const dateObj = getDateObject(selectedDate)
      if (!dateObj) {
        alert('Invalid date selected. Please go back and select a valid date.')
        router.push('/booking/calendar')
        return
      }

      const dateToSend = dateObj.toISOString()

      // Prepare bottles data matching API expectations
      const bottlesData = selectedBottles.map((bottle) => ({
        bottleId: bottle.id,
        quantity: bottle.quantity,
        pricePerUnit: bottle.price,
      }))

      const totalSpend = getTotalBottleSpend()

      // Create booking via API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableTypeId: tableType.id,
          date: dateToSend,
          customerName: data.name,
          customerEmail: data.email,
          customerPhone: data.phone,
          partySize: data.partySize,
          occasion: data.occasion || null,
          specialRequests: data.specialRequests || null,
          minimumSpend: Number(tableType.minimumSpend) || 0,
          bottleSubtotal: totalSpend,
          depositAmount: depositAmount,
          bottles: bottlesData,
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
      console.log('Booking created:', booking)

      // Make sure we have a confirmation code
      if (!booking.confirmationCode) {
        throw new Error('No confirmation code received from server')
      }

      // Set flag to prevent redirect when navigating
      isNavigatingToConfirmation.current = true

      // Navigate to confirmation page using hard redirect
      console.log(
        'Navigating to confirmation page with code:',
        booking.confirmationCode
      )
      window.location.href = `/booking/confirmation?code=${booking.confirmationCode}`

      // Don't clear booking data - let it persist
      // The data in store doesn't hurt anything and clearing it causes redirect issues
    } catch (error) {
      console.error('Booking error:', error)
      alert(
        `Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
      isNavigatingToConfirmation.current = false
    } finally {
      setIsSubmitting(false)
    }
  }

  // Early return if no booking data
  if (!tableType || !selectedDate) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">
            No booking information found
          </h2>
          <p className="text-gray-600 mb-6">
            Please start your booking from the beginning.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Start Booking
          </button>
        </div>
      </div>
    )
  }

  const totalSpend = getTotalBottleSpend()
  const termsAccepted = watch('termsAccepted')

  // Format date safely using the helper function
  const dateObj = getDateObject(selectedDate)
  const formattedDate = dateObj
    ? format(dateObj, 'EEEE, MMMM d, yyyy')
    : 'Invalid date'
  const isDateValid = dateObj !== null

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
              <span
                className={`font-medium ${!isDateValid ? 'text-red-600' : ''}`}
              >
                {formattedDate}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Minimum Spend:</span>
              <span className="font-medium">
                ${Number(tableType.minimumSpend).toFixed(2)}
              </span>
            </div>

            <div className="pt-3 border-t">
              <h3 className="font-semibold mb-2">Selected Bottles:</h3>
              {selectedBottles.map((bottle, index) => (
                <div
                  key={`${bottle.id}-${index}`}
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

        {/* Show warning if date is invalid */}
        {!isDateValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">
              The selected date is invalid. Please go back and select a valid
              date.
            </p>
          </div>
        )}

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
                max={tableType.capacity || 20}
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
              onClick={() => router.push('/booking/bottles')}
              className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !termsAccepted || !isDateValid}
              className={`flex-1 px-6 py-3 rounded-md text-white font-medium transition-colors ${
                isSubmitting || !termsAccepted || !isDateValid
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
