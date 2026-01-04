import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authAPI, apiClient, usersAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        
        console.log('AuthContext: Checking auth on mount...'); // Debug log
        console.log('AuthContext: Token found:', !!token); // Debug log
        console.log('AuthContext: Stored user found:', !!storedUser); // Debug log
        
        if (token) {
          apiClient.setToken(token)
          
          // Try to get fresh user data from server
          try {
            const response = await authAPI.getMe()
            if (response.success) {
              setUser(response.data)
              setLoggedIn(true)
              localStorage.setItem('user', JSON.stringify(response.data))
              console.log('AuthContext: User authenticated from server:', response.data); // Debug log
            }
          } catch (error) {
            // If server request fails but we have stored user data, use it
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser)
                setUser(userData)
                setLoggedIn(true)
                console.log('AuthContext: Using stored user data:', userData); // Debug log
              } catch (parseError) {
                console.error('AuthContext: Failed to parse stored user:', parseError)
                localStorage.removeItem('token')
                localStorage.removeItem('user')
              }
            } else {
              throw error
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    try {
      console.log('AuthContext: Calling login API...'); // Debug log
      const response = await authAPI.login({ email, password })
      console.log('AuthContext: Login response:', response); // Debug log
      if (response.success) {
        const { user, token } = response.data
        // Save token to localStorage FIRST
        localStorage.setItem('token', token)
        // Then set token in API client
        apiClient.setToken(token)
        
        // Fetch fresh user data from server to get ALL profile fields
        try {
          console.log('AuthContext: Fetching fresh user data after login...')
          const freshUserResponse = await authAPI.getMe()
          if (freshUserResponse.success) {
            console.log('AuthContext: Fresh user data received:', freshUserResponse.data)
            setUser(freshUserResponse.data)
            localStorage.setItem('user', JSON.stringify(freshUserResponse.data))
            setLoggedIn(true)
            console.log('AuthContext: Login successful with fresh data')
            return true
          }
        } catch (fetchError) {
          // If fetching fresh data fails, use login data
          console.warn('AuthContext: Failed to fetch fresh user data, using login data')
          setUser(user)
          localStorage.setItem('user', JSON.stringify(user))
          setLoggedIn(true)
        }
        
        console.log('AuthContext: Token saved:', token); // Debug log
        return true
      }
      console.warn('AuthContext: Login failed - response not successful'); // Debug log
      return false
    } catch (error) {
      console.error('AuthContext: Login failed with error:', error); // Debug log
      throw error // Re-throw to show error message
    }
  }

  const register = async (name, email, password, role = 'jobseeker', companyName = '') => {
    try {
      console.log('AuthContext: Calling register API with role:', role); // Debug log
      const response = await authAPI.register({ 
        name, 
        email, 
        password, 
        role,
        companyName 
      })
      console.log('AuthContext: Register response:', response); // Debug log
      if (response.success) {
        const { user, token, company } = response.data
        // Save token to localStorage FIRST
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        if (company) {
          localStorage.setItem('company', JSON.stringify(company))
        }
        // Then set token in API client
        apiClient.setToken(token)
        // Update state
        setUser(user)
        setLoggedIn(true)
        console.log('AuthContext: Registration successful, user set:', user); // Debug log
        console.log('AuthContext: Token saved:', token); // Debug log
        if (company) {
          console.log('AuthContext: Company created:', company); // Debug log
        }
        return true
      }
      console.warn('AuthContext: Registration failed - response not successful'); // Debug log
      return false
    } catch (error) {
      console.error('AuthContext: Registration failed with error:', error); // Debug log
      throw error // Re-throw to show error message
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      apiClient.setToken(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setLoggedIn(false)
    }
  }

  const updateUser = async (updates) => {
    try {
      console.log('🔄 AuthContext: updateUser called with:', updates)
      const response = await usersAPI.updateProfile(updates)
      console.log('📥 AuthContext: Backend response:', response)
      
      if (response.success) {
        console.log('✅ AuthContext: Updating user state with:', response.data)
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
        console.log('💾 AuthContext: User saved to localStorage')
        return true
      }
      console.warn('⚠️ AuthContext: Update failed - response not successful')
      return false
    } catch (error) {
      console.error('❌ AuthContext: Update profile failed:', error)
      return false
    }
  }

  const value = useMemo(
    () => ({ user, loggedIn, loading, login, register, logout, updateUser }),
    [user, loggedIn, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
