import { db } from './firebase'
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, orderBy, limit, serverTimestamp, onSnapshot,
} from 'firebase/firestore'

// --- Months ---

export function subscribeToLatestMonth(callback) {
  const q = query(collection(db, 'months'), orderBy('createdAt', 'desc'), limit(1))
  return onSnapshot(q, snapshot => {
    const month = snapshot.docs[0]
      ? { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
      : null
    callback(month)
  })
}

export function subscribeToMonths(callback) {
  const q = query(collection(db, 'months'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, snapshot => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function createMonth(name) {
  return addDoc(collection(db, 'months'), { name, createdAt: serverTimestamp() })
}

// --- Categories ---

export function subscribeToCategories(monthId, callback) {
  const q = query(
    collection(db, 'months', monthId, 'categories'),
    orderBy('order'),
  )
  return onSnapshot(q, snapshot => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function createCategory(monthId, { name, budgeted, order }) {
  return addDoc(collection(db, 'months', monthId, 'categories'), {
    name,
    budgeted,
    order,
    createdAt: serverTimestamp(),
  })
}

export async function updateCategory(monthId, categoryId, data) {
  return updateDoc(doc(db, 'months', monthId, 'categories', categoryId), data)
}

export async function deleteCategory(monthId, categoryId) {
  return deleteDoc(doc(db, 'months', monthId, 'categories', categoryId))
}

// --- Transactions ---

export function subscribeToTransactions(monthId, callback) {
  const q = query(
    collection(db, 'months', monthId, 'transactions'),
    orderBy('createdAt', 'desc'),
  )
  return onSnapshot(q, snapshot => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}

export async function addTransaction(monthId, { categoryId, amount, createdBy, note }) {
  return addDoc(collection(db, 'months', monthId, 'transactions'), {
    categoryId,
    amount,
    createdBy: createdBy ?? '',
    note: note ?? '',
    createdAt: serverTimestamp(),
  })
}

export async function deleteTransaction(monthId, transactionId) {
  return deleteDoc(doc(db, 'months', monthId, 'transactions', transactionId))
}
