import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User, GraduationCap, BookOpen, Users, Award, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate password length
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
      }

      // Validate name length (as per DB constraint)
      if (name.length < 3) {
        throw new Error('Name must be at least 3 characters long')
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('No user data returned after signup')
      }

      // Create user profile - let the trigger handle identifier_code
      const profilePayload: any = {
        id: authData.user.id,
        name,
        role
      }
      if (role === 'student') {
        profilePayload.subject = subject
        profilePayload.grade = grade
      }
      const { error: profileError } = await supabase
        .from('users')
        .insert(profilePayload)

      if (profileError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.signOut()
        throw new Error(profileError.message)
      }

      // Redirect to OTP verification with email
      navigate('/verify', { 
        state: { email },
        replace: true
      })
    } catch (err) {
      console.error('Signup error:', err)
      if (err instanceof Error) {
        if (err.message.includes('duplicate key')) {
          setError('An account with this email already exists')
        } else {
          setError(err.message)
        }
      } else {
        setError('An error occurred during signup')
      }
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (roleType: string) => {
    switch (roleType) {
      case 'student':
        return <GraduationCap className="w-4 h-4" />
      case 'teacher':
        return <BookOpen className="w-4 h-4" />
      case 'parent':
        return <Users className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 flex items-center justify-center px-3 py-4 sm:p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-lg sm:rounded-2xl shadow-xl w-full max-w-[340px] sm:max-w-md p-3 sm:p-6">
          <div className="text-center mb-3 sm:mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-emerald-600/10 rounded-full mb-2 sm:mb-3">
              <UserPlus className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Create account</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Sign up to get started</p>
          </div>

          {error && (
            <div className="mb-3 p-2 text-xs sm:text-sm text-red-600 bg-red-50 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-2 sm:space-y-3">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 sm:w-5 h-4 sm:h-5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-7 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>

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
                  />
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
                  Role
                </label>
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {['student', 'teacher', 'parent'].map((roleType) => (
                    <button
                      key={roleType}
                      type="button"
                      onClick={() => setRole(roleType)}
                      className={`flex flex-col items-center justify-center py-1 sm:py-1.5 px-0.5 sm:px-2 border ${
                        role === roleType
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                          : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50'
                      } rounded transition-all duration-200`}
                    >
                      {getRoleIcon(roleType)}
                      <span className={`text-[10px] sm:text-xs font-medium capitalize mt-0.5 ${
                        role === roleType ? 'text-emerald-600' : 'text-gray-600'
                      }`}>
                        {roleType}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Show subject and score fields only for student role */}
              {role === 'student' && (
  <>
    <div>
      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
        Subject
      </label>
      <div className="relative group">
        <BookOpen className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 sm:w-5 h-4 sm:h-5 pointer-events-none" />
        <ChevronDown className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 sm:w-5 h-4 sm:h-5 pointer-events-none transition-colors group-focus-within:text-emerald-600 group-hover:text-emerald-600" />
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="block w-full pl-8 sm:pl-11 pr-8 sm:pr-11 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 shadow-sm bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-150 hover:border-emerald-400 cursor-pointer"
          required
        >
          <option value="" disabled>Select your subject</option>
          <optgroup label="Grade 4">
            <option value="Mathematics (G4)">Mathematics</option>
            <option value="Science (G4)">Science</option>
            <option value="English (G4)">English</option>
            <option value="Social Studies (G4)">Social Studies</option>
            <option value="ICT (G4)">ICT</option>
            <option value="Art (G4)">Art</option>
            <option value="Music (G4)">Music</option>
          </optgroup>
          <optgroup label="Grade 5">
            <option value="Mathematics (G5)">Mathematics</option>
            <option value="Science (G5)">Science</option>
            <option value="English (G5)">English</option>
            <option value="Social Studies (G5)">Social Studies</option>
            <option value="ICT (G5)">ICT</option>
            <option value="Art (G5)">Art</option>
            <option value="Music (G5)">Music</option>
          </optgroup>
          <optgroup label="Grade 6">
            <option value="Mathematics (G6)">Mathematics</option>
            <option value="Science (G6)">Science</option>
            <option value="English (G6)">English</option>
            <option value="Social Studies (G6)">Social Studies</option>
            <option value="ICT (G6)">ICT</option>
            <option value="Art (G6)">Art</option>
            <option value="Music (G6)">Music</option>
          </optgroup>
          <optgroup label="Grade 7">
            <option value="Mathematics (G7)">Mathematics</option>
            <option value="Science (G7)">Science</option>
            <option value="English (G7)">English</option>
            <option value="Social Studies (G7)">Social Studies</option>
            <option value="ICT (G7)">ICT</option>
            <option value="Art (G7)">Art</option>
            <option value="Music (G7)">Music</option>
          </optgroup>
          <optgroup label="Grade 8">
            <option value="Mathematics (G8)">Mathematics</option>
            <option value="Science (G8)">Science</option>
            <option value="English (G8)">English</option>
            <option value="Social Studies (G8)">Social Studies</option>
            <option value="ICT (G8)">ICT</option>
            <option value="Art (G8)">Art</option>
            <option value="Music (G8)">Music</option>
          </optgroup>
          <optgroup label="Grade 9">
            <option value="Mathematics (G9)">Mathematics</option>
            <option value="Biology (G9)">Biology</option>
            <option value="Chemistry (G9)">Chemistry</option>
            <option value="Physics (G9)">Physics</option>
            <option value="English (G9)">English</option>
            <option value="History (G9)">History</option>
            <option value="Geography (G9)">Geography</option>
            <option value="ICT (G9)">ICT</option>
            <option value="Art (G9)">Art</option>
            <option value="Music (G9)">Music</option>
          </optgroup>
          <optgroup label="Grade 10">
            <option value="Mathematics (G10)">Mathematics</option>
            <option value="Biology (G10)">Biology</option>
            <option value="Chemistry (G10)">Chemistry</option>
            <option value="Physics (G10)">Physics</option>
            <option value="English (G10)">English</option>
            <option value="History (G10)">History</option>
            <option value="Geography (G10)">Geography</option>
            <option value="ICT (G10)">ICT</option>
            <option value="Art (G10)">Art</option>
            <option value="Music (G10)">Music</option>
          </optgroup>
          <optgroup label="Grade 11">
            <option value="Mathematics (G11)">Mathematics</option>
            <option value="Biology (G11)">Biology</option>
            <option value="Chemistry (G11)">Chemistry</option>
            <option value="Physics (G11)">Physics</option>
            <option value="English (G11)">English</option>
            <option value="History (G11)">History</option>
            <option value="Geography (G11)">Geography</option>
            <option value="ICT (G11)">ICT</option>
            <option value="Art (G11)">Art</option>
            <option value="Music (G11)">Music</option>
          </optgroup>
          <optgroup label="Grade 12">
            <option value="Mathematics (G12)">Mathematics</option>
            <option value="Biology (G12)">Biology</option>
            <option value="Chemistry (G12)">Chemistry</option>
            <option value="Physics (G12)">Physics</option>
            <option value="English (G12)">English</option>
            <option value="History (G12)">History</option>
            <option value="Geography (G12)">Geography</option>
            <option value="ICT (G12)">ICT</option>
            <option value="Art (G12)">Art</option>
            <option value="Music (G12)">Music</option>
          </optgroup>
        </select>
      </div>
    </div>
    <div>
      <label className="text-xs sm:text-sm font-medium text-gray-700 mb-1 block">
        Grade
      </label>
      <div className="relative">
        <Award className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 sm:w-5 h-4 sm:h-5" />
        <input
          type="text"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="block w-full pl-7 sm:pl-10 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md sm:rounded-lg"
          placeholder="Enter your grade"
          required
        />
      </div>
    </div>
  </>
)}

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
                    placeholder="Create a password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-start pt-1">
              <input
                type="checkbox"
                required
                className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 rounded border-gray-300"
              />
              <label className="ml-2 text-[10px] sm:text-xs text-gray-700">
                I agree to the{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-500">Terms</a>{' '}
                and{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-500">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-1.5 sm:py-2 px-4 text-xs sm:text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 rounded-md sm:rounded-lg transition-colors duration-200"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-center text-[10px] sm:text-xs text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}