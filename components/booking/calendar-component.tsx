'use client'

// components/booking/calendar-component.tsx
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface TableType {
  id: string
  name: string
  slug: string
  baseMinimumSpend: number
}

interface Availability {
  date: string
  available: number
  total: number
  priceMultiplier: number
  isSpecialEvent: boolean
}

interface PricingInfo {
  date: Date
  dayType: 'WEEKDAY' | 'WEEKEND' | 'SPECIAL_EVENT'
  multiplier: number
  minimumSpend: number
}

export default function CalendarComponent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tableSlug = searchParams.get('table')
  const tableId = searchParams.get('tableId')
  
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availability, setAvailability] = useState<Map<string, Availability>>(new Map())
  const [tableType, setTableType] = useState<TableType | null>(null)
  const [loading, setLoading] = useState(true)
  const [pricingInfo, setPricingInfo] = useState<PricingInfo | null>(null)

  // Fetch table information
  useEffect(() => {
    if (!tableSlug) {
      router.push('/tables')
      return
    }
    
    fetchTableInfo()
    fetchAvailability()
  }, [tableSlug, currentMonth])

  const fetchTableInfo = async () => {
    try {
      const response = await fetch(`/api/tables/${tableSlug}`)
      const data = await response.json()
      setTableType(data)
    } catch (error) {
      console.error('Error fetching table info:', error)
    }
  }

  const fetchAvailability = async () => {
    setLoading(true)
    try {
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()
      const startDate = new Date(year, month, 1).toISOString()
      const endDate = new Date(year, month + 1, 0).toISOString()
      
      const response = await fetch(
        `/api/availability?tableId=${tableId}&startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()
      
      const availMap = new Map<string, Availability>()
      data.forEach((item: Availability) => {
        availMap.set(item.date, item)
      })
      setAvailability(availMap)
    } catch (error) {
      console.error('Error fetching availability:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const avail = availability.get(dateStr)
    return avail && avail.available > 0
  }

  const isPastDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const getDayType = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const avail = availability.get(dateStr)
    
    if (avail?.isSpecialEvent) return 'SPECIAL_EVENT'
    
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 5 || dayOfWeek === 6) return 'WEEKEND'
    return 'WEEKDAY'
  }

  const getMinimumSpend = (date: Date) => {
    if (!tableType) return 0
    
    const dateStr = date.toISOString().split('T')[0]
    const avail = availability.get(dateStr)
    const multiplier = avail?.priceMultiplier || 1
    
    return tableType.baseMinimumSpend * multiplier
  }

  const handleDateSelect = (date: Date) => {
    if (!isDateAvailable(date) || isPastDate(date)) return
    
    setSelectedDate(date)
    const dayType = getDayType(date)
    const minimumSpend = getMinimumSpend(date)
    
    setPricingInfo({
      date,
      dayType,
      multiplier: dayType === 'SPECIAL_EVENT' ? 2 : dayType === 'WEEKEND' ? 1.5 : 1,
      minimumSpend
    })
  }

  const handleContinue = () => {
    if (!selectedDate || !tableType) return
    
    const params = new URLSearchParams({
      tableId: tableId || '',
      table: tableSlug || '',
      date: selectedDate.toISOString().split('T')[0],
      minimumSpend: getMinimumSpend(selectedDate).toString()
    })
    
    router.push(`/booking/bottles?${params.toString()}`)
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="max-w-4xl mx-auto">
      {/* Selected Table Info */}
      {tableType && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-2">{tableType.name}</h2>
          <p className="text-gray-400">Base Minimum Spend: {formatPrice(tableType.baseMinimumSpend)}</p>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <h3 className="text-xl font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-400">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth().map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="h-16"></div>
            }
            
            const isAvailable = isDateAvailable(date)
            const isPast = isPastDate(date)
            const isSelected = selectedDate?.toDateString() === date.toDateString()
            const dayType = getDayType(date)
            const dateStr = date.toISOString().split('T')[0]
            const avail = availability.get(dateStr)
            
            return (
              <button
                key={date.toISOString()}
                onClick={() => handleDateSelect(date)}
                disabled={!isAvailable || isPast}
                className={`
                  h-16 rounded-lg flex flex-col items-center justify-center text-sm
                  transition-all relative
                  ${isPast ? 'bg-gray-900 text-gray-600 cursor-not-allowed' : ''}
                  ${!isPast && !isAvailable ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : ''}
                  ${!isPast && isAvailable ? 'bg-gray-700 hover:bg-gray-600 cursor-pointer' : ''}
                  ${isSelected ? 'ring-2 ring-cyan-500 bg-cyan-900' : ''}
                  ${dayType === 'WEEKEND' && !isPast ? 'border border-yellow-600' : ''}
                  ${dayType === 'SPECIAL_EVENT' && !isPast ? 'border-2 border-red-600' : ''}
                `}
              >
                <span className="font-semibold">{date.getDate()}</span>
                {isAvailable && avail && (
                  <span className="text-xs text-gray-400">
                    {avail.available}/{avail.total}
                  </span>
                )}
                {dayType === 'SPECIAL_EVENT' && !isPast && (
                  <span className="absolute top-1 right-1 text-xs text-red-500">★</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 border border-yellow-600 rounded"></div>
            <span>Weekend (1.5x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700 border-2 border-red-600 rounded"></div>
            <span>Special Event (2x)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-900 rounded"></div>
            <span>Unavailable</span>
          </div>
        </div>
      </div>

      {/* Selected Date Info */}
      {pricingInfo && (
        <div className="mt-8 bg-gradient-to-r from-cyan-900 to-blue-900 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Selected Date</h3>
          <div className="space-y-2">
            <p>Date: {pricingInfo.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>Type: {pricingInfo.dayType.replace('_', ' ')}</p>
            <p>Price Multiplier: {pricingInfo.multiplier}x</p>
            <p className="text-2xl font-bold text-cyan-400">
              Minimum Spend: {formatPrice(pricingInfo.minimumSpend)}
            </p>
          </div>
          
          <button
            onClick={handleContinue}
            className="mt-6 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Continue to Bottle Selection
          </button>
        </div>
      )}
    </div>
  )
}
