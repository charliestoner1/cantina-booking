// lib/store/booking-store.ts - Zustand store for booking state management

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface BookingState {
  tableType: {
    id: string
    name: string
    slug: string
    minimumSpend: number
    capacity: number
  } | null
  selectedDate: Date | null
  selectedBottles: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
  customerInfo: {
    name: string
    email: string
    phone: string
    partySize: number
    occasion?: string
    specialRequests?: string
  } | null

  // Actions
  setTableType: (table: BookingState['tableType']) => void
  setSelectedDate: (date: Date | null) => void
  addBottle: (bottle: { id: string; name: string; price: number }) => void
  removeBottle: (bottleId: string) => void
  updateBottleQuantity: (bottleId: string, quantity: number) => void
  setCustomerInfo: (info: BookingState['customerInfo']) => void
  getTotalBottleSpend: () => number
  clearBooking: () => void
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      tableType: null,
      selectedDate: null,
      selectedBottles: [],
      customerInfo: null,

      setTableType: (table) => set({ tableType: table }),

      setSelectedDate: (date) => set({ selectedDate: date }),

      addBottle: (bottle) =>
        set((state) => {
          const existing = state.selectedBottles.find((b) => b.id === bottle.id)
          if (existing) {
            return {
              selectedBottles: state.selectedBottles.map((b) =>
                b.id === bottle.id ? { ...b, quantity: b.quantity + 1 } : b
              ),
            }
          }
          return {
            selectedBottles: [
              ...state.selectedBottles,
              { ...bottle, quantity: 1 },
            ],
          }
        }),

      removeBottle: (bottleId) =>
        set((state) => ({
          selectedBottles: state.selectedBottles.filter(
            (b) => b.id !== bottleId
          ),
        })),

      updateBottleQuantity: (bottleId, quantity) =>
        set((state) => ({
          selectedBottles: state.selectedBottles.map((b) =>
            b.id === bottleId ? { ...b, quantity } : b
          ),
        })),

      setCustomerInfo: (info) => set({ customerInfo: info }),

      getTotalBottleSpend: () => {
        const state = get()
        return state.selectedBottles.reduce((total, bottle) => {
          return total + bottle.price * bottle.quantity
        }, 0)
      },

      clearBooking: () =>
        set({
          tableType: null,
          selectedDate: null,
          selectedBottles: [],
          customerInfo: null,
        }),
    }),
    {
      name: 'cantina-booking-storage',
      partialize: (state) => ({
        tableType: state.tableType,
        selectedDate: state.selectedDate,
        selectedBottles: state.selectedBottles,
      }),
      // Custom storage to handle date serialization
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const data = JSON.parse(str)
          // Convert date strings back to Date objects
          if (data.state?.selectedDate) {
            data.state.selectedDate = new Date(data.state.selectedDate)
          }
          return data
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
)
