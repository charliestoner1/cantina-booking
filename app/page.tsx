// app/page.tsx - Fixed Version with Proper TypeScript Types
import { prisma } from '@/lib/prisma'
import { Sparkles, Users, Wine } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

// TypeScript interface for TableType
interface TableType {
  id: string
  name: string
  slug: string
  description: string | null
  capacity: number
  baseMinimumSpend: number
  amenities: string[]
  images: string[]
  createdAt: Date
  updatedAt: Date
}

// Fetch table types from database
async function getTableTypes() {
  const tables = await prisma.tableType.findMany({
    orderBy: { baseMinimumSpend: 'asc' },
  })
  return tables
}

export default async function Home() {
  const tables = await getTableTypes()

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section with Gradient Overlay */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-teal-950 opacity-90"></div>

        {/* Animated Particles/Blur Effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Text Logo */}
          <div className="mb-8">
            <h1 className="text-7xl md:text-8xl font-bold text-white mb-4 tracking-tight">
              CANTINA
            </h1>
            <p className="text-5xl md:text-6xl font-light italic text-emerald-400">
              añejo
            </p>
          </div>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience the ultimate nightlife with premium table service
          </p>

          {/* CTA Button */}
          <a
            href="#tables"
            className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-lg px-12 py-4 rounded-full hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-emerald-500/50"
          >
            Reserve Your Table
          </a>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-emerald-400 rounded-full p-1">
              <div className="w-1.5 h-3 bg-emerald-400 rounded-full mx-auto animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Wine className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Premium Bottles
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Curated selection of top-shelf spirits and champagne for an
                unforgettable experience
              </p>
            </div>

            <div className="group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                VIP Service
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Dedicated hosts and personalized attention ensuring every detail
                is perfect
              </p>
            </div>

            <div className="group">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-10 h-10 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Exclusive Access
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Skip the lines and enjoy priority entry to the city's hottest
                venue
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tables Section */}
      <section id="tables" className="py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Choose Your Experience
            </h2>
            <p className="text-xl text-gray-400">
              Select from our premium table options
            </p>
          </div>

          {/* Table Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tables.map((table) => (
              <TableCard key={table.id} table={table} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-4 bg-gradient-to-t from-emerald-950 via-black to-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Elevate Your Night?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Book your premium table experience today
          </p>
          <a
            href="#tables"
            className="inline-block bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-lg px-12 py-4 rounded-full hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-emerald-500/50"
          >
            View All Tables
          </a>
        </div>
      </section>
    </main>
  )
}

// Modern Table Card Component with Proper Types
function TableCard({ table }: { table: TableType }) {
  const amenitiesList = table.amenities ? table.amenities.slice(0, 3) : []

  // Determine icon based on table type
  const getTableIcon = (name: string): string => {
    if (name.toLowerCase().includes('vip')) return '👑'
    if (name.toLowerCase().includes('balcony')) return '🌃'
    if (name.toLowerCase().includes('dance')) return '🎵'
    return '🍾'
  }

  return (
    <Link href={`/tables/${table.slug}`} className="group block">
      <div className="relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border border-gray-800 hover:border-emerald-500 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20">
        {/* Image Container with Gradient Overlay */}
        <div className="relative h-72 overflow-hidden">
          {table.images && table.images[0] ? (
            <>
              <div className="relative w-full h-full">
                <Image
                  src={table.images[0]}
                  alt={table.name}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
              </div>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            </>
          ) : (
            <>
              {/* Fallback with Icon */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/50 to-teal-900/50 flex items-center justify-center">
                <div className="text-9xl opacity-30 group-hover:scale-110 transition-transform duration-500">
                  {getTableIcon(table.name)}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            </>
          )}

          {/* Floating Capacity Badge */}
          <div className="absolute top-4 right-4 backdrop-blur-md bg-black/60 px-4 py-2 rounded-full border border-emerald-500/30">
            <span className="text-white text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              {table.capacity} guests
            </span>
          </div>

          {/* Table Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors duration-300">
              {table.name}
            </h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Description */}
          <p className="text-gray-400 line-clamp-2 min-h-[3rem]">
            {table.description ||
              'Premium table experience with dedicated bottle service'}
          </p>

          {/* Amenities Tags */}
          {amenitiesList.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((amenity: string, idx: number) => (
                <span
                  key={idx}
                  className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20"
                >
                  {amenity.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-800 pt-4">
            {/* Price and CTA */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Starting from
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  ${table.baseMinimumSpend.toLocaleString()}
                </p>
              </div>
              <button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold px-6 py-3 rounded-full transition-all duration-300 transform group-hover:scale-110 shadow-lg shadow-emerald-500/30">
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
        </div>
      </div>
    </Link>
  )
}
