import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError('')
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      if (data?.user) {
        // Check if user has verified their email
        if (!data.user.email_confirmed_at) {
          navigate('/verify', { 
            state: { email },
            replace: true 
          })
          return
        }
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 flex items-center justify-center px-3 py-4 sm:p-6">
      <div className="bg-white/80 backdrop-blur-lg rounded-lg sm:rounded-2xl shadow-xl w-full max-w-[340px] sm:max-w-md p-3 sm:p-6">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-emerald-600/10 rounded-full mb-2 sm:mb-3">
            <LogIn className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Please sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 sm:w-5 h-4 sm:h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-7 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg"
                placeholder="Enter your email"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 sm:w-5 h-4 sm:h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-7 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 border-gray-300 rounded"
                disabled={loading}
              />
              <label className="ml-2 text-[10px] sm:text-xs text-gray-700">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-[10px] sm:text-xs font-medium text-emerald-600 hover:text-emerald-500">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-1.5 sm:py-2 px-4 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-md sm:rounded-lg transition-colors duration-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>

          <p className="text-center text-[10px] sm:text-xs text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-emerald-600 hover:text-emerald-500">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}