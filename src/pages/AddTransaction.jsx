import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCurrentMonth } from '../hooks/useCurrentMonth'
import { useAuth } from '../context/AuthContext'
import { addTransaction } from '../lib/firestore'

export default function AddTransaction() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { displayName } = useAuth()
  const { month, categories, loading } = useCurrentMonth()

  const [amount, setAmount]   = useState('')
  const [note, setNote]       = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    location.state?.categoryId ?? null
  )
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  async function handleSubmit() {
    const parsed = parseFloat(amount)
    if (!selectedCategoryId) { setError('Select a category.'); return }
    if (isNaN(parsed) || parsed <= 0) { setError('Enter a valid amount.'); return }
    setSaving(true)
    try {
      await addTransaction(month.id, {
        categoryId: selectedCategoryId,
        amount: parsed,
        createdBy: displayName,
        note: note.trim(),
      })
      navigate('/')
    } catch {
      setError('Something went wrong. Try again.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">Add Transaction</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 pb-32">

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-medium">$</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-4 text-2xl font-semibold text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Category selector */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Category</p>
          <div className="space-y-2">
            {categories.map(cat => {
              const remaining  = cat.budgeted - cat.spent
              const isSelected = selectedCategoryId === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition-colors shadow-sm flex justify-between items-center ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 bg-white active:bg-slate-50'
                  }`}
                >
                  <span className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {cat.name}
                  </span>
                  <span className={`text-sm tabular-nums ${remaining < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                    ${Math.abs(remaining).toFixed(2)} {remaining < 0 ? 'over' : 'left'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Note (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Note <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Costco run, gas station"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

      </div>

      {/* Submit */}
      <div className="fixed bottom-6 right-4 left-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-300 text-white font-semibold py-4 rounded-2xl shadow-lg transition-colors text-base"
        >
          {saving ? 'Saving...' : 'Add Transaction'}
        </button>
      </div>

    </div>
  )
}
