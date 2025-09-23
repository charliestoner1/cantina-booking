import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '../lib/prisma'

async function fetchTableTypes() {
  const tables = await prisma.tableType.findMany({
    orderBy: { displayOrder: 'asc' },
  })
  return tables
}

// This is a server component - it runs on the server
export default async function Home() {
  // Fetch table types from database
  const tableTypes = await prisma.tableType.findMany({
    orderBy: {
      baseMinimumSpend: 'asc',
    },
  })

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black z-10" />

        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 50%), radial-gradient(circle at 80% 80%, #10b981 0%, transparent 50%)',
            }}
          />
        </div>

        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tight">
            CANTINA
            <span className="block text-4xl md:text-5xl text-emerald-400 font-light">
              añejo
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
            Experience the ultimate nightlife with premium table service
          </p>
        </div>
      </section>

      {/* Table Types Grid */}
      <section id="tables" className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Experience
          </h2>
          <p className="text-xl text-gray-400">
            Select from our premium table options
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tableTypes.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-gray-900 py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-5xl mb-4">🍾</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Premium Bottles
            </h3>
            <p className="text-gray-400">
              Curated selection of top-shelf spirits and champagne
            </p>
          </div>
          <div>
            <div className="text-5xl mb-4">🎵</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Live Entertainment
            </h3>
            <p className="text-gray-400">
              World-class DJs and special performances
            </p>
          </div>
          <div>
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-white mb-2">VIP Service</h3>
            <p className="text-gray-400">
              Dedicated hosts ensuring an unforgettable night
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

// Table Card Component
function TableCard({ table }: { table: any }) {
  const amenitiesList = table.amenities ? table.amenities.slice(0, 3) : []

  return (
    <Link href={`/tables/${table.slug}`} className="group cursor-pointer">
      <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-emerald-500 transition-all duration-300 transform hover:scale-105">
        {/* Image Container */}
        <div className="relative h-64 overflow-hidden bg-gradient-to-br from-emerald-900 to-gray-900">
          {table.images && table.images[0] ? (
            <Image
              src={table.images[0]}
              alt={table.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-6xl opacity-50">
                {table.name.includes('VIP')
                  ? '👑'
                  : table.name.includes('Balcony')
                    ? '🌃'
                    : table.name.includes('Dance')
                      ? '🎵'
                      : '🍾'}
              </div>
            </div>
          )}

          {/* Capacity Badge */}
          <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium">
              {table.capacity} guests
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
            {table.name}
          </h3>

          <p className="text-gray-400 mb-4 line-clamp-2">
            {table.description ||
              'Premium table experience with dedicated service'}
          </p>

          {/* Amenities */}
          {amenitiesList.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {amenitiesList.map((amenity: string, idx: number) => (
                <span
                  key={idx}
                  className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded"
                >
                  {amenity.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Price and CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-800">
            <div>
              <p className="text-sm text-gray-500">Starting from</p>
              <p className="text-2xl font-bold text-emerald-400">
                ${table.baseMinimumSpend.toLocaleString()}
              </p>
            </div>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold px-4 py-2 rounded-lg transition-all group-hover:scale-105">
              Book Now
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
