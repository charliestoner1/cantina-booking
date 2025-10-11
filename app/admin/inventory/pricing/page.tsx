// app/admin/inventory/pricing/page.tsx
'use client'

import {
  AlertCircle,
  Calendar,
  DollarSign,
  Edit,
  Plus,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

type DayType = 'WEEKDAY' | 'WEEKEND' | 'SPECIAL_EVENT'

interface TableType {
  id: string
  name: string
  slug: string
}

interface PricingRule {
  id: string
  tableTypeId: string
  dayType: DayType
  minimumSpend: number
  depositRate: number
  eventName: string | null
  startDate: string | null
  endDate: string | null
  priority: number
  active: boolean
  createdAt: string
  updatedAt: string
  tableType: TableType
}

interface PricingFormData {
  id?: string
  tableTypeId: string
  dayType: DayType
  minimumSpend: number
  depositRate: number
  eventName: string
  startDate: string
  endDate: string
  priority: number
  active: boolean
}

export default function PricingRulesPage() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [tableTypes, setTableTypes] = useState<TableType[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)
  const [formData, setFormData] = useState<PricingFormData>({
    tableTypeId: '',
    dayType: 'WEEKDAY',
    minimumSpend: 0,
    depositRate: 0.15,
    eventName: '',
    startDate: '',
    endDate: '',
    priority: 0,
    active: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [rulesRes, tablesRes] = await Promise.all([
        fetch('/api/admin/pricing'),
        fetch('/api/admin/tables'),
      ])

      const rulesData = await rulesRes.json()
      const tablesData = await tablesRes.json()

      setPricingRules(rulesData)
      setTableTypes(tablesData)
    } catch (error) {
      console.error('Error fetching data:', error)
      alert('Failed to load pricing rules')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingRule(null)
    setFormData({
      tableTypeId: tableTypes[0]?.id || '',
      dayType: 'WEEKDAY',
      minimumSpend: 0,
      depositRate: 0.15,
      eventName: '',
      startDate: '',
      endDate: '',
      priority: 0,
      active: true,
    })
    setShowModal(true)
  }

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule)
    setFormData({
      id: rule.id,
      tableTypeId: rule.tableTypeId,
      dayType: rule.dayType,
      minimumSpend: Number(rule.minimumSpend),
      depositRate: Number(rule.depositRate),
      eventName: rule.eventName || '',
      startDate: rule.startDate
        ? new Date(rule.startDate).toISOString().split('T')[0]
        : '',
      endDate: rule.endDate
        ? new Date(rule.endDate).toISOString().split('T')[0]
        : '',
      priority: rule.priority,
      active: rule.active,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingRule
        ? `/api/admin/pricing/${editingRule.id}`
        : '/api/admin/pricing'
      const method = editingRule ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save pricing rule')
      }

      await fetchData()
      setShowModal(false)
      setEditingRule(null)
    } catch (error) {
      console.error('Error saving pricing rule:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to save pricing rule'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/pricing/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete pricing rule')
      }

      await fetchData()
    } catch (error) {
      console.error('Error deleting pricing rule:', error)
      alert('Failed to delete pricing rule')
    } finally {
      setLoading(false)
    }
  }

  const getDayTypeColor = (dayType: DayType) => {
    switch (dayType) {
      case 'WEEKDAY':
        return 'bg-blue-100 text-blue-800'
      case 'WEEKEND':
        return 'bg-purple-100 text-purple-800'
      case 'SPECIAL_EVENT':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDayTypeLabel = (dayType: DayType) => {
    switch (dayType) {
      case 'WEEKDAY':
        return 'Weekday'
      case 'WEEKEND':
        return 'Weekend'
      case 'SPECIAL_EVENT':
        return 'Special Event'
      default:
        return dayType
    }
  }

  // Group pricing rules by table type
  const groupedRules = tableTypes.reduce(
    (acc, table) => {
      acc[table.id] = {
        table,
        rules: pricingRules.filter((rule) => rule.tableTypeId === table.id),
      }
      return acc
    },
    {} as Record<string, { table: TableType; rules: PricingRule[] }>
  )

  if (loading && pricingRules.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Loading pricing rules...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Pricing Rules
            </h1>
            <p className="text-gray-600">
              Configure dynamic pricing for weekdays, weekends, and special
              events
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Add Pricing Rule
          </button>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>How Pricing Rules Work:</strong> Higher priority rules
            override lower priority rules. Special events take precedence when
            their date ranges match. Weekend pricing applies to Fridays and
            Saturdays.
          </div>
        </div>

        {/* Pricing Rules by Table Type */}
        <div className="space-y-6">
          {Object.values(groupedRules).map(({ table, rules }) => (
            <div key={table.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {table.name}
                </h2>
                <span className="text-sm text-gray-500">
                  ({rules.length} {rules.length === 1 ? 'rule' : 'rules'})
                </span>
              </div>

              {rules.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No pricing rules configured for this table type
                </p>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className={`border-2 rounded-lg p-4 ${
                        rule.active
                          ? 'border-gray-200 bg-white'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getDayTypeColor(
                                rule.dayType
                              )}`}
                            >
                              {getDayTypeLabel(rule.dayType)}
                            </span>
                            {rule.priority > 0 && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Priority {rule.priority}
                              </span>
                            )}
                            {!rule.active && (
                              <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-medium">
                                Inactive
                              </span>
                            )}
                          </div>

                          {rule.eventName && (
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              {rule.eventName}
                            </h3>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 block">
                                Minimum Spend
                              </span>
                              <span className="text-lg font-bold text-emerald-600">
                                ${Number(rule.minimumSpend).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">
                                Deposit Rate
                              </span>
                              <span className="text-lg font-bold text-gray-900">
                                {(Number(rule.depositRate) * 100).toFixed(0)}%
                              </span>
                            </div>
                            {rule.startDate && rule.endDate && (
                              <div className="col-span-2">
                                <span className="text-gray-500 block flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  Event Dates
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                  {new Date(
                                    rule.startDate
                                  ).toLocaleDateString()}{' '}
                                  -{' '}
                                  {new Date(rule.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(rule)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingRule ? 'Edit Pricing Rule' : 'Create Pricing Rule'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Table Type */}
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
                    <option value="">Select a table type</option>
                    {tableTypes.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Day Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day Type *
                  </label>
                  <select
                    value={formData.dayType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dayType: e.target.value as DayType,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="WEEKDAY">Weekday (Sun-Thu)</option>
                    <option value="WEEKEND">Weekend (Fri-Sat)</option>
                    <option value="SPECIAL_EVENT">Special Event</option>
                  </select>
                </div>

                {/* Event Name (only for special events) */}
                {formData.dayType === 'SPECIAL_EVENT' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      value={formData.eventName}
                      onChange={(e) =>
                        setFormData({ ...formData, eventName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="New Year's Eve Celebration"
                      required={formData.dayType === 'SPECIAL_EVENT'}
                    />
                  </div>
                )}

                {/* Date Range (only for special events) */}
                {formData.dayType === 'SPECIAL_EVENT' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required={formData.dayType === 'SPECIAL_EVENT'}
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
                        required={formData.dayType === 'SPECIAL_EVENT'}
                      />
                    </div>
                  </div>
                )}

                {/* Minimum Spend */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Spend ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimumSpend || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimumSpend: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="1500.00"
                    required
                  />
                </div>

                {/* Deposit Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deposit Rate (0.00 - 1.00) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={formData.depositRate || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        depositRate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0.15 (15%)"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter as decimal (0.15 = 15%, 0.25 = 25%)
                  </p>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={formData.priority || 0}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher priority rules override lower priority rules
                  </p>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600"
                  />
                  <label
                    htmlFor="active"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active (rule is currently in effect)
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {loading
                      ? 'Saving...'
                      : editingRule
                        ? 'Update Rule'
                        : 'Create Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
