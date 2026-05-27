import { signOut } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/firebase'
import CategoryCard from '../components/CategoryCard'

// Mock data — will be replaced with live Firestore data
const MOCK_MONTH = {
  name: 'May 2026',
  categories: [
    { id: '1', name: 'Groceries',           budgeted: 600,  spent: 245.50 },
    { id: '2', name: 'Gas',                 budgeted: 200,  spent: 178.00 },
    { id: '3', name: 'Dining Out',          budgeted: 150,  spent: 38.75  },
    { id: '4', name: "Birthday Gift - Mom", budgeted: 75,   spent: 82.50  },
    { id: '5', name: 'Entertainment',       budgeted: 100,  spent: 12.00  },
  ],
}

export default function Dashboard() {
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login')
  }

  const totalBudgeted = MOCK_MONTH.categories.reduce((sum, c) => sum + c.budgeted, 0)
  const totalSpent    = MOCK_MONTH.categories.reduce((sum, c) => sum + c.spent, 0)
  const totalRemaining = totalBudgeted - totalSpent

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-4 sticky top-0 z-10">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Budget Buckets</h1>
            <p className="text-sm text-gray-500">{MOCK_MONTH.name}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors pt-1"
          >
            Sign out
          </button>
        </div>

        {/* Month summary */}
        <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 flex justify-between">
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
      </div>

      {/* Category list */}
      <div className="px-4 py-4 space-y-3 pb-28">
        {MOCK_MONTH.categories.map(category => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      {/* Floating Add Transaction button */}
      <div className="fixed bottom-6 right-4 left-4">
        <button
          onClick={() => navigate('/add-transaction')}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold py-4 rounded-2xl shadow-lg transition-colors text-base"
        >
          + Add Transaction
        </button>
      </div>

    </div>
  )
}
