import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  LogOut,
  Bell,
  Search,
  BookOpen,
  Menu,
  X,
  User,
  Send,
  MessageSquare,
  Clock,
  Award,
  ChevronRight,
  PlayCircle
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface UserData {
  id: string
  role: 'student' | 'teacher' | 'parent'
  identifier_code: string
  full_name?: string
  avatar_url?: string
}

interface Course {
  id: string
  title: string
  description: string
  image_url: string
  instructor: string
  progress?: number
  total_modules: number
  completed_modules?: number
}

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your learning assistant. How can I help you today?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [messageInput, setMessageInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login', { replace: true })
      }
    })

    void fetchUserData()
    void fetchCourses()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom of chat whenever messages change
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      // Fetch user data from the public users table
      const { data, error } = await supabase
        .from('users')
        .select('id, role, identifier_code, full_name, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) throw error
      
      setUserData(data as UserData)
    } catch (err) {
      console.error('Error fetching user data:', err)
      // If there's an error, sign out and redirect to login
      await handleLogout()
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    // This would normally fetch from an actual database
    // Mock course data for demonstration
    const mockCourses: Course[] = [
      {
        id: '1',
        title: 'Introduction to Web Development',
        description: 'Learn the basics of HTML, CSS, and JavaScript',
        image_url: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613',
        instructor: 'Jane Smith',
        progress: 85,
        total_modules: 12,
        completed_modules: 10
      },
      {
        id: '2',
        title: 'Advanced React Patterns',
        description: 'Master complex React concepts and patterns',
        image_url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2',
        instructor: 'John Doe',
        progress: 45,
        total_modules: 8,
        completed_modules: 3
      },
      {
        id: '3',
        title: 'UX/UI Design Fundamentals',
        description: 'Create beautiful and intuitive user interfaces',
        image_url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e',
        instructor: 'Sara Johnson',
        progress: 20,
        total_modules: 10,
        completed_modules: 2
      },
      {
        id: '4',
        title: 'Data Science with Python',
        description: 'Analyze and visualize data using Python',
        image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        instructor: 'Michael Chen',
        progress: 0,
        total_modules: 15,
        completed_modules: 0
      }
    ]
    
    setCourses(mockCourses)
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUserData(null)
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Error logging out:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen)
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!messageInput.trim()) return
    
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageInput,
      sender: 'user',
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setMessageInput('')
    
    // Simulate bot response
    setTimeout(() => {
      let botResponse = ""
      
      const lowercaseInput = messageInput.toLowerCase()
      
      if (lowercaseInput.includes('course') && lowercaseInput.includes('enroll')) {
        botResponse = "To enroll in a course, simply click on the course card and then press the 'Enroll Now' button on the course details page!"
      } else if (lowercaseInput.includes('progress')) {
        botResponse = "Your course progress can be found on each course card. The green progress bar shows how far you've come!"
      } else if (lowercaseInput.includes('assignment') || lowercaseInput.includes('homework')) {
        botResponse = "You can find all your assignments in the 'Assignments' section of each course. Click on a course and scroll down to see them."
      } else if (lowercaseInput.includes('profile') || lowercaseInput.includes('account')) {
        botResponse = "You can access your profile by clicking on your profile picture in the top right corner!"
      } else if (lowercaseInput.includes('help') || lowercaseInput.includes('support')) {
        botResponse = "For additional support, please visit our Help Center or contact support@elearningsystem.com"
      } else {
        botResponse = "I'm here to help with your e-learning journey! You can ask me about courses, assignments, your progress, or how to use different features of the platform."
      }
      
      const botMessage: ChatMessage = {
        id: Date.now().toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, botMessage])
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-sm text-emerald-900">Loading...</span>
        </div>
      </div>
    )
  }

  const displayName = userData?.full_name || 
    (userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'User')

  const Sidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'block lg:hidden' : 'hidden lg:block'} bg-white shadow-lg h-full`}>
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 border-b">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">ELearn Pro</span>
          {isMobile && (
            <button
              onClick={toggleMobileMenu}
              className="absolute right-4 p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          )}
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center px-4 py-2.5 text-gray-700 bg-emerald-50 rounded-xl">
            <LayoutDashboard className="w-5 h-5" />
            <span className="ml-3">Dashboard</span>
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors duration-200">
            <BookOpen className="w-5 h-5" />
            <span className="ml-3">My Courses</span>
          </a>
          {userData?.role === 'teacher' && (
            <a href="#" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors duration-200">
              <Users className="w-5 h-5" />
              <span className="ml-3">Students</span>
            </a>
          )}
          <a href="#" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors duration-200">
            <Calendar className="w-5 h-5" />
            <span className="ml-3">Schedule</span>
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors duration-200">
            <Award className="w-5 h-5" />
            <span className="ml-3">Certificates</span>
          </a>
          <a href="#" className="flex items-center px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors duration-200">
            <Settings className="w-5 h-5" />
            <span className="ml-3">Settings</span>
          </a>
        </nav>

        <div className="p-4 border-t">
          <div className="mb-4 px-4 py-2">
            <p className="text-sm font-medium text-gray-900">
              {displayName}
            </p>
            <p className="text-xs text-gray-500">
              ID: {userData?.identifier_code}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-gray-600 bg-opacity-50" onClick={toggleMobileMenu}></div>
          <div className="absolute inset-y-0 left-0 w-64">
            <Sidebar isMobile={true} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-lg text-gray-600 lg:hidden hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="relative ml-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-shadow duration-200 hover:shadow-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors duration-200">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 block w-2 h-2 bg-red-400 rounded-full"></span>
              </button>
              <div className="flex items-center">
                <span className="mr-2 text-sm font-medium text-gray-900">
                  {displayName}
                </span>
                <Link
                  to="/profile"
                  className="block relative w-8 h-8 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white hover:ring-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                  aria-label="Go to profile settings"
                >
                  {userData?.avatar_url ? (
                    <img
                      src={userData.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-xl p-6 mb-8 text-white shadow-lg">
            <h1 className="text-2xl font-bold mb-2">Welcome back, {displayName}!</h1>
            <p className="opacity-90 mb-4">Continue your learning journey today.</p>
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              <p className="opacity-80 text-sm">Last login: Today at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          {/* Conditional Rendering for Courses */}
          {courses.length === 0 ? (
            <div className="text-center mt-8">
              <h2 className="text-xl font-semibold text-gray-900">Welcome to ELearn Pro!</h2>
              <p className="text-gray-600 mt-2">It looks like you haven't enrolled in any courses yet. Explore our catalog and start learning today!</p>
              <Link
                to="/courses"
                className="mt-4 inline-block bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <>
              {/* Progress Overview */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">My Learning Progress</h2>
                  <Link to="/courses" className="text-emerald-600 text-sm font-medium hover:underline flex items-center">
                    View all courses <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {courses.map(course => (
                    <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                      <img
                        src={`${course.image_url}?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&h=400&q=80`}
                        alt={course.title}
                        className="h-36 w-full object-cover"
                      />
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{course.title}</h3>
                        <p className="text-gray-500 text-sm mt-1 mb-3 line-clamp-2">{course.description}</p>
                        <div className="mt-auto">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-500">{course.completed_modules} of {course.total_modules} modules</span>
                            <span className="font-medium text-emerald-600">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${course.progress}%` }}></div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-xs text-gray-500">Instructor: {course.instructor}</span>
                          <button className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                            <PlayCircle className="w-4 h-4 mr-1" /> Continue
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Chatbot */}
      <div className={`fixed bottom-4 right-4 flex flex-col max-w-xs w-full sm:max-w-sm transform transition-transform duration-300 z-40 ${isChatOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'}`}>
        <div 
          onClick={toggleChat}
          className="bg-emerald-600 text-white p-4 rounded-t-xl flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            <h3 className="font-medium">Learning Assistant</h3>
          </div>
          <div className={`transform transition-transform duration-300 ${isChatOpen ? 'rotate-180' : ''}`}>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-white rounded-b-xl shadow-lg overflow-hidden flex flex-col h-96">
          <div className="flex-1 p-4 overflow-y-auto">
            {chatMessages.map(message => (
              <div 
                key={message.id} 
                className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] p-3 rounded-xl ${
                    message.sender === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="border-t p-3 flex">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your question here..."
              className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-600"
            />
            <button 
              type="submit"
              className="bg-emerald-600 text-white p-2 rounded-r-lg hover:bg-emerald-700 transition-colors duration-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
