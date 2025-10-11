// components/admin/AdminNav.tsx
'use client'

import { Calendar, LayoutDashboard, LogOut, Package } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    {
      name: 'Tonight',
      href: '/admin/dashboard/tonight',
      icon: Calendar,
      description: "Today's bookings",
    },
    {
      name: 'All Bookings',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      description: 'View all reservations',
    },
    {
      name: 'Inventory',
      href: '/admin/inventory',
      icon: Package,
      description: 'Manage tables & bottles',
    },
  ]

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/admin/dashboard/tonight"
              className="flex items-center gap-3"
            >
              <span className="text-2xl font-bold text-emerald-500">
                Cantina
              </span>
              <span className="text-gray-400 text-sm">Admin</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === '/admin/dashboard/tonight' &&
                  pathname.startsWith('/admin/dashboard/tonight')) ||
                (item.href === '/admin/dashboard' &&
                  pathname === '/admin/dashboard') ||
                (item.href === '/admin/inventory' &&
                  pathname.startsWith('/admin/inventory'))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Logout */}
          <button
            onClick={() => (window.location.href = '/api/auth/signout')}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-800">
        <div className="px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-400">
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
