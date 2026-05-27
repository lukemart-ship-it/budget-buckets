import { useNavigate } from 'react-router-dom'

function getBarColor(spent, budgeted) {
  const percentSpent = spent / budgeted
  if (percentSpent >= 1) return 'bg-red-500'
  if (percentSpent >= 0.75) return 'bg-red-500'
  if (percentSpent >= 0.5) return 'bg-amber-400'
  return 'bg-blue-500'
}

export default function CategoryCard({ category }) {
  const navigate = useNavigate()
  const { id, name, budgeted, spent } = category
  const remaining = budgeted - spent
  const isOverBudget = remaining < 0
  const barWidth = Math.min(100, (spent / budgeted) * 100)
  const barColor = getBarColor(spent, budgeted)

  return (
    <button
      onClick={() => navigate(`/category/${id}`)}
      className="w-full bg-white rounded-xl border border-slate-200 p-4 text-left shadow-sm active:bg-slate-50 transition-colors"
    >
      {/* Top row: name + remaining amount */}
      <div className="flex justify-between items-baseline mb-3">
        <span className="font-medium text-gray-900 text-base">{name}</span>
        <span className={`font-semibold text-base tabular-nums ${isOverBudget ? 'text-red-500' : 'text-gray-800'}`}>
          {isOverBudget ? '-' : ''}${Math.abs(remaining).toFixed(2)}
          <span className="text-gray-400 font-normal text-sm"> left</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* Bottom row: spent of budgeted */}
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-gray-400">
          ${spent.toFixed(2)} spent
        </span>
        <span className="text-xs text-gray-400">
          ${budgeted.toFixed(2)} budget
        </span>
      </div>
    </button>
  )
}
