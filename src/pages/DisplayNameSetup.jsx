import { useState } from 'react'
import { updateProfile } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export default function DisplayNameSetup() {
  const navigate = useNavigate()
  const { setDisplayName } = useAuth()
  const [name, setName]     = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  async function handleContinue() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Enter your name.'); return }
    setSaving(true)
    try {
      await updateProfile(auth.currentUser, { displayName: trimmed })
      setDisplayName(trimmed) // update context so PrivateRoute sees it immediately
      navigate('/')
    } catch {
      setError('Something went wrong. Try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
          <p className="text-gray-500">What should we call you?</p>
        </div>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleContinue()}
          autoFocus
          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-gray-900 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <button
          onClick={handleContinue}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-4 rounded-2xl shadow-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
