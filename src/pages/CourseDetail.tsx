import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Award, 
  Users, 
  BookOpen, 
  Star, 
  CheckCircle, 
  Calendar, 
  PlayCircle,
  FileText,
  MessageSquare,
  User
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Course {
  id: string;
  title: string;
  description: string;
  image_url: string;
  instructor: string;
  instructor_title?: string;
  instructor_avatar?: string;
  rating?: number;
  reviews_count?: number;
  students_count?: number;
  duration?: string;
  last_updated?: string;
  price?: number;
  sale_price?: number;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  category?: string;
  total_modules?: number;
  total_lectures?: number;
  total_hours?: number;
  features?: string[];
  requirements?: string[];
  objectives?: string[];
  modules?: Module[];
}

interface Module {
  id: string;
  title: string;
  description?: string;
  duration: number;
  lectures?: Lecture[];
}

interface Lecture {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz';
  duration: number;
  is_free?: boolean;
}

interface Review {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // In a real application, this would fetch from an actual database
      // Mock course data for demonstration
      const mockCourse: Course = {
        id: courseId || '1',
        title: 'Advanced React Patterns and Best Practices',
        description: 'Master advanced React concepts including hooks, context API, performance optimization, state management, and more. Learn how to build scalable and maintainable React applications using modern best practices.',
        image_url: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2',
        instructor: 'Sarah Johnson',
        instructor_title: 'Senior React Developer',
        instructor_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
        rating: 4.8,
        reviews_count: 342,
        students_count: 12453,
        duration: '24 hours',
        last_updated: 'April 2025',
        price: 99.99,
        sale_price: 49.99,
        level: 'Intermediate',
        category: 'Web Development',
        total_modules: 8,
        total_lectures: 42,
        total_hours: 24,
        features: [
          'Lifetime access to 42 lectures',
          'Certificate of completion',
          'Access on mobile and TV',
          'Downloadable resources',
          'Assignments and quizzes',
          'Direct message instructor'
        ],
        requirements: [
          'Basic knowledge of JavaScript and React',
          'Understanding of ES6+ features',
          'Familiarity with npm and node.js'
        ],
        objectives: [
          'Build complex React applications using advanced patterns',
          'Implement custom hooks for reusable logic',
          'Master the Context API for state management',
          'Optimize React performance with memoization',
          'Structure large-scale React applications',
          'Implement advanced routing techniques'
        ],
        modules: [
          {
            id: '1',
            title: 'Advanced Component Patterns',
            description: 'Learn advanced component patterns including compound components, render props, and higher-order components.',
            duration: 180,
            lectures: [
              { id: '1-1', title: 'Introduction to Advanced Patterns', type: 'video', duration: 15, is_free: true },
              { id: '1-2', title: 'Compound Components Pattern', type: 'video', duration: 25 },
              { id: '1-3', title: 'Render Props Pattern', type: 'video', duration: 22 },
              { id: '1-4', title: 'Higher-Order Components', type: 'video', duration: 28 },
              { id: '1-5', title: 'Pattern Comparison and Use Cases', type: 'reading', duration: 15 },
              { id: '1-6', title: 'Module Quiz', type: 'quiz', duration: 15 }
            ]
          },
          {
            id: '2',
            title: 'React Hooks in Depth',
            description: 'Master all built-in hooks and learn to create custom hooks for reusable logic.',
            duration: 210,
            lectures: [
              { id: '2-1', title: 'Understanding the Hooks Paradigm', type: 'video', duration: 18 },
              { id: '2-2', title: 'useState and useEffect Deep Dive', type: 'video', duration: 25 },
              { id: '2-3', title: 'useContext for State Management', type: 'video', duration: 22 },
              { id: '2-4', title: 'useReducer for Complex State', type: 'video', duration: 28 },
              { id: '2-5', title: 'useMemo and useCallback for Performance', type: 'video', duration: 24 },
              { id: '2-6', title: 'Creating Custom Hooks', type: 'video', duration: 30 },
              { id: '2-7', title: 'Hooks Best Practices', type: 'reading', duration: 15 },
              { id: '2-8', title: 'Module Quiz', type: 'quiz', duration: 15 }
            ]
          },
          {
            id: '3',
            title: 'State Management Solutions',
            description: 'Compare different state management solutions and learn when to use each one.',
            duration: 180,
            lectures: [
              { id: '3-1', title: 'Local vs. Global State', type: 'video', duration: 15 },
              { id: '3-2', title: 'Context API Deep Dive', type: 'video', duration: 25 },
              { id: '3-3', title: 'Redux Fundamentals', type: 'video', duration: 30 },
              { id: '3-4', title: 'Zustand and Jotai', type: 'video', duration: 25 },
              { id: '3-5', title: 'Choosing the Right Solution', type: 'reading', duration: 15 },
              { id: '3-6', title: 'Module Quiz', type: 'quiz', duration: 15 }
            ]
          }
        ]
      };
      
