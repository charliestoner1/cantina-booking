// app/admin/inventory/bottles/page.tsx
'use client'

import { Edit, Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Bottle = {
  id: string
  name: string
  brand: string
  category: string
  price: number
  description: string
  imageUrl: string
  available: boolean
}

const categories = [
  'Vodka',
  'Whiskey',
  'Tequila',
  'Rum',
  'Gin',
  'Champagne',
  'Wine',
  'Cognac',
  'Other',
]

export default function BottlesManagement() {
  const [bottles, setBottles] = useState<Bottle[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'Vodka',
    price: 0,
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
      price: Number(bottle.price),
      description: bottle.description,
      imageUrl: bottle.imageUrl,
      available: bottle.available,
    })
  }

  const handleAdd = () => {
    setIsAdding(true)
    setFormData({
      name: '',
      brand: '',
      category: 'Vodka',
      price: 0,
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
      category: 'Vodka',
      price: 0,
      description: '',
      imageUrl: '',
      available: true,
    })
  }

  const handleSave = async () => {
    try {
      if (isAdding) {
        const response = await fetch('/api/admin/bottles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          await fetchBottles()
          handleCancel()
        } else {
          alert('Failed to create bottle')
        }
      } else if (editingId) {
        const response = await fetch(`/api/admin/bottles/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })

        if (response.ok) {
          await fetchBottles()
          handleCancel()
        } else {
          alert('Failed to update bottle')
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

  const Form = () => (
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
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
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
          onChange={(e) =>
            setFormData({ ...formData, price: parseFloat(e.target.value) })
          }
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
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
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
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <span className="ml-4 text-sm text-gray-600">
            Showing {filteredBottles.length} bottles
          </span>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Add New Bottle</h2>
            <Form />
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

        {/* Bottles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBottles.map((bottle) => (
            <div
              key={bottle.id}
              className="bg-white rounded-lg shadow-md border-2 border-gray-200"
            >
              {editingId === bottle.id ? (
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">Edit Bottle</h2>
                  <Form />
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                        {!bottle.available && (
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
