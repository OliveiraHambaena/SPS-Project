import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError('')
      setLoading(true)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 flex items-center justify-center px-3 py-4 sm:p-6">
      <div className="bg-white/80 backdrop-blur-lg rounded-lg sm:rounded-2xl shadow-xl w-full max-w-[340px] sm:max-w-md p-3 sm:p-6">
        <Link
          to="/login"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </Link>

        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-emerald-600/10 rounded-full mb-2 sm:mb-3">
            <KeyRound className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600" />
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Reset your password</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full mb-4">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Check your email
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              We sent a password reset link to<br />
              <span className="font-medium text-gray-900">{email}</span>
            </p>
            <Link
              to="/login"
              className="inline-flex justify-center items-center w-full py-2 px-4 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors duration-200"
            >
              Return to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2 px-4 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 rounded-lg transition-colors duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send reset link</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