      // Mock reviews
      const mockReviews: Review[] = [
        {
          id: '1',
          user_name: 'Michael Chen',
          user_avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36',
          rating: 5,
          comment: 'This course is incredible! The advanced patterns section completely changed how I structure my React applications.',
          date: 'April 15, 2025'
        },
        {
          id: '2',
          user_name: 'Emily Rodriguez',
          user_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
          rating: 4,
          comment: 'Very comprehensive coverage of React hooks. The custom hooks section was particularly useful for my work projects.',
          date: 'March 28, 2025'
        },
        {
          id: '3',
          user_name: 'David Kim',
          user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
          rating: 5,
          comment: "The instructor explains complex concepts in a way that's easy to understand. Highly recommended!",
          date: 'March 10, 2025'
        }
      ];
      
      setCourse(mockCourse);
      setReviews(mockReviews);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const enrollInCourse = () => {
    // In a real app, this would call an API to enroll the user
    alert('You have been enrolled in this course!');
    // Navigate to the study page for this course
    navigate(`/study/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-sm text-emerald-900">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't find the course you're looking for. It may have been removed or you may not have access.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link to="/courses" className="mr-4">
              <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              Course Details
            </h1>
          </div>
        </div>
      </header>

      {/* Course Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-300 mb-6">{course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-gray-400 ml-1">({course.reviews_count} reviews)</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-gray-400 mr-1" />
                  <span>{course.students_count} students</span>
                </div>
                
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-1" />
                  <span>{course.duration}</span>
                </div>
                
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-1" />
                  <span>Last updated {course.last_updated}</span>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <img 
                  src={`${course.instructor_avatar}?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
                  alt={course.instructor}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <div className="font-medium">{course.instructor}</div>
                  <div className="text-sm text-gray-400">{course.instructor_title}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={enrollInCourse}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  Enroll Now
                </button>
                <Link
                  to={`/study/${course.id}`}
                  className="px-6 py-3 bg-white text-emerald-700 border border-emerald-600 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center hover:bg-emerald-50"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Preview Course
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img 
                src={`${course.image_url}?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`}
                alt={course.title}
                className="w-full h-48 md:h-64 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold text-gray-900">${course.sale_price}</div>
                  <div className="text-lg text-gray-500 line-through">${course.price}</div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Clock className="w-5 h-5 mr-3 text-emerald-600" />
                    <span>{course.total_hours} hours of content</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <BookOpen className="w-5 h-5 mr-3 text-emerald-600" />
                    <span>{course.total_lectures} lectures</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Award className="w-5 h-5 mr-3 text-emerald-600" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MessageSquare className="w-5 h-5 mr-3 text-emerald-600" />
                    <span>Direct instructor support</span>
                  </div>
                </div>
                
                <button
                  onClick={enrollInCourse}
                  className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* What You'll Learn */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.objectives?.map((objective, index) => (
                  <div key={index} className="flex">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{objective}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Course Content */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Content</h2>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <span>{course.total_modules} modules • {course.total_lectures} lectures • {course.total_hours} hours</span>
              </div>
              
              <div className="space-y-3">
                {course.modules?.map((module) => (
                  <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 text-emerald-600 mr-3" />
                        <div>
                          <h3 className="font-medium text-gray-900">{module.title}</h3>
                          <div className="text-sm text-gray-500">
                            {module.lectures?.length} lectures • {module.duration} min
                          </div>
                        </div>
                      </div>
                      <div className={`transform transition-transform duration-200 ${expandedModules[module.id] ? 'rotate-180' : ''}`}>
                        <ArrowLeft className="w-5 h-5 text-gray-500 rotate-90" />
                      </div>
                    </div>
                    
                    {expandedModules[module.id] && (
                      <div className="border-t border-gray-200 divide-y divide-gray-200">
                        {module.lectures?.map((lecture) => (
                          <div key={lecture.id} className="flex items-center p-4">
                            {lecture.type === 'video' && <PlayCircle className="w-5 h-5 text-gray-500 mr-3" />}
                            {lecture.type === 'reading' && <FileText className="w-5 h-5 text-gray-500 mr-3" />}
                            {lecture.type === 'quiz' && <MessageSquare className="w-5 h-5 text-gray-500 mr-3" />}
                            
                            <div className="flex-1">
                              <h4 className="text-gray-900">{lecture.title}</h4>
                              <div className="text-sm text-gray-500">{lecture.duration} min</div>
                            </div>
                            
                            {lecture.is_free && (
                              <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                                Free
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                {course.requirements?.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            </div>
            
            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Student Reviews</h2>
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="font-medium text-gray-900">{course.rating}</span>
                  <span className="text-gray-500 ml-1">({course.reviews_count} reviews)</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center mb-3">
                      {review.user_avatar ? (
                        <img 
                          src={`${review.user_avatar}?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
                          alt={review.user_name}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <User className="w-6 h-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{review.user_name}</div>
                        <div className="text-sm text-gray-500">{review.date}</div>
                      </div>
                      <div className="ml-auto flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8 sticky top-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">This Course Includes</h2>
              <div className="space-y-3">
                {course.features?.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={enrollInCourse}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Enroll Now
                </button>
                <Link
                  to={`/study/${course.id}`}
                  className="mt-3 block w-full py-3 bg-white text-emerald-700 border border-emerald-600 font-medium rounded-lg transition-colors duration-200 text-center hover:bg-emerald-50"
                >
                  Preview Course
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
