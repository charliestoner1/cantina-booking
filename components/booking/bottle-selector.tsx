'use client'

// components/booking/bottle-selector.tsx
import { useBookingStore } from '@/lib/store/booking-store'
import { AlertCircle, Minus, Plus, ShoppingCart } from 'lucide-react'
import Image from 'next/image'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface Bottle {
  id: string
  name: string
  brand: string
  category: string
  price: number
  size: string
  imageUrl?: string
  description?: string
}

interface SelectedBottle {
  bottle: Bottle
  quantity: number
}

export default function BottleSelector() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const minimumSpend = parseFloat(searchParams.get('minimumSpend') || '0')
  const tableId = searchParams.get('tableId')
  const tableSlug = searchParams.get('table')
  const date = searchParams.get('date')

  const [bottles, setBottles] = useState<Bottle[]>([])
  const [selectedBottles, setSelectedBottles] = useState<
    Map<string, SelectedBottle>
  >(new Map())
  const [currentCategory, setCurrentCategory] = useState<string>('ALL')
  const [loading, setLoading] = useState(true)
  const hasCheckedRedirect = useRef(false)

  // Smart redirect guard - only redirect if we should
  useEffect(() => {
    // Only run once on mount
    if (hasCheckedRedirect.current) return
    hasCheckedRedirect.current = true

    // GUARD 1: Only run if we're actually on the bottles page
    if (pathname !== '/booking/bottles') {
      console.log('[BOTTLES] Not on bottles page, skipping redirect check')
      return
    }

    // GUARD 2: Check for recent booking completion
    const recentBooking = sessionStorage.getItem('booking_just_completed')
    if (recentBooking) {
      const timestamp = parseInt(recentBooking)
      const fiveSecondsAgo = Date.now() - 5000

      if (timestamp > fiveSecondsAgo) {
        // Booking was just completed, don't redirect
        console.log('[BOTTLES] Recent booking detected, not redirecting')
        return
      } else {
        // Clean up old flag
        sessionStorage.removeItem('booking_just_completed')
      }
    }

    // GUARD 3: Check if we have required parameters
    if (!minimumSpend || !tableId || !date) {
      console.log(
        '[BOTTLES] Missing required parameters, redirecting to calendar'
      )
      router.push('/booking/calendar')
    }
  }, [pathname, minimumSpend, tableId, date, router])

  // Fetch bottles
  useEffect(() => {
    if (pathname !== '/booking/bottles') return
    if (minimumSpend && tableId && date) {
      fetchBottles()
    }
  }, [pathname, minimumSpend, tableId, date])

  const fetchBottles = async () => {
    try {
      const response = await fetch('/api/bottles')
      const data = await response.json()
      setBottles(data)
    } catch (error) {
      console.error('Error fetching bottles:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = [
    'ALL',
    'VODKA',
    'WHISKEY',
    'TEQUILA',
    'CHAMPAGNE',
    'COGNAC',
    'RUM',
    'GIN',
  ]

  const filteredBottles =
    currentCategory === 'ALL'
      ? bottles
      : bottles.filter((b) => b.category === currentCategory)

  const addBottle = (bottle: Bottle) => {
    const current = selectedBottles.get(bottle.id)
    const newSelection = new Map(selectedBottles)

    if (current) {
      newSelection.set(bottle.id, {
        bottle,
        quantity: current.quantity + 1,
      })
    } else {
      newSelection.set(bottle.id, {
        bottle,
        quantity: 1,
      })
    }

    setSelectedBottles(newSelection)
  }

  const removeBottle = (bottleId: string) => {
    const current = selectedBottles.get(bottleId)
    if (!current) return

    const newSelection = new Map(selectedBottles)

    if (current.quantity > 1) {
      newSelection.set(bottleId, {
        ...current,
        quantity: current.quantity - 1,
      })
    } else {
      newSelection.delete(bottleId)
    }

    setSelectedBottles(newSelection)
  }

  const currentTotal = Array.from(selectedBottles.values()).reduce(
    (sum, item) => sum + item.bottle.price * item.quantity,
    0
  )

  const remainingMinimum = Math.max(0, minimumSpend - currentTotal)
  const meetsMinimum = currentTotal >= minimumSpend

  const handleContinue = () => {
    if (!meetsMinimum) return

    // Get the store actions
    const { setTableType, setSelectedDate, addBottle, clearBooking } =
      useBookingStore.getState()

    // Clear previous selections
    clearBooking()

    // Set table info
    setTableType({
      id: tableId || '',
      name: tableSlug || '',
      slug: tableSlug || '',
      minimumSpend: minimumSpend,
      capacity: 6, // Default capacity
    })

    // Set selected date
    setSelectedDate(new Date(date || ''))

    // Add each bottle to the store
    Array.from(selectedBottles.values()).forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addBottle({
          id: item.bottle.id,
          name: item.bottle.name,
          price: item.bottle.price,
        })
      }
    })

    // Navigate to checkout
    router.push('/booking/checkout')
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto text-center py-8">
        <div className="text-xl text-gray-400">Loading bottles...</div>
      </div>
    )
  }

  // Don't render if missing required params
  if (!minimumSpend || !tableId || !date) {
    return (
      <div className="max-w-7xl mx-auto text-center py-8">
        <p className="text-gray-400">Loading bottle selection...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Progress Bar */}
      <div className="bg-gray-800 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Minimum Spend Progress</h3>
          <span className="text-2xl font-bold text-cyan-400">
            {formatPrice(currentTotal)} / {formatPrice(minimumSpend)}
          </span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              meetsMinimum ? 'bg-green-600' : 'bg-cyan-600'
            }`}
            style={{
              width: `${Math.min(100, (currentTotal / minimumSpend) * 100)}%`,
            }}
          />
        </div>

        {!meetsMinimum && (
          <div className="mt-4 flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-5 w-5" />
            <span>
              Add {formatPrice(remainingMinimum)} more to meet minimum spend
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Category Filter */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCurrentCategory(cat)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentCategory === cat
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Bottle Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBottles.map((bottle) => {
              const selected = selectedBottles.get(bottle.id)
              const quantity = selected?.quantity || 0

              return (
                <div
                  key={bottle.id}
                  className="bg-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="aspect-w-1 aspect-h-1 bg-gray-700 relative h-48">
                    {bottle.imageUrl ? (
                      <Image
                        src={bottle.imageUrl}
                        alt={bottle.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-6xl">🾠</span>
                      </div>
                    )}
                    {quantity > 0 && (
                      <div className="absolute top-2 right-2 bg-cyan-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {quantity}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h4 className="font-semibold text-lg">{bottle.name}</h4>
                    <p className="text-gray-400 text-sm">
                      {bottle.brand} • {bottle.size}
                    </p>
                    {bottle.description && (
                      <p className="text-gray-500 text-sm mt-2">
                        {bottle.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-bold text-cyan-400">
                        {formatPrice(bottle.price)}
                      </span>

                      <div className="flex items-center gap-2">
                        {quantity > 0 && (
                          <button
                            onClick={() => removeBottle(bottle.id)}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}

                        <button
                          onClick={() => addBottle(bottle)}
                          className="p-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="lg:w-96">
          <div className="bg-gray-800 rounded-lg p-6 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Your Selection
              </h3>
              <span className="text-sm text-gray-400">
                {selectedBottles.size} items
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedBottles.size === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No bottles selected
                </p>
              ) : (
                Array.from(selectedBottles.values()).map((item) => (
                  <div
                    key={item.bottle.id}
                    className="flex items-center justify-between bg-gray-700 rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.bottle.name}</p>
                      <p className="text-sm text-gray-400">
                        {item.quantity} x {formatPrice(item.bottle.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-cyan-400">
                        {formatPrice(item.bottle.price * item.quantity)}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => removeBottle(item.bottle.id)}
                          className="p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm px-2">{item.quantity}</span>
                        <button
                          onClick={() => addBottle(item.bottle)}
                          className="p-1 bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-gray-700 mt-4 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg">Total:</span>
                <span className="text-2xl font-bold text-cyan-400">
                  {formatPrice(currentTotal)}
                </span>
              </div>

              <button
                onClick={handleContinue}
                disabled={!meetsMinimum}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  meetsMinimum
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {meetsMinimum
                  ? 'Continue to Checkout'
                  : `Add ${formatPrice(remainingMinimum)} more`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
