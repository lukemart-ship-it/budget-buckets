import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createMonth, createCategory } from '../lib/firestore'

function getDefaultMonth() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return d.toISOString().slice(0, 7) // "YYYY-MM"
}

function formatMonthName(yearMonth) {
  const [year, month] = yearMonth.split('-')
  return new Date(parseInt(year), parseInt(month) - 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' })
}

export default function Setup() {
  const navigate = useNavigate()
  const [monthValue, setMonthValue] = useState(getDefaultMonth) // "YYYY-MM"
  const [categories, setCategories] = useState([])
  const [newName, setNewName]       = useState('')
  const [newBudget, setNewBudget]   = useState('')
  const [formError, setFormError]   = useState('')
  const [saving, setSaving]         = useState(false)

  function addCategory() {
    const name    = newName.trim()
    const budgeted = parseFloat(newBudget)
    if (!name || isNaN(budgeted) || budgeted <= 0) {
      setFormError('Enter a name and a valid amount.')
      return
    }
    setCategories(prev => [...prev, { key: Date.now(), name, budgeted }])
    setNewName('')
    setNewBudget('')
    setFormError('')
  }

  function removeCategory(key) {
    setCategories(prev => prev.filter(c => c.key !== key))
  }

  async function handleCreate() {
    if (!monthValue || categories.length === 0 || saving) return
    setSaving(true)
    try {
      const ref = await createMonth(formatMonthName(monthValue))
      await Promise.all(
        categories.map((cat, i) =>
          createCategory(ref.id, { name: cat.name, budgeted: cat.budgeted, order: i })
        )
      )
      navigate('/')
    } catch {
      setFormError('Something went wrong. Try again.')
      setSaving(false)
    }
  }

  const canCreate = monthValue && categories.length > 0 && !saving

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Set Up Month</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-32">

        {/* Month picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
          <input
            type="month"
            value={monthValue}
            onChange={e => setMonthValue(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Category list */}
        {categories.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
            <div className="space-y-2">
              {categories.map(cat => (
                <div
                  key={cat.key}
                  className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex justify-between items-center shadow-sm"
                >
                  <div>
                    <p className="font-medium text-gray-900">{cat.name}</p>
                    <p className="text-sm text-gray-400">${cat.budgeted.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeCategory(cat.key)}
                    className="text-gray-300 hover:text-red-400 text-2xl leading-none transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add category form */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Add category</p>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
            <input
              type="text"
              placeholder="Category name"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="number"
              inputMode="decimal"
              placeholder="Budget amount"
              value={newBudget}
              onChange={e => setNewBudget(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCategory()}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {formError && <p className="text-sm text-red-500">{formError}</p>}
            <button
              onClick={addCategory}
              className="w-full bg-slate-100 hover:bg-slate-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors"
            >
              + Add
            </button>
          </div>
        </div>

      </div>

      {/* Create Month button */}
      <div className="fixed bottom-6 right-4 left-4">
        <button
          onClick={handleCreate}
          disabled={!canCreate}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300 text-white font-semibold py-4 rounded-2xl shadow-lg transition-colors text-base"
        >
          {saving
            ? 'Creating...'
            : `Create Month${categories.length > 0 ? ` (${categories.length} ${categories.length === 1 ? 'category' : 'categories'})` : ''}`
          }
        </button>
      </div>

    </div>
  )
}
