import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Mail, ExternalLink, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function OTPVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email
  const [loading, setLoading] = React.useState(false)
  const [resending, setResending] = React.useState(false)
  const [resendSuccess, setResendSuccess] = React.useState(false)

  const handleOpenEmail = () => {
    setLoading(true)
    // Common email providers
    const emailDomain = email.split('@')[1]?.toLowerCase()
    let emailUrl = ''
    
    if (emailDomain?.includes('gmail')) {
      emailUrl = 'https://mail.google.com'
    } else if (emailDomain?.includes('outlook') || emailDomain?.includes('hotmail')) {
      emailUrl = 'https://outlook.live.com'
    } else if (emailDomain?.includes('yahoo')) {
      emailUrl = 'https://mail.yahoo.com'
    }

    if (emailUrl) {
      window.open(emailUrl, '_blank')
    }
    
    setLoading(false)
  }

  const handleResendEmail = async () => {
    try {
      setResending(true)
      setResendSuccess(false)
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) throw error
      setResendSuccess(true)

      // Reset success message after 5 seconds
      setTimeout(() => {
        setResendSuccess(false)
      }, 5000)
    } catch (err) {
      console.error('Failed to resend email:', err)
    } finally {
      setResending(false)
    }
  }

  if (!email) {
    navigate('/signup')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Check your inbox</h2>
          <p className="text-sm text-gray-600 mt-2">
            We sent a validation link to<br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Click the link in the email to verify your account and continue
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleOpenEmail}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 rounded-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <ExternalLink className="w-5 h-5" />
            )}
            <span>{loading ? 'Opening...' : 'Open Email App'}</span>
          </button>

          <button
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-emerald-700 bg-emerald-100 hover:bg-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-400 rounded-lg"
          >
            {resending ? (
              <div className="w-5 h-5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            <span>{resending ? 'Resending...' : 'Resend Email'}</span>
          </button>
        </div>

        {resendSuccess && (
          <div className="mt-4 p-3 text-sm text-emerald-700 bg-emerald-100 rounded-lg">
            Email sent successfully! Please check your inbox.
          </div>
        )}

        <p className="text-center text-xs text-gray-500 mt-4">
          Didn't receive the email? Check your spam folder
        </p>
      </div>
    </div>
  )
}
