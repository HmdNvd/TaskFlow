import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { User } from '@/types'
import { fetchCurrentUser, loginRequest } from '@/services/auth'
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  subscribeUnauthorized,
} from '@/services/session'

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const clearSession = useCallback(() => {
    clearStoredToken()
    setToken(null)
    setUser(null)
  }, [])

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = getStoredToken()
      if (!storedToken) {
        setToken(null)
        setUser(null)
        setIsLoading(false)
        return
      }

      setToken(storedToken)
      try {
        const currentUser = await fetchCurrentUser()
        setUser(currentUser)
      } catch {
        clearSession()
      } finally {
        setIsLoading(false)
      }
    }

    void restoreSession()
  }, [clearSession])

  useEffect(() => {
    return subscribeUnauthorized(() => {
      setToken(null)
      setUser(null)
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true, state: { from: location } })
      }
    })
  }, [location, navigate])

  const login = async (email: string, password: string) => {
    const result = await loginRequest(email, password)
    setStoredToken(result.token)
    setToken(result.token)
    if (result.user) {
      setUser(result.user)
    }

    try {
      const currentUser = await fetchCurrentUser()
      setUser(currentUser)
    } catch (error) {
      clearSession()
      throw error
    }
  }

  const logout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    isAdmin: user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
