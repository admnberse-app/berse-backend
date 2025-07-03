/**
 * Example React component demonstrating API integration
 * This shows how to use the authentication service in a real component
 */

import React, { useState } from 'react'
import { authService } from '../services/index'

interface LoginFormData {
  email: string
  password: string
}

export function LoginComponent() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await authService.login(formData)
      
      if (response.success && response.data) {
        // Login successful
        console.log('Logged in:', response.data.user)
        // Redirect to dashboard or home page
        window.location.href = '/dashboard'
      } else {
        // Login failed
        setError(response.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h2>Login to BerseMuka</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <p>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  )
}