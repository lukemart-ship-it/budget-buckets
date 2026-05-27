import { useState, useEffect } from 'react'
import {
  subscribeToLatestMonth,
  subscribeToCategories,
  subscribeToTransactions,
} from '../lib/firestore'

export function useCurrentMonth() {
  const [month, setMonth] = useState(undefined)       // undefined = still loading
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    let unsubCats = null
    let unsubTxns = null

    const unsubMonth = subscribeToLatestMonth(m => {
      setMonth(m)

      unsubCats?.()
      unsubTxns?.()

      if (!m) return

      unsubCats = subscribeToCategories(m.id, cats => setCategories(cats))
      unsubTxns = subscribeToTransactions(m.id, txns => setTransactions(txns))
    })

    return () => {
      unsubMonth()
      unsubCats?.()
      unsubTxns?.()
    }
  }, [])

  const categoriesWithSpent = categories.map(cat => ({
    ...cat,
    spent: transactions
      .filter(t => t.categoryId === cat.id)
      .reduce((sum, t) => sum + t.amount, 0),
  }))

  return {
    month,
    categories: categoriesWithSpent,
    transactions,
    loading: month === undefined,
  }
}
