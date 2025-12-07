"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { authApi } from './api'

interface User {
  id: number
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'silea_token'
const USER_KEY = 'silea_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth state from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      const savedUser = localStorage.getItem(USER_KEY)
      
      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error('Failed to load auth state:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authApi.login(email, password)
      
      if (response.success && response.token && response.user) {
        setToken(response.token)
        setUser(response.user)
        localStorage.setItem(TOKEN_KEY, response.token)
        localStorage.setItem(USER_KEY, JSON.stringify(response.user))
        return { success: true, message: response.message }
      }
      
      return { success: false, message: response.message || 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: error instanceof Error ? error.message : 'Login failed' }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

