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
        
        if (token) {
          apiClient.setToken(token)
          
          // Try to get fresh user data from server
          try {
            const response = await authAPI.getMe()
            if (response.success) {
              setUser(response.data)
              setLoggedIn(true)
              localStorage.setItem('user', JSON.stringify(response.data))
            }
          } catch (error) {
            // If server request fails but we have stored user data, use it
            if (storedUser) {
              try {
                const userData = JSON.parse(storedUser)
                setUser(userData)
                setLoggedIn(true)
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
      const response = await authAPI.login({ email, password })
      if (response.success) {
        const { user, token } = response.data
        // Save token to localStorage FIRST
        localStorage.setItem('token', token)
        // Then set token in API client
        apiClient.setToken(token)
        
        // Fetch fresh user data from server to get ALL profile fields
        let finalUser = user;
        try {
          const freshUserResponse = await authAPI.getMe()
          if (freshUserResponse.success) {
            finalUser = freshUserResponse.data
            setUser(freshUserResponse.data)
            localStorage.setItem('user', JSON.stringify(freshUserResponse.data))
            setLoggedIn(true)
          }
        } catch (fetchError) {
          // If fetching fresh data fails, use login data
          setUser(user)
          localStorage.setItem('user', JSON.stringify(user))
          setLoggedIn(true)
        }
        
        return { success: true, user: finalUser }
      }
      return { success: false, message: 'Login failed' }
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' }
    }
  }

  const register = async (name, email, password) => {
    try {
      // Public registration always creates candidates
      const response = await authAPI.register({ 
        name, 
        email, 
        password
      })
      if (response.success) {
        const { user, token } = response.data
        // Save token to localStorage FIRST
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        // Then set token in API client
        apiClient.setToken(token)
        // Update state
        setUser(user)
        setLoggedIn(true)
        return { success: true, user }
      }
      return { success: false, message: response.message || 'Registration failed' }
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' }
    }
  }

  // Google OAuth login
  const loginWithGoogle = async (googleData) => {
    try {
      const response = await authAPI.googleAuth(googleData)
      if (response.success) {
        const { user, token } = response.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        apiClient.setToken(token)
        setUser(user)
        setLoggedIn(true)
        return { success: true, user }
      }
      return { success: false, message: response.message || 'Google login failed' }
    } catch (error) {
      return { success: false, message: error.message || 'Google login failed' }
    }
  }

  // Phone OTP - Request
  const requestPhoneOTP = async (phoneNumber) => {
    try {
      const response = await authAPI.requestPhoneOTP(phoneNumber)
      return response
    } catch (error) {
      return { success: false, message: error.message || 'Failed to send OTP' }
    }
  }

  // Phone OTP - Verify
  const verifyPhoneOTP = async (phoneNumber, otp, name) => {
    try {
      const response = await authAPI.verifyPhoneOTP({ phoneNumber, otp, name })
      if (response.success) {
        const { user, token } = response.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        apiClient.setToken(token)
        setUser(user)
        setLoggedIn(true)
        return { success: true, user, needsProfileUpdate: response.data.needsProfileUpdate }
      }
      return { success: false, message: response.message || 'OTP verification failed' }
    } catch (error) {
      return { success: false, message: error.message || 'OTP verification failed' }
    }
  }

  // Admin login (email/password only)
  const adminLogin = async (email, password) => {
    try {
      const response = await authAPI.adminLogin({ email, password })
      if (response.success) {
        const { user, token } = response.data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        apiClient.setToken(token)
        setUser(user)
        setLoggedIn(true)
        return { success: true, user }
      }
      return { success: false, message: response.message || 'Admin login failed' }
    } catch (error) {
      return { success: false, message: error.message || 'Admin login failed' }
    }
  }

  // Helper to check if user is staff (non-candidate)
  const isStaff = () => {
    return user && ['recruiter', 'hiring_manager', 'hr', 'admin'].includes(user.role)
  }

  // Helper to check specific role
  const hasRole = (...roles) => {
    return user && roles.includes(user.role)
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
      const response = await usersAPI.updateProfile(updates)
      
      if (response.success) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  const value = useMemo(
    () => ({ 
      user, 
      loggedIn, 
      loading, 
      login, 
      register, 
      logout, 
      updateUser, 
      isStaff, 
      hasRole,
      // Social auth methods
      loginWithGoogle,
      requestPhoneOTP,
      verifyPhoneOTP,
      adminLogin
    }),
    [user, loggedIn, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
