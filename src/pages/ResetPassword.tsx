import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if we have a valid session with recovery flow
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        navigate('/login', { replace: true })
      }
    }
    checkSession()
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      setError('')
      setLoading(true)

      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      // Password updated successfully, redirect to login
      navigate('/login', { 
        replace: true,
        state: { message: 'Password updated successfully. Please log in with your new password.' }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 flex items-center justify-center px-3 py-4 sm:p-6">
      <div className="bg-white/80 backdrop-blur-lg rounded-lg sm:rounded-2xl shadow-xl w-full max-w-[340px] sm:max-w-md p-3 sm:p-6">
        <button
          onClick={() => navigate('/login')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </button>

        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-emerald-600/10 rounded-full mb-2 sm:mb-3">
            <KeyRound className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Set new password</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
              New password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pr-10 pl-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg"
                placeholder="Enter new password"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 sm:w-5 h-4 sm:h-5" />
                ) : (
                  <Eye className="w-4 sm:w-5 h-4 sm:h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
              Confirm new password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pr-10 pl-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg"
                placeholder="Confirm new password"
                required
                disabled={loading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 sm:w-5 h-4 sm:h-5" />
                ) : (
                  <Eye className="w-4 sm:w-5 h-4 sm:h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg transition-colors duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
