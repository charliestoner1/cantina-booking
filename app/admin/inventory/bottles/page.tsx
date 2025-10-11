// app/admin/inventory/bottles/page.tsx
'use client'

import { Edit, Plus, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Bottle = {
  id: string
  name: string
  brand: string
  category: string
  size: string // Required field in schema
  price: number
  description: string
  imageUrl: string // Now using imageUrl directly
  inStock: boolean // Schema uses 'inStock' not 'available'
  active: boolean
}

type BottleFormData = {
  name: string
  brand: string
  category: string
  size: string
  price: string | number
  description: string
  imageUrl: string
  available: boolean
}

const categories = [
  'VODKA',
  'WHISKEY',
  'TEQUILA',
  'RUM',
  'GIN',
  'CHAMPAGNE',
  'WINE',
  'COGNAC',
  'LIQUEUR',
  'OTHER',
]

// Move Form component OUTSIDE to prevent re-creation on every render
const BottleForm = ({
  formData,
  setFormData,
}: {
  formData: BottleFormData
  setFormData: (data: BottleFormData) => void
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Name
      </label>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
        placeholder="Grey Goose"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Brand
      </label>
      <input
        type="text"
        value={formData.brand}
        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
        placeholder="Grey Goose"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Size
      </label>
      <select
        value={formData.size}
        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        <option value="375ml">375ml (Half Bottle)</option>
        <option value="750ml">750ml (Standard)</option>
        <option value="1L">1L</option>
        <option value="1.5L">1.5L (Magnum)</option>
        <option value="3L">3L (Jeroboam)</option>
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Category
      </label>
      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
      >
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Price
      </label>
      <input
        type="number"
        value={formData.price}
        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
        placeholder="450"
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
        rows={2}
        placeholder="Premium French vodka..."
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Image URL
      </label>
      <input
        type="text"
        value={formData.imageUrl}
        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
        className="w-full px-3 py-2 border border-gray-300 rounded-md"
        placeholder="https://..."
      />
    </div>
    <div className="flex items-center">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={formData.available}
          onChange={(e) =>
            setFormData({ ...formData, available: e.target.checked })
          }
          className="w-4 h-4"
        />
        <span className="text-sm font-medium text-gray-700">
          Available for booking
        </span>
      </label>
    </div>
  </div>
)

export default function BottlesManagement() {
  const [bottles, setBottles] = useState<Bottle[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [formData, setFormData] = useState<BottleFormData>({
    name: '',
    brand: '',
    category: 'VODKA',
    size: '750ml', // Default size
    price: '' as string | number, // Allow string or number to handle empty input
    description: '',
    imageUrl: '',
    available: true,
  })

  useEffect(() => {
    fetchBottles()
  }, [])

  const fetchBottles = async () => {
    try {
      const response = await fetch('/api/admin/bottles')
      const data = await response.json()
      setBottles(data)
    } catch (error) {
      console.error('Error fetching bottles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (bottle: Bottle) => {
    setEditingId(bottle.id)
    setFormData({
      name: bottle.name,
      brand: bottle.brand,
      category: bottle.category,
      size: bottle.size,
      price: Number(bottle.price),
      description: bottle.description,
      imageUrl: bottle.imageUrl, // Now using imageUrl directly
      available: bottle.inStock,
    })
  }

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({
      name: '',
      brand: '',
      category: 'VODKA',
      size: '750ml',
      price: '',
      description: '',
      imageUrl: '',
      available: true,
    })
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({
      name: '',
      brand: '',
      category: 'VODKA',
      size: '750ml',
      price: '',
      description: '',
      imageUrl: '',
      available: true,
    })
  }

  const handleSave = async () => {
    try {
      // Convert price to number
      const priceValue =
        typeof formData.price === 'string'
          ? parseFloat(formData.price)
          : formData.price

      if (isNaN(priceValue)) {
        alert('Please enter a valid price')
        return
      }

      const payload = {
        ...formData,
        price: priceValue,
      }

      if (isAdding) {
        const response = await fetch('/api/admin/bottles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          await fetchBottles()
          handleCancel()
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to create bottle')
        }
      } else if (editingId) {
        const response = await fetch(`/api/admin/bottles/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          await fetchBottles()
          handleCancel()
        } else {
          const error = await response.json()
          alert(error.error || 'Failed to update bottle')
        }
      }
    } catch (error) {
      console.error('Error saving bottle:', error)
      alert('Error saving bottle')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bottle?')) return

    try {
      const response = await fetch(`/api/admin/bottles/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchBottles()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete bottle')
      }
    } catch (error) {
      console.error('Error deleting bottle:', error)
      alert('Error deleting bottle')
    }
  }

  const filteredBottles = bottles.filter(
    (bottle) => filterCategory === 'ALL' || bottle.category === filterCategory
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-gray-600">Loading bottles...</div>
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
              Bottle Inventory
            </h1>
            <p className="text-gray-600">
              Manage your bottle selection and pricing
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Add Bottle
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredBottles.length} bottles
          </p>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Add New Bottle
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <BottleForm formData={formData} setFormData={setFormData} />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition"
              >
                Save Bottle
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Bottles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBottles.map((bottle) => (
            <div key={bottle.id} className="bg-white rounded-lg shadow">
              {editingId === bottle.id ? (
                <>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Edit Bottle
                    </h3>
                    <BottleForm formData={formData} setFormData={setFormData} />
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {bottle.imageUrl && (
                    <img
                      src={bottle.imageUrl}
                      alt={bottle.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-semibold text-purple-600 uppercase">
                          {bottle.category}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">
                          {bottle.name}
                        </h3>
                        <p className="text-sm text-gray-600">{bottle.brand}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          ${Number(bottle.price).toLocaleString()}
                        </div>
                        {!bottle.inStock && (
                          <span className="text-xs text-red-600 font-medium">
                            Unavailable
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-4">
                      {bottle.description}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(bottle)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(bottle.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {filteredBottles.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No bottles found in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}
