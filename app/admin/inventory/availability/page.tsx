// app/admin/inventory/availability/page.tsx
'use client'

import { Calendar, Plus, Save, Trash2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type TableType = {
  id: string
  name: string
  slug: string
}

type InventoryRecord = {
  id: string
  tableTypeId: string
  date: string
  totalCount: number
  available: number
  blocked: boolean
  tableType: TableType
}

export default function AvailabilityManagement() {
  const [tables, setTables] = useState<TableType[]>([])
  const [inventory, setInventory] = useState<InventoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [filterTableType, setFilterTableType] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('')

  const [formData, setFormData] = useState({
    tableTypeId: '',
    startDate: '',
    endDate: '',
    totalCount: 0,
    blocked: false,
  })

  useEffect(() => {
    fetchTables()
    fetchInventory()
  }, [filterTableType, filterDate])

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/admin/tables')
      const data = await response.json()
      setTables(data)
    } catch (error) {
      console.error('Error fetching tables:', error)
    }
  }

  const fetchInventory = async () => {
    try {
      let url = '/api/admin/inventory'
      const params = new URLSearchParams()

      if (filterTableType !== 'all') {
        params.append('tableTypeId', filterTableType)
      }
      if (filterDate) {
        params.append('date', filterDate)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setInventory(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setIsAdding(true)
    const today = new Date().toISOString().split('T')[0]
    setFormData({
      tableTypeId: tables[0]?.id || '',
      startDate: today,
      endDate: today,
      totalCount: 1,
      blocked: false,
    })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setFormData({
      tableTypeId: '',
      startDate: '',
      endDate: '',
      totalCount: 0,
      blocked: false,
    })
  }

  const handleSave = async () => {
    try {
      if (!formData.tableTypeId || !formData.startDate || !formData.endDate) {
        alert('Please fill in all required fields')
        return
      }

      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchInventory()
        handleCancel()
        alert('Availability created successfully!')
      } else {
        const error = await response.json()
        alert(`Error: ${error.message || 'Failed to create availability'}`)
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      alert('Failed to save availability')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this availability record?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/inventory/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchInventory()
        alert('Availability deleted successfully!')
      } else {
        alert('Failed to delete availability')
      }
    } catch (error) {
      console.error('Error deleting availability:', error)
      alert('Failed to delete availability')
    }
  }

  const handleToggleBlocked = async (record: InventoryRecord) => {
    try {
      const response = await fetch(`/api/admin/inventory/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocked: !record.blocked,
        }),
      })

      if (response.ok) {
        await fetchInventory()
      } else {
        alert('Failed to update availability')
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      alert('Failed to update availability')
    }
  }

  const handleUpdateCount = async (
    record: InventoryRecord,
    newCount: number
  ) => {
    try {
      const response = await fetch(`/api/admin/inventory/${record.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalCount: newCount,
        }),
      })

      if (response.ok) {
        await fetchInventory()
      } else {
        alert('Failed to update count')
      }
    } catch (error) {
      console.error('Error updating count:', error)
      alert('Failed to update count')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDay()
    return day === 0 || day === 6 ? 'Weekend' : 'Weekday'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading availability...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Table Availability
              </h1>
              <p className="text-gray-600">
                Manage table availability for specific dates
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Availability
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Table Type
              </label>
              <select
                value={filterTableType}
                onChange={(e) => setFilterTableType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Table Types</option>
                {tables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-2 border-emerald-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Add Availability
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table Type *
                </label>
                <select
                  value={formData.tableTypeId}
                  onChange={(e) =>
                    setFormData({ ...formData, tableTypeId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Tables Available *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalCount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.blocked}
                    onChange={(e) =>
                      setFormData({ ...formData, blocked: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Block these dates (no bookings allowed)
                  </span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Inventory List */}
        <div className="space-y-4">
          {inventory.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600 mb-2">
                No availability records
              </p>
              <p className="text-gray-500">
                Click "Add Availability" to set table availability for specific
                dates
              </p>
            </div>
          )}

          {inventory.map((record) => (
            <div
              key={record.id}
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition ${
                record.blocked ? 'border-2 border-red-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {record.tableType.name}
                    </h3>
                    {record.blocked && (
                      <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                        BLOCKED
                      </span>
                    )}
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                      {getDayOfWeek(record.date)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-gray-700">Date:</span>
                      <p className="text-gray-900">{formatDate(record.date)}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">
                        Total Tables:
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          min="0"
                          value={record.totalCount}
                          onChange={(e) =>
                            handleUpdateCount(
                              record,
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">
                        Available:
                      </span>
                      <p className="text-emerald-600 font-bold text-lg">
                        {record.available}
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">
                        Reserved:
                      </span>
                      <p className="text-gray-900 font-bold text-lg">
                        {record.totalCount - record.available}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleToggleBlocked(record)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      record.blocked
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                    title={record.blocked ? 'Unblock' : 'Block'}
                  >
                    {record.blocked ? 'Unblock' : 'Block'}
                  </button>
                  <button
                    onClick={() => handleDelete(record.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {record.available === 0 && !record.blocked && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm font-medium">
                    ⚠️ All tables are reserved for this date
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
