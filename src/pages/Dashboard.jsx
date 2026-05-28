import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/firebase'
import CategoryCard from '../components/CategoryCard'
import ConfirmModal from '../components/ConfirmModal'
import { useCurrentMonth } from '../hooks/useCurrentMonth'
import { deleteMonthWithAll } from '../lib/firestore'

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { month, categories, loading } = useCurrentMonth()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login')
  }

  async function handleDeleteMonth() {
    await deleteMonthWithAll(month.id)
    setShowDeleteConfirm(false)
  }

  const totalBudgeted  = categories.reduce((sum, c) => sum + c.budgeted, 0)
  const totalSpent     = categories.reduce((sum, c) => sum + c.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent

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
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Budget Buckets</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-gray-500">{month?.name ?? 'No month set up'}</p>
              {month && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                  aria-label="Delete month"
                >
                  <TrashIcon />
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors pt-1"
          >
            Sign out
          </button>
        </div>

        {month && (
          <div className="mt-4 bg-slate-50 rounded-xl px-4 py-3 flex justify-between">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Budgeted</p>
              <p className="font-semibold text-gray-800">${totalBudgeted.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Spent</p>
              <p className="font-semibold text-gray-800">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-0.5">Remaining</p>
              <p className={`font-semibold ${totalRemaining < 0 ? 'text-red-500' : 'text-indigo-600'}`}>
                ${totalRemaining.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {!month ? (
        <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
          <p className="text-gray-500 mb-6">
            No budget set up yet.<br />Create your first month to get started.
          </p>
          <button
            onClick={() => navigate('/setup')}
            className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow"
          >
            Set Up This Month
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-8 py-24 text-center">
          <p className="text-gray-500 mb-6">
            No categories yet.<br />Add some to start tracking.
          </p>
          <button
            onClick={() => navigate('/setup')}
            className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl shadow"
          >
            Add Categories
          </button>
        </div>
      ) : (
        <div className="px-4 py-4 space-y-3 pb-28">
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      )}

      {/* Floating Add Transaction button */}
      {month && (
        <div className="fixed bottom-6 right-4 left-4">
          <button
            onClick={() => navigate('/add-transaction')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-4 rounded-2xl shadow-lg transition-colors text-base"
          >
            + Add Transaction
          </button>
        </div>
      )}

      {/* Delete month confirmation */}
      {showDeleteConfirm && (
        <ConfirmModal
          message={`Delete ${month.name}? This will permanently remove all ${categories.length} categories and their transactions.`}
          confirmLabel="Delete Month"
          onConfirm={handleDeleteMonth}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

    </div>
  )
}
