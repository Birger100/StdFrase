import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthUser {
  isAuthenticated: boolean
  userName: string | null
  isAuthorized: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  checkAccess: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
  apiUrl: string
}

export const AuthProvider = ({ children, apiUrl }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkAuth = async () => {
    try {
      console.log('Checking authentication status...' + apiUrl)

      const response = await fetch(`${apiUrl}/auth/user`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to authenticate')
      }

      const data = await response.json()
      console.log('Authenticated user:', data)
      setUser(data)
      setError(null)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
      setError(errorMessage)
      setUser({ isAuthenticated: false, userName: null, isAuthorized: false })
      throw err
    } finally {
      setLoading(false)
    }
  }

  const checkAccess = async () => {
    try {
      const response = await fetch(`${apiUrl}/auth/check`, {
        credentials: 'include',
      })

      if (response.status === 403) {
        // User is authenticated but not authorized
        return false
      }

      if (!response.ok) {
        throw new Error('Failed to check access')
      }

      return true
    } catch (err) {
      console.error('Access check failed:', err)
      return false
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, checkAccess }}>
      {children}
    </AuthContext.Provider>
  )
}
