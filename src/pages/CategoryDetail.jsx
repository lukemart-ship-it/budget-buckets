import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCurrentMonth } from '../hooks/useCurrentMonth'
import { deleteTransaction } from '../lib/firestore'
import ConfirmModal from '../components/ConfirmModal'

function formatDate(timestamp) {
  if (!timestamp) return ''
  return timestamp.toDate().toLocaleDateString('default', { month: 'short', day: 'numeric' })
}

function getBarColor(spent, budgeted) {
  const pct = spent / budgeted
  if (pct >= 0.75) return 'bg-red-500'
  if (pct >= 0.5)  return 'bg-amber-400'
  return 'bg-blue-500'
}

export default function CategoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { month, categories, transactions, loading } = useCurrentMonth()
  const [pendingDeleteId, setPendingDeleteId] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  const category = categories.find(c => c.id === id)

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Category not found.</p>
      </div>
    )
  }

  const { name, budgeted, spent } = category
  const remaining    = budgeted - spent
  const isOverBudget = remaining < 0
  const barWidth     = Math.min(100, (spent / budgeted) * 100)
  const barColor     = getBarColor(spent, budgeted)

  const catTransactions = transactions.filter(t => t.categoryId === id)

  async function handleDeleteConfirm() {
    await deleteTransaction(month.id, pendingDeleteId)
    setPendingDeleteId(null)
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">{name}</h1>
        </div>

        {/* Stats */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 flex justify-between mb-3">
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-0.5">Budgeted</p>
            <p className="font-semibold text-gray-800">${budgeted.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-0.5">Spent</p>
            <p className="font-semibold text-gray-800">${spent.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-0.5">Remaining</p>
            <p className={`font-semibold ${isOverBudget ? 'text-red-500' : 'text-indigo-600'}`}>
              {isOverBudget ? '-' : ''}${Math.abs(remaining).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Transactions */}
      <div className="px-4 py-4 space-y-2 pb-28">
        {catTransactions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">No transactions yet.</p>
        ) : (
          catTransactions.map(txn => (
            <div
              key={txn.id}
              className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex justify-between items-start shadow-sm"
            >
              <div className="space-y-0.5">
                <p className="font-semibold text-gray-900 tabular-nums">${txn.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-400">
                  {[txn.createdBy, formatDate(txn.createdAt)].filter(Boolean).join(' · ')}
                </p>
                {txn.note ? (
                  <p className="text-sm text-gray-500 italic">{txn.note}</p>
                ) : null}
              </div>
              <button
                onClick={() => setPendingDeleteId(txn.id)}
                className="text-gray-300 hover:text-red-400 text-2xl leading-none transition-colors pl-4 pt-0.5"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Transaction */}
      <div className="fixed bottom-6 right-4 left-4">
        <button
          onClick={() => navigate('/add-transaction', { state: { categoryId: id } })}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-4 rounded-2xl shadow-lg transition-colors text-base"
        >
          + Add Transaction
        </button>
      </div>

      {/* Delete confirmation */}
      {pendingDeleteId && (
        <ConfirmModal
          message="Delete this transaction?"
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setPendingDeleteId(null)}
        />
      )}

    </div>
  )
}
