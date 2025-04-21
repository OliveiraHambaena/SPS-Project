import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Search,
  Filter,
  ChevronDown,
  BookOpen,
  User,
  Star,
  Clock,
  ArrowLeft,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Loader,
  BookOpenCheck
} from 'lucide-react'
import { supabase } from '../lib/supabase'

interface UserData {
  id: string
  role: 'student' | 'teacher' | 'parent'
  identifier_code: string
  name?: string
}

interface Course {
  id: string
  title: string
  description: string
  image_url: string
  instructor: string
  rating?: number
  reviews_count?: number
  duration?: string
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'
  category?: string
  tags?: string[]
}

export default function Courses() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Categories for filter
  const categories = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Design',
    'Business',
    'Marketing',
    'IT & Software'
  ]

  // Levels for filter
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']

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

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      // Fetch user data from the users_view
      const { data, error } = await supabase
        .from('users_view')
        .select('id, role, identifier_code, name')
        .eq('id', user.id)
        .single()

      if (error) throw error
      
      setUserData(data as UserData)
    } catch (err) {
      console.error('Error fetching user data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    setCoursesLoading(true)
    try {
      // Try to fetch courses from Supabase
      const { data, error } = await supabase
        .from('courses')
        .select('*')
      
      if (error) {
        console.error('Error fetching courses:', error)
        throw error
      }
      
      if (data && data.length > 0) {
        setCourses(data as Course[])
      } else {
        // If no courses found in database, use mock data
        console.log('No courses found in database, using mock data')
        const mockCourses: Course[] = [
          {
            id: '1',
            title: 'Introduction to Web Development',
            description: 'Learn the basics of HTML, CSS, and JavaScript to build responsive websites from scratch.',
            image_url: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613',
            instructor: 'Jane Smith',
            rating: 4.8,
            reviews_count: 420,
            duration: '10 weeks',
            level: 'Beginner',
            category: 'Web Development',
            tags: ['HTML', 'CSS', 'JavaScript']
          },
          {
            id: '2',
            title: 'Advanced React Patterns',
            description: 'Master complex React concepts and patterns for building scalable and maintainable applications.',
            image_url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2',
            instructor: 'John Doe',
            rating: 4.9,
            reviews_count: 350,
            duration: '8 weeks',
            level: 'Advanced',
            category: 'Web Development',
            tags: ['React', 'JavaScript', 'Frontend']
          },
          {
            id: '3',
            title: 'UX/UI Design Fundamentals',
            description: 'Create beautiful and intuitive user interfaces with modern design principles and tools.',
            image_url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e',
            instructor: 'Sara Johnson',
            rating: 4.7,
            reviews_count: 280,
            duration: '6 weeks',
            level: 'Beginner',
            category: 'Design',
            tags: ['UX', 'UI', 'Figma']
          },
          {
            id: '4',
            title: 'Data Science with Python',
            description: 'Analyze and visualize data using Python, pandas, and matplotlib for data-driven insights.',
            image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
            instructor: 'Michael Chen',
            rating: 4.6,
            reviews_count: 310,
            duration: '12 weeks',
            level: 'Intermediate',
            category: 'Data Science',
            tags: ['Python', 'Data Analysis', 'Visualization']
          },
          {
            id: '5',
            title: 'Mobile App Development with Flutter',
            description: 'Build cross-platform mobile applications with Flutter and Dart programming language.',
            image_url: 'https://images.unsplash.com/photo-1617040619263-41c5a9ca7521',
            instructor: 'Alex Johnson',
            rating: 4.5,
            reviews_count: 230,
            duration: '10 weeks',
            level: 'Intermediate',
            category: 'Mobile Development',
            tags: ['Flutter', 'Dart', 'Mobile']
          },
          {
            id: '6',
            title: 'Digital Marketing Mastery',
            description: 'Learn effective digital marketing strategies to grow your business and reach more customers.',
            image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
            instructor: 'Emily Wilson',
            rating: 4.7,
            reviews_count: 290,
            duration: '8 weeks',
            level: 'All Levels',
            category: 'Marketing',
            tags: ['SEO', 'Social Media', 'Content Marketing']
          },
          {
            id: '7',
            title: 'Machine Learning Fundamentals',
            description: 'Understand the core concepts of machine learning and implement algorithms from scratch.',
            image_url: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb',
            instructor: 'David Brown',
            rating: 4.9,
            reviews_count: 410,
            duration: '14 weeks',
            level: 'Advanced',
            category: 'Data Science',
            tags: ['Machine Learning', 'AI', 'Python']
          },
          {
            id: '8',
            title: 'Business Strategy and Management',
            description: 'Develop strategic thinking and management skills to lead organizations effectively.',
            image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf',
            instructor: 'Robert Miller',
            rating: 4.6,
            reviews_count: 260,
            duration: '10 weeks',
            level: 'Intermediate',
            category: 'Business',
            tags: ['Strategy', 'Management', 'Leadership']
          }
        ]
        
        setCourses(mockCourses)
      }
    } catch (err) {
      console.error('Error in fetchCourses:', err)
      // Fallback to mock data in case of error
      const mockCourses: Course[] = [
        // Same mock data as above
        {
          id: '1',
          title: 'Introduction to Web Development',
          description: 'Learn the basics of HTML, CSS, and JavaScript to build responsive websites from scratch.',
          image_url: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613',
          instructor: 'Jane Smith',
          rating: 4.8,
          reviews_count: 420,
          duration: '10 weeks',
          level: 'Beginner',
          category: 'Web Development',
          tags: ['HTML', 'CSS', 'JavaScript']
        },
        {
          id: '2',
          title: 'Advanced React Patterns',
          description: 'Master complex React concepts and patterns for building scalable and maintainable applications.',
          image_url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2',
          instructor: 'John Doe',
          rating: 4.9,
          reviews_count: 350,
          duration: '8 weeks',
          level: 'Advanced',
          category: 'Web Development',
          tags: ['React', 'JavaScript', 'Frontend']
        }
      ]
      setCourses(mockCourses)
    } finally {
      setCoursesLoading(false)
    }
  }  // Filter and sort courses based on user selections
  const filteredCourses = courses
    .filter(course => {
      // Search filter
      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !course.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Category filter
      if (selectedCategory && course.category !== selectedCategory) {
        return false
      }
      
      // Level filter
      if (selectedLevel && course.level !== selectedLevel) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      // Sort by title
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title)
      } else {
        return b.title.localeCompare(a.title)
      }
    })

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center">
              <Link to="/dashboard" className="p-2 rounded-lg text-gray-600 hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">All Courses</h1>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-shadow duration-200 hover:shadow-sm"
                />
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {selectedCategory && (
              <div className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                <span>{selectedCategory}</span>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="ml-2 hover:text-emerald-900"
                >
                  &times;
                </button>
              </div>
            )}
            
            {selectedLevel && (
              <div className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                <span>{selectedLevel}</span>
                <button 
                  onClick={() => setSelectedLevel(null)}
                  className="ml-2 hover:text-emerald-900"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? (
              <>
                <SortAsc className="w-4 h-4 mr-2" />
                <span>A-Z</span>
              </>
            ) : (
              <>
                <SortDesc className="w-4 h-4 mr-2" />
                <span>Z-A</span>
              </>
            )}
          </button>
        </div>
        
        {/* Filter panels */}
        {isFilterOpen && (
          <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                      className={`px-3 py-2 text-sm rounded-lg text-left ${
                        selectedCategory === category 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Level</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {levels.map(level => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                      className={`px-3 py-2 text-sm rounded-lg text-left ${
                        selectedLevel === level 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Results count */}
        <div className="mb-4">
          <p className="text-gray-600">Showing {filteredCourses.length} of {courses.length} courses</p>
        </div>
        
        {/* Loading state for courses */}
        {coursesLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader className="w-8 h-8 text-emerald-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory || selectedLevel ? 
                'Try adjusting your filters or search query' : 
                'There are no courses available at the moment'}
            </p>
            {(searchQuery || selectedCategory || selectedLevel) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory(null)
                  setSelectedLevel(null)
                }}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          /* Courses Grid */
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map(course => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
                  <div className="relative">
                    <img 
                      src={`${course.image_url}?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&h=400&q=80`}
                      alt={course.title}
                      className="h-48 w-full object-cover"
                      onError={(e) => {
                        // Fallback image if the original fails to load
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
                      }}
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                        {course.category}
                      </span>
                      <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                        {course.level}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 text-lg">{course.title}</h3>
                    <p className="text-gray-500 text-sm mt-2 mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="mt-auto space-y-3">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{course.instructor}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="ml-1 text-sm font-medium text-gray-900">{course.rating}</span>
                        </div>
                        <span className="mx-1 text-gray-400">•</span>
                        <span className="text-sm text-gray-500">{course.reviews_count} reviews</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{course.duration}</span>
                      </div>
                      
                      <Link 
                        to={`/course/${course.id}`}
                        className="mt-3 block w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-center rounded-lg transition-colors text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List view
            <div className="space-y-4">
              {filteredCourses.map(course => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                  <div className="flex flex-col md:flex-row h-full">
                    <div className="md:w-64 relative">
                      <img 
                        src={`${course.image_url}?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&h=400&q=80`}
                        alt={course.title}
                        className="h-48 md:h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback image if the original fails to load
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
                        }}
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                          {course.category}
                        </span>
                        <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                          {course.level}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mt-1 text-lg">{course.title}</h3>
                      <p className="text-gray-500 text-sm mt-2 mb-4">{course.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-auto">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">{course.instructor}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="ml-1 text-sm font-medium text-gray-900">{course.rating}</span>
                          </div>
                          <span className="mx-1 text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{course.reviews_count} reviews</span>
                        </div>
                        
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">{course.duration}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-end items-center mt-4 pt-4 border-t">
                        <Link 
                          to={`/course/${course.id}`}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  )
}