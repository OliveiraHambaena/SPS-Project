import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Award, 
  Users, 
  BookOpen, 
  Star, 
  MessageSquare,
  User,
  Video
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/Toast';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  instructor_id?: string;
  instructor_name?: string;
  created_by?: string;
  creator_name?: string;
  rating?: number;
  review_count?: number;
  student_count?: number;
  duration_hours?: number;
  last_updated?: string;
  difficulty_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  language?: string;
  has_certificate?: boolean;
  is_featured?: boolean;
  video_preview_url?: string;
  created_at?: string;
  updated_at?: string;
  
  // UI-specific fields
  image_url?: string;
  level?: string;
  category?: string;
  duration?: string;
  total_modules?: number;
  total_lectures?: number;
  total_hours?: number;

  modules?: Module[];
}

interface Module {
  id: string;
  course_id: string;
  course_title?: string;
  module_title: string;
  position: number;
  created_at?: string;
  updated_at?: string;
  duration?: number; // Calculated from lessons
  lectures?: Lecture[];
}

interface Lecture {
  id: string;
  module_id: string;
  title: string;
  duration_minutes: number;
  is_free?: boolean;
  video_url?: string;
  position: number;
  created_at?: string;
  updated_at?: string;
  type?: 'video' | 'reading' | 'quiz'; // Derived from video_url
}



export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'; isVisible: boolean}>({message: '', type: 'success', isVisible: false});

  useEffect(() => {
    if (courseId) {
      void fetchCourseData();
      void checkEnrollmentStatus();
    }
  }, [courseId]);

  const checkEnrollmentStatus = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setEnrolled(false);
        return;
      }
      
      // Check if the user is already enrolled in this course
      const { data, error } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
        console.error('Error checking enrollment:', error);
        return;
      }
      
      setEnrolled(!!data);
    } catch (err) {
      console.error('Error checking enrollment status:', err);
    }
  };
  
  const handleEnrollment = async () => {
    try {
      setEnrolling(true);
      setError(null);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login if not authenticated
        navigate('/login', { state: { returnTo: `/courses/${courseId}` } });
        return;
      }
      
      // Check if already enrolled
      const { data: existingEnrollment, error: checkError } = await supabase
        .from('course_enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingEnrollment) {
        setEnrolled(true);
        setEnrolling(false);
        return;
      }
      
      // Create new enrollment
      const { error: enrollError } = await supabase
        .from('course_enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          progress_percentage: 0,
          last_accessed_at: new Date().toISOString()
        });
      
      if (enrollError) {
        throw enrollError;
      }
      
      // Update the course's student count
      if (course) {
        const { error: updateError } = await supabase
          .from('courses')
          .update({ 
            student_count: (course.student_count || 0) + 1 
          })
          .eq('id', courseId);
        
        if (updateError) {
          console.error('Error updating student count:', updateError);
        }
      }
      
      // Update local state
      setEnrolled(true);
      setCourse(prev => prev ? {
        ...prev,
        student_count: (prev.student_count || 0) + 1
      } : null);
      
      // Show success message
      setToast({
        message: 'Successfully enrolled in the course!',
        type: 'success',
        isVisible: true
      });
      
      // Redirect after showing the toast
      setTimeout(() => {
        navigate(`/study/${courseId}`);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error enrolling in course:', err);
      setError(err.message || 'Failed to enroll in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      if (!courseId) {
        throw new Error('Course ID is required');
      }
      
      // Fetch course data from Supabase course_details_view
      const { data, error } = await supabase
        .from('course_details_view')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) {
        console.error('Error fetching course:', error);
        throw error;
      }
      
      if (!data) {
        console.error('Course not found');
        return;
      }
      
      console.log('Fetched course data:', data);
      
      // Transform the data to match our Course interface
      const transformedCourse: Course = {
        ...data,
        image_url: data.thumbnail_url || 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2',
        level: data.difficulty_level || 'All Levels',
        category: data.language || 'Web Development',
        duration: data.duration_hours ? `${data.duration_hours} hours` : 'Self-paced',
        total_hours: data.duration_hours || 0,
        // These will be updated after fetching modules and lessons
        total_modules: 0,
        total_lectures: 0,

      };
      
      setCourse(transformedCourse);
    } catch (error) {
      console.error('Error fetching course data:', error);
    } finally {
      setLoading(false);
    }
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
      <div className="bg-gray-900 text-white" data-component-name="CourseDetail">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16" data-component-name="CourseDetail">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center" data-component-name="CourseDetail">
            <div data-component-name="CourseDetail">
              <h1 className="text-2xl md:text-3xl font-bold mb-4">{course?.title}</h1>
              <p className="text-gray-300 mb-6" data-component-name="CourseDetail">{course?.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-6" data-component-name="CourseDetail">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course?.rating || 0}</span>
                  <span className="text-gray-400 ml-1">({course?.review_count || 0} reviews)</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="font-medium">{course?.student_count || 0}</span>
                  <span className="text-gray-400 ml-1">students</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-400" />
                  <span className="font-medium">{course?.total_hours || 0}</span>
                  <span className="text-gray-400 ml-1">hours</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <span className="font-medium">{course?.total_modules || 0}</span>
                  <span className="text-gray-400 ml-1">modules</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-red-400" />
                  <span className="font-medium">{course?.total_lectures || 0}</span>
                  <span className="text-gray-400 ml-1">lectures</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400">Last updated {course?.last_updated || course?.updated_at?.split('T')[0] || 'Recently'}</span>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mr-3">
                  <User className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium">{course?.instructor_name || 'Instructor'}</div>
                  <div className="text-sm text-gray-400">Course Instructor</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {enrolled ? (
                  <Link
                    to={`/study/${course.id}`}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    Continue Learning
                  </Link>
                ) : (
                  <button
                    onClick={handleEnrollment}
                    disabled={enrolling}
                    className={`px-6 py-3 ${enrolling ? 'bg-emerald-400' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center`}
                  >
                    {enrolling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Enrolling...
                      </>
                    ) : (
                      'Enroll Now'
                    )}
                  </button>
                )}
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img 
                src={course?.image_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'}
                alt={course?.title || 'Course'}
                className="w-full h-48 md:h-64 object-cover"
                onError={(e) => {
                  // Fallback image if the original fails to load
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'
                }}
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold text-gray-900">Free</div>
                  <div className="text-lg text-gray-500">Limited Time</div>
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
                

              </div>
            </div>
          </div>
        </div>
      </div>


      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({...prev, isVisible: false}))}
        duration={3000}
      />
    </div>
  );
}
