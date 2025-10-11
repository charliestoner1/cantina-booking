// app/admin/inventory/page.tsx
'use client'

import { Calendar, DollarSign, Package, Wine } from 'lucide-react'
import Link from 'next/link'

export default function InventoryPage() {
  const sections = [
    {
      title: 'Tables',
      description: 'Manage table types, capacity, and base pricing',
      icon: Package,
      href: '/admin/inventory/tables',
      color: 'bg-blue-500',
    },
    {
      title: 'Bottles',
      description: 'Manage bottle inventory, categories, and pricing',
      icon: Wine,
      href: '/admin/inventory/bottles',
      color: 'bg-purple-500',
    },
    {
      title: 'Availability',
      description: 'Set table availability for specific dates',
      icon: Calendar,
      href: '/admin/inventory/availability',
      color: 'bg-green-500',
    },
    {
      title: 'Pricing Rules',
      description: 'Configure weekend and special event pricing',
      icon: DollarSign,
      href: '/admin/inventory/pricing',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Inventory Management
          </h1>
          <p className="text-gray-600">
            Manage tables, bottles, availability, and pricing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-8 border-2 border-transparent hover:border-emerald-500"
            >
              <div className="flex items-start gap-4">
                <div className={`${section.color} p-4 rounded-lg`}>
                  <section.icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-gray-600">{section.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
