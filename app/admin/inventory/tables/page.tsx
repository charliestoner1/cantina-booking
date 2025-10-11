// app/admin/inventory/tables/page.tsx
'use client'

import { Edit, Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type TableType = {
  id: string
  name: string
  slug: string
  description: string
  shortDescription: string
  capacity: number
  baseMinimumSpend: number
  amenities: string[]
  imageUrl: string
}

export default function TablesManagement() {
  const [tables, setTables] = useState<TableType[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    capacity: 0,
    baseMinimumSpend: 0,
    amenities: '',
    imageUrl: '',
  })

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/tables')
      const data = await response.json()
      setTables(data)
    } catch (error) {
      console.error('Error fetching tables:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (table: TableType) => {
    setEditingId(table.id)
    setFormData({
      name: table.name,
      slug: table.slug,
      description: table.description,
      shortDescription: table.shortDescription,
      capacity: table.capacity,
      baseMinimumSpend: Number(table.baseMinimumSpend),
      amenities: table.amenities.join(', '),
      imageUrl: table.imageUrl,
    })
  }

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      capacity: 0,
      baseMinimumSpend: 0,
      amenities: '',
      imageUrl: '',
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({
      name: '',
      slug: '',
      description: '',
      shortDescription: '',
      capacity: 0,
      baseMinimumSpend: 0,
      amenities: '',
      imageUrl: '',
    })
  }

  const handleSave = async () => {
    try {
      const amenitiesArray = formData.amenities
        .split(',')
        .map((a) => a.trim())
        .filter((a) => a.length > 0)

      const payload = {
        ...formData,
        amenities: amenitiesArray,
      }

      if (isAdding) {
        // Create new table
        const response = await fetch('/api/admin/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          await fetchTables()
          handleCancel()
        } else {
          alert('Failed to create table')
        }
      } else if (editingId) {
        // Update existing table
        const response = await fetch(`/api/admin/tables/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          await fetchTables()
          handleCancel()
        } else {
          alert('Failed to update table')
        }
      }
    } catch (error) {
      console.error('Error saving table:', error)
      alert('Error saving table')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this table type?')) return

    try {
      const response = await fetch(`/api/admin/tables/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchTables()
      } else {
        alert('Failed to delete table')
      }
    } catch (error) {
      console.error('Error deleting table:', error)
      alert('Error deleting table')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-gray-600">Loading tables...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Table Types
            </h1>
            <p className="text-gray-600">
              Manage your table types, capacity, and pricing
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Add Table Type
          </button>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Add New Table Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="VIP Balcony"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="vip-balcony"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Elevated views and premium seating"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="Premium seating with elevated views..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="8"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Minimum Spend
                </label>
                <input
                  type="number"
                  value={formData.baseMinimumSpend}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      baseMinimumSpend: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="1500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) =>
                    setFormData({ ...formData, amenities: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Premium seating, Elevated view, Dedicated server"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition"
              >
                <X className="w-5 h-5" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tables List */}
        <div className="space-y-4">
          {tables.map((table) => (
            <div
              key={table.id}
              className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200"
            >
              {editingId === table.id ? (
                // Edit Mode
                <div>
                  <h2 className="text-2xl font-bold mb-4">Edit Table Type</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description
                      </label>
                      <input
                        type="text"
                        value={formData.shortDescription}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            shortDescription: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity
                      </label>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            capacity: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Base Minimum Spend
                      </label>
                      <input
                        type="number"
                        value={formData.baseMinimumSpend}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            baseMinimumSpend: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amenities (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.amenities}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            amenities: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, imageUrl: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                    >
                      <Save className="w-5 h-5" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-lg transition"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {table.name}
                      </h2>
                      <p className="text-sm text-gray-500">/{table.slug}</p>
                      <p className="text-gray-600 mt-1">
                        {table.shortDescription}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(table)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(table.id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{table.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-600">Capacity:</span>
                      <p className="font-semibold">{table.capacity} guests</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">
                        Minimum Spend:
                      </span>
                      <p className="font-semibold">
                        ${Number(table.baseMinimumSpend).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {table.amenities.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">Amenities:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {table.amenities.map((amenity, idx) => (
                          <span
                            key={idx}
                            className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
