import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(undefined) // undefined = still loading
  const [displayName, setDisplayName] = useState(undefined)

  useEffect(() => {
    return onAuthStateChanged(auth, firebaseUser => {
      setUser(firebaseUser)
      setDisplayName(firebaseUser?.displayName ?? null)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, displayName, setDisplayName }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
