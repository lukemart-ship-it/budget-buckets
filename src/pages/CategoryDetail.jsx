import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useCurrentMonth } from '../hooks/useCurrentMonth'
import { deleteTransaction, deleteCategoryWithTransactions } from '../lib/firestore'
import ConfirmModal from '../components/ConfirmModal'

const SLICE_COLORS = ['#6366f1','#06b6d4','#10b981','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316']

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

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
}

function DonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  if (entry.isRemaining) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-sm">
        <p className="font-semibold text-gray-500">Remaining</p>
        <p className="text-gray-400">${entry.value.toFixed(2)}</p>
      </div>
    )
  }
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-gray-900">${entry.amount.toFixed(2)}</p>
      {entry.note && <p className="text-gray-500">{entry.note}</p>}
      {entry.date && <p className="text-gray-400">{entry.date}</p>}
      {entry.createdBy && <p className="text-gray-400">{entry.createdBy}</p>}
    </div>
  )
}

export default function CategoryDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { month, categories, transactions, loading } = useCurrentMonth()
  const [pendingDeleteTxnId, setPendingDeleteTxnId]   = useState(null)
  const [showDeleteCategory, setShowDeleteCategory]   = useState(false)

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

  const chartData = catTransactions.map(txn => ({
    id:        txn.id,
    amount:    txn.amount,
    note:      txn.note,
    date:      formatDate(txn.createdAt),
    createdBy: txn.createdBy,
    value:     txn.amount,
  }))
  if (remaining > 0) {
    chartData.push({ id: 'remaining', value: remaining, isRemaining: true })
  }

  async function handleDeleteTxn() {
    await deleteTransaction(month.id, pendingDeleteTxnId)
    setPendingDeleteTxnId(null)
  }

  async function handleDeleteCategory() {
    await deleteCategoryWithTransactions(month.id, id)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
          </div>
          <button
            onClick={() => setShowDeleteCategory(true)}
            className="text-gray-300 hover:text-red-400 transition-colors"
            aria-label="Delete category"
          >
            <TrashIcon />
          </button>
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

      {/* Donut chart */}
      {catTransactions.length > 0 && (
        <div className="mx-4 mt-4 bg-white rounded-xl border border-slate-200 shadow-sm py-4">
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={chartData.length > 1 ? 2 : 0}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.id}
                      fill={entry.isRemaining ? '#e2e8f0' : SLICE_COLORS[index % SLICE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<DonutTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">${spent.toFixed(2)}</p>
                <p className="text-xs text-gray-400">spent</p>
              </div>
            </div>
          </div>
          {/* Color legend */}
          <div className="px-4 mt-1 flex flex-wrap gap-x-4 gap-y-1 justify-center">
            {catTransactions.map((txn, index) => (
              <div key={txn.id} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] }}
                />
                <span className="text-xs text-gray-500">${txn.amount.toFixed(2)}</span>
              </div>
            ))}
            {remaining > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-slate-200" />
                <span className="text-xs text-gray-400">${remaining.toFixed(2)} left</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div className="px-4 py-4 space-y-2 pb-28">
        {catTransactions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">No transactions yet.</p>
        ) : (
          catTransactions.map((txn, index) => (
            <div
              key={txn.id}
              className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex justify-between items-start shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] }}
                />
                <div className="space-y-0.5">
                  <p className="font-semibold text-gray-900 tabular-nums">${txn.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">
                    {[txn.createdBy, formatDate(txn.createdAt)].filter(Boolean).join(' · ')}
                  </p>
                  {txn.note ? <p className="text-sm text-gray-500 italic">{txn.note}</p> : null}
                </div>
              </div>
              <button
                onClick={() => setPendingDeleteTxnId(txn.id)}
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

      {/* Delete transaction confirmation */}
      {pendingDeleteTxnId && (
        <ConfirmModal
          message="Delete this transaction?"
          confirmLabel="Delete"
          onConfirm={handleDeleteTxn}
          onCancel={() => setPendingDeleteTxnId(null)}
        />
      )}

      {/* Delete category confirmation */}
      {showDeleteCategory && (
        <ConfirmModal
          message={`Delete "${name}"? This will also delete ${catTransactions.length} ${catTransactions.length === 1 ? 'transaction' : 'transactions'}.`}
          confirmLabel="Delete Category"
          onConfirm={handleDeleteCategory}
          onCancel={() => setShowDeleteCategory(false)}
        />
      )}

    </div>
  )
}
