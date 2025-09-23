import { Clock, Star, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '../../../lib/prisma'

interface TableDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function TableDetailPage({
  params,
}: TableDetailPageProps) {
  const { slug } = await params

  const table = await prisma.tableType.findUnique({
    where: {
      slug: slug,
    },
  })

  if (!table) {
    notFound()
  }

  const amenities = table.amenities || []
  const images = table.images || []

  return (
    <main className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        {/* Background Image */}
        {images[0] ? (
          <Image
            src={images[0]}
            alt={table.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-gray-900" />
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
              {table.name}
            </h1>
            <p className="text-lg text-gray-300 mb-4">
              {table.description || 'Premium table service experience'}
            </p>

            <div className="flex flex-wrap gap-4 mb-6 text-white">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                {table.capacity} guests
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                10PM - 4AM
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-400" />
                Premium Service
              </span>
            </div>

            <Link
              href={`/booking/calendar?table=${table.slug}&tableId=${table.id}`}
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-6 py-3 rounded-lg transition-colors"
            >
              Select Date & Reserve →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* What's Included Section */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-white">
                  What's Included
                </h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-3">✓</span>
                    <span>Dedicated VIP host for the evening</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-3">✓</span>
                    <span>Premium mixers and garnishes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-3">✓</span>
                    <span>Priority entry with no wait time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-400 mr-3">✓</span>
                    <span>Complimentary coat check service</span>
                  </li>
                </ul>
              </div>

              {/* Amenities Section */}
              {amenities.length > 0 && (
                <div className="bg-gray-900 rounded-lg p-6">
                  <h2 className="text-2xl font-bold mb-4 text-white">
                    Amenities
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-300"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Section */}
              <div className="bg-gray-900 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-white">Location</h2>
                <p className="text-gray-300">
                  Located in the premium section with prime views of the venue.
                </p>
              </div>

              {/* Policies Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-3 text-white">
                    Cancellation Policy
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Free cancellation up to 48 hours before</li>
                    <li>• 50% refund within 24-48 hours</li>
                    <li>• No refund within 24 hours</li>
                  </ul>
                </div>

                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-3 text-white">
                    Requirements
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>• Valid ID (21+ only)</li>
                    <li>• Upscale attire required</li>
                    <li>• Arrive by 11 PM</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 rounded-lg p-6 sticky top-6">
                <h3 className="text-xl font-bold mb-6 text-white">
                  Reservation Details
                </h3>

                <div className="space-y-4 pb-6 border-b border-gray-800">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Spend</span>
                    <span className="text-xl font-bold text-emerald-400">
                      ${table.baseMinimumSpend.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deposit</span>
                    <span className="text-white">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Capacity</span>
                    <span className="text-white">{table.capacity} guests</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                  <p className="text-sm text-yellow-300">
                    Weekend and special event pricing may vary
                  </p>
                </div>

                <Link
                  href={`/booking/calendar?table=${table.slug}&tableId=${table.id}`}
                  className="block w-full mt-6 bg-emerald-500 hover:bg-emerald-600 text-black text-center font-bold py-3 rounded-lg transition-colors"
                >
                  Check Availability
                </Link>

                <p className="text-center text-gray-500 text-xs mt-4">
                  Free cancellation up to 48 hours before
                </p>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          {images.length > 1 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6 text-white">Gallery</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {images.slice(1, 4).map((image, idx) => (
                  <div
                    key={idx}
                    className="relative h-48 rounded-lg overflow-hidden bg-gray-900"
                  >
                    <Image
                      src={image}
                      alt={`Gallery ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export async function generateStaticParams() {
  const tables = await prisma.tableType.findMany({
    select: { slug: true },
  })

  return tables.map((table) => ({
    slug: table.slug,
  }))
}
