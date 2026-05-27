import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import DisplayNameSetup from './pages/DisplayNameSetup'
import Dashboard from './pages/Dashboard'
import Setup from './pages/Setup'
import AddTransaction from './pages/AddTransaction'
import CategoryDetail from './pages/CategoryDetail'

// Requires logged in + display name set
function PrivateRoute({ children }) {
  const { user, displayName } = useAuth()
  if (user === undefined) return null // still loading
  if (!user) return <Navigate to="/login" replace />
  if (!displayName) return <Navigate to="/setup-name" replace />
  return children
}

// Requires logged in only (for the display name setup screen itself)
function AuthRoute({ children }) {
  const { user } = useAuth()
  if (user === undefined) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/setup-name"
          element={<AuthRoute><DisplayNameSetup /></AuthRoute>}
        />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <Routes>
                <Route path="/"                  element={<Dashboard />} />
                <Route path="/setup"             element={<Setup />} />
                <Route path="/add-transaction"   element={<AddTransaction />} />
                <Route path="/category/:id"      element={<CategoryDetail />} />
              </Routes>
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
