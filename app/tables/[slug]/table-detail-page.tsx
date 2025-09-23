import { ChevronRight, Clock, Star, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '../../../lib/prisma'

interface TableDetailPageProps {
  params: {
    slug: string
  }
}

export default async function TableDetailPage({
  params,
}: TableDetailPageProps) {
  const table = await prisma.tableType.findUnique({
    where: {
      slug: params.slug,
    },
  })

  if (!table) {
    notFound()
  }

  const amenities = table.amenities || []
  const images = table.images || []

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero Section with Image Gallery */}
      <section className="relative h-[70vh] min-h-[600px]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black z-10" />

        {/* Main Image */}
        <div className="relative w-full h-full">
          {images[0] ? (
            <Image
              src={images[0]}
              alt={table.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-gray-900 flex items-center justify-center">
              <div className="text-8xl opacity-30">
                {table.name.includes('VIP') ? '👑' : '🍾'}
              </div>
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-8 md:p-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              {table.name}
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mb-6">
              {table.description ||
                'Experience premium nightlife with exclusive table service'}
            </p>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Up to {table.capacity} guests</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-400" />
                <span>Premium Service</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span>10 PM - 4 AM</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href={`/booking/calendar?table=${table.slug}`}
              className="inline-flex items-center bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg px-8 py-4 rounded-lg transition-all transform hover:scale-105"
            >
              Select Date & Reserve
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Left Column - Details */}
          <div>
            <h2 className="text-3xl font-bold mb-6 text-emerald-400">
              Table Details
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">What's Included</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">✓</span>
                    Dedicated VIP host for the evening
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">✓</span>
                    Premium mixers and garnishes
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">✓</span>
                    Priority entry with no wait time
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-2">✓</span>
                    Complimentary coat check service
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-900 border border-gray-800 px-3 py-1 rounded-full text-sm"
                    >
                      {amenity.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Location</h3>
                <p className="text-gray-300">
                  {table.location ||
                    `Located in the ${
                      table.name.includes('VIP')
                        ? 'exclusive VIP section'
                        : table.name.includes('Balcony')
                          ? 'elevated balcony area'
                          : table.name.includes('Dance')
                            ? 'main floor near the DJ booth'
                            : 'premium section'
                    } with prime views of the venue.`}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Pricing & Booking */}
          <div>
            <div className="bg-gray-900 rounded-xl p-8 sticky top-8">
              <h3 className="text-2xl font-bold mb-6">Reservation Details</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-gray-400">Minimum Spend</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    ${table.baseMinimumSpend.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-gray-400">Deposit Required</span>
                  <span className="text-xl">15%</span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-gray-800">
                  <span className="text-gray-400">Capacity</span>
                  <span className="text-xl">Up to {table.capacity} guests</span>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-200">
                  <strong>Note:</strong> Prices may vary for weekends and
                  special events. Final pricing will be shown after date
                  selection.
                </p>
              </div>

              <Link
                href={`/booking/calendar?table=${table.slug}`}
                className="block w-full text-center bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-lg px-8 py-4 rounded-lg transition-all transform hover:scale-105"
              >
                Check Availability
              </Link>

              <p className="text-center text-gray-500 text-sm mt-4">
                Free cancellation up to 48 hours before
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      {images.length > 1 && (
        <section className="py-16 px-4 md:px-8 border-t border-gray-900">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Gallery</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {images.slice(1, 4).map((image, idx) => (
                <div
                  key={idx}
                  className="relative h-64 rounded-lg overflow-hidden"
                >
                  <Image
                    src={image}
                    alt={`${table.name} view ${idx + 2}`}
                    fill
                    className="object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Policies */}
      <section className="py-16 px-4 md:px-8 border-t border-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Booking Policies</h2>
          <div className="grid md:grid-cols-2 gap-8 text-gray-300">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Cancellation Policy
              </h3>
              <ul className="space-y-2">
                <li>
                  • Free cancellation up to 48 hours before your reservation
                </li>
                <li>
                  • 50% deposit refund for cancellations within 24-48 hours
                </li>
                <li>
                  • No refund for cancellations within 24 hours or no-shows
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Important Information
              </h3>
              <ul className="space-y-2">
                <li>• Valid ID required for all guests (21+ only)</li>
                <li>• Dress code: Upscale nightlife attire required</li>
                <li>• Table must be claimed by 11 PM or may be released</li>
                <li>• Minimum spend must be met with bottle purchases</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// Generate static params for all table slugs
export async function generateStaticParams() {
  const tables = await prisma.tableType.findMany({
    select: { slug: true },
  })

  return tables.map((table) => ({
    slug: table.slug,
  }))
}
