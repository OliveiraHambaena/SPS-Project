import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import OTPVerification from './pages/OTPVerification'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import Courses from './pages/Courses'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      
      // Comment out the email confirmation check for development
      /*if (session?.user && !session.user.email_confirmed_at) {
        await supabase.auth.signOut()
        setSession(null)
      }*/
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-sm text-emerald-900">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            !session ? (
              <Login />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/signup" 
          element={
            !session ? (
              <Signup />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/verify" 
          element={
            !session ? (
              <OTPVerification />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/forgot-password" 
          element={
            !session ? (
              <ForgotPassword />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/reset-password" 
          element={
            <ResetPassword />
          } 
        />
        <Route 
          path="/profile" 
          element={
            session ? (
              <Profile />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            session ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/courses" 
          element={
            session ? (
              <Courses />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={
            <Navigate 
              to={session ? "/dashboard" : "/login"} 
              replace 
            />
          } 
        />
      </Routes>
    </Router>
  )
}

export default App
