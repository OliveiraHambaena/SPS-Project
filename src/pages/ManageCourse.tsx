import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Save,
  Trash2,
  Upload,
  Users,
  Book,
  FileText,
  Settings,
  Clock,
  BarChart2,
  Loader2,
  UserCheck,
  Calendar,
  Percent,
  User,
  Search,
  UserPlus,
  UserMinus,
  Eye,
  Mail,
  Trash
} from 'lucide-react';

interface CourseData {
  id: string;
  title: string;
  description: string;
  rating?: number;
  review_count?: number;
  student_count?: number;
  duration_hours?: number;
  difficulty_level?: 'Beginner' | 'Intermediate' | 'Advanced';
  instructor_id?: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
  last_updated?: string;
  language?: string;
  has_certificate?: boolean;
  is_featured?: boolean;
  thumbnail_url?: string;
  video_preview_url?: string;
}

interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

interface CourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  progress_percentage: number;
  last_accessed_at?: string;
  created_at?: string;
  updated_at?: string;
  // Join with users table
  user?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
    role?: string;
    identifier_code?: string;
    email?: string;
  };
}

interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  duration_minutes?: number;
  is_free?: boolean;
  video_url?: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}

interface CourseFormData {
  title: string;
  description: string;
  duration_hours: string;
  difficulty_level: string;
  language: string;
  has_certificate: boolean;
  is_featured: boolean;
}

interface CourseErrors {
  title?: string;
  description?: string;
  duration_hours?: string;
}

const ManageCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<string>('details');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    duration_hours: '',
    difficulty_level: 'Beginner',
    language: 'English',
    has_certificate: false,
    is_featured: false
  });
  const [errors, setErrors] = useState<CourseErrors>({});
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [newModuleTitle, setNewModuleTitle] = useState<string>('');
  const [isAddingModule, setIsAddingModule] = useState<boolean>(false);
  const [loadingModules, setLoadingModules] = useState<boolean>(false);
  const [savingModule, setSavingModule] = useState<boolean>(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState<string>('');
  const [enrolledStudents, setEnrolledStudents] = useState<CourseEnrollment[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  
  // Lessons management
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [showLessonsModal, setShowLessonsModal] = useState<boolean>(false);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState<boolean>(false);
  const [newLessonTitle, setNewLessonTitle] = useState<string>('');
  const [newLessonDuration, setNewLessonDuration] = useState<string>('');
  const [newLessonIsFree, setNewLessonIsFree] = useState<boolean>(false);
  const [addingLesson, setAddingLesson] = useState<boolean>(false);
  const [savingLesson, setSavingLesson] = useState<boolean>(false);

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        if (!courseId) {
          throw new Error('Course ID is required');
        }

        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (error) throw error;
        
        setCourseData(data);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          duration_hours: data.duration_hours?.toString() || '',
          difficulty_level: data.difficulty_level || 'Beginner',
          language: data.language || 'English',
          has_certificate: data.has_certificate || false,
          is_featured: data.is_featured || false
        });
        
        if (data.thumbnail_url) {
          setThumbnailPreview(data.thumbnail_url);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchCourseData();
  }, [courseId]);
  
  // Fetch course modules
  useEffect(() => {
    const fetchModules = async () => {
      if (!courseId) return;
      
      try {
        setLoadingModules(true);
        
        const { data, error } = await supabase
          .from('course_modules')
          .select('*')
          .eq('course_id', courseId)
          .order('position', { ascending: true });
          
        if (error) throw error;
        
        setModules(data || []);
      } catch (error) {
        console.error('Error fetching modules:', error);
      } finally {
        setLoadingModules(false);
      }
    };
    
    if (activeTab === 'content') {
      void fetchModules();
    }
  }, [courseId, activeTab]);

  // Fetch lessons for a module
  const fetchLessons = async (moduleId: string) => {
    if (!moduleId) return;
    
    try {
      setLoadingLessons(true);
      console.log('Fetching lessons for module ID:', moduleId);
      
      const { data, error } = await supabase
        .from('course_lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('position', { ascending: true });
        
      if (error) {
        console.error('Error fetching lessons:', error);
        throw error;
      }
      
      console.log('Lessons data:', data);
      setLessons(data || []);
    } catch (error) {
      console.error('Error in fetchLessons:', error);
      setLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };
  
  // Handle opening the lessons modal
  const handleOpenLessonsModal = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setShowLessonsModal(true);
    void fetchLessons(moduleId);
  };
  
  // Fetch enrolled students
  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      if (!courseId) return;
      
      try {
        setLoadingStudents(true);
        console.log('Fetching enrolled students for course ID:', courseId);
        
        // First, check if the course exists
        const { data: courseCheck, error: courseError } = await supabase
          .from('courses')
          .select('id, title')
          .eq('id', courseId)
          .single();
          
        if (courseError) {
          console.error('Error verifying course:', courseError);
          throw courseError;
        }
        
        console.log('Course verified:', courseCheck);
        
        // Fetch enrollments with user details using a join
        const { data, error } = await supabase
          .from('course_enrollments')
          .select(`
            id,
            course_id,
            user_id,
            progress_percentage,
            last_accessed_at,
            created_at,
            updated_at,
            user:user_id (
              id,
              full_name,
              avatar_url,
              role,
              identifier_code,
              email
            )
          `)
          .eq('course_id', courseId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching enrollments:', error);
          throw error;
        }
        
        console.log('Enrollments data:', data);
        console.log('Number of enrollments found:', data ? data.length : 0);
        
        // For testing purposes, let's create a sample enrollment if none exist
        if (!data || data.length === 0) {
          console.log('No enrollments found, adding sample data for demonstration');
          
          // Create sample data for demonstration
          const sampleEnrollments: CourseEnrollment[] = [
            {
              id: 'sample-1',
              course_id: courseId || '',
              user_id: 'sample-user-1',
              progress_percentage: 65,
              last_accessed_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user: {
                id: 'sample-user-1',
                full_name: 'Sample Student',
                role: 'student',
                identifier_code: 'SAMPLE001',
                avatar_url: undefined,
                email: 'sample@example.com'
              }
            }
          ];
          
          setEnrolledStudents(sampleEnrollments);
        } else {
          // Set the enrolled students data
          setEnrolledStudents(data as CourseEnrollment[]);
        }
        
        // Update course student count if needed
        if (data && courseData && courseData.student_count !== data.length) {
          console.log('Updating course student count to:', data.length);
          
          await supabase
            .from('courses')
            .update({ student_count: data.length })
            .eq('id', courseId);
            
          // Update local state
          setCourseData(prev => prev ? {
            ...prev,
            student_count: data.length
          } : null);
        }
      } catch (error) {
        console.error('Error in fetchEnrolledStudents:', error);
        // Set empty array to avoid undefined errors in the UI
        setEnrolledStudents([]);
      } finally {
        setLoadingStudents(false);
      }
    };
    
    if (activeTab === 'students') {
      void fetchEnrolledStudents();
    }
  }, [courseId, activeTab, courseData]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof CourseErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle thumbnail upload
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: CourseErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.duration_hours) {
      newErrors.duration_hours = 'Duration is required';
    } else if (isNaN(Number(formData.duration_hours)) || Number(formData.duration_hours) <= 0) {
      newErrors.duration_hours = 'Duration must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      let thumbnailUrl = courseData?.thumbnail_url;
      
      // Upload thumbnail if changed
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split('.').pop();
        const fileName = `${courseId}-${Date.now()}.${fileExt}`;
        const filePath = `course-thumbnails/${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('course-assets')
          .upload(filePath, thumbnailFile, {
            upsert: true,
            onUploadProgress: (progress) => {
              setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
            }
          });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('course-assets')
          .getPublicUrl(filePath);
          
        thumbnailUrl = publicUrl;
      }
      
      // Update course data
      const { error } = await supabase
        .from('courses')
        .update({
          title: formData.title,
          description: formData.description,
          duration_hours: parseInt(formData.duration_hours),
          difficulty_level: formData.difficulty_level,
          language: formData.language,
          has_certificate: formData.has_certificate,
          is_featured: formData.is_featured,
          thumbnail_url: thumbnailUrl,
          updated_at: new Date().toISOString(),
          last_updated: new Date().toLocaleString()
        })
        .eq('id', courseId);
        
      if (error) throw error;
      
      // Success message
      alert('Course updated successfully!');
      
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course. Please try again.');
    } finally {
      setSaving(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="mt-4 text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
          <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or you don't have permission to manage it.</p>
          <Link 
            to="/profile"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/profile')}
                className="mr-4 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Back to profile"
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Manage Course</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                  saving ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-b-2 border-emerald-500 text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Course Details
                </div>
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'content'
                    ? 'border-b-2 border-emerald-500 text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Book className="w-4 h-4 mr-2" />
                  Content
                </div>
              </button>
              <button
                onClick={() => setActiveTab('enrolled')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'enrolled'
                    ? 'border-b-2 border-emerald-500 text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                data-component-name="ManageCourse"
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Enrolled
                </div>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-emerald-500 text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'enrolled' && (
              <div data-component-name="ManageCourse">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Enrolled Students</h2>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search students..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm"
                      />
                    </div>
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex flex-wrap items-center text-sm text-gray-600 gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
                      <span>Course enrollment statistics:</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-blue-500" /> 
                      <span>{enrolledStudents.length} total students</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-amber-500" /> 
                      <span>{enrolledStudents.filter(e => e.last_accessed_at && new Date(e.last_accessed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} active in last week</span>
                    </div>
                    <div className="flex items-center">
                      <Percent className="h-4 w-4 mr-1 text-purple-500" /> 
                      <span>{enrolledStudents.length > 0 ? Math.round(enrolledStudents.reduce((acc, curr) => acc + curr.progress_percentage, 0) / enrolledStudents.length) : 0}% avg. completion</span>
                    </div>
                  </div>
                </div>

                {loadingStudents ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="ml-2 text-gray-600">Loading enrolled students...</span>
                  </div>
                ) : enrolledStudents.length === 0 ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
                    <p className="text-gray-600 mb-6">This course doesn't have any enrolled students yet.</p>
                    <button
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Student
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Date</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {enrolledStudents.map((enrollment) => (
                            <tr key={enrollment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {enrollment.user?.avatar_url ? (
                                      <img 
                                        className="h-10 w-10 rounded-full object-cover border border-gray-200" 
                                        src={enrollment.user.avatar_url} 
                                        alt={enrollment.user?.full_name || 'Student'} 
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                                        <User className="h-5 w-5 text-emerald-600" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{enrollment.user?.full_name || 'Unnamed Student'}</div>
                                    <div className="text-sm text-gray-500">{enrollment.user?.identifier_code || 'No ID'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div 
                                      className={`h-2.5 rounded-full ${
                                        enrollment.progress_percentage < 30 ? 'bg-red-500' : 
                                        enrollment.progress_percentage < 70 ? 'bg-yellow-500' : 
                                        'bg-emerald-500'
                                      }`}
                                      style={{ width: `${enrollment.progress_percentage}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm text-gray-900 font-medium">{enrollment.progress_percentage}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {enrollment.last_accessed_at ? (
                                  new Date(enrollment.last_accessed_at).toLocaleDateString()
                                ) : (
                                  'Never'
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {enrollment.created_at ? (
                                  new Date(enrollment.created_at).toLocaleDateString()
                                ) : (
                                  'Unknown'
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button className="text-emerald-600 hover:text-emerald-900" title="View student progress">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button className="text-blue-600 hover:text-blue-900" title="Send message">
                                    <Mail className="h-4 w-4" />
                                  </button>
                                  <button className="text-red-600 hover:text-red-900" title="Remove from course">
                                    <UserMinus className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'details' && (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left column - Course info */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Course title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Course Title *
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          name="title"
                          id="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="Enter a descriptive title for your course"
                          className={`block w-full rounded-md sm:text-sm border-2 py-3 h-12 ${
                            errors.title
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-colors'
                          }`}
                          maxLength={100}
                          required
                        />
                        {errors.title && (
                          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                      </div>
                    </div>

                    {/* Course description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Course Description *
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          name="description"
                          rows={6}
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe what students will learn in this course"
                          className={`block w-full rounded-md sm:text-sm border-2 py-3 ${
                            errors.description
                              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-colors'
                          }`}
                          required
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Course metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Difficulty level */}
                      <div>
                        <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700">
                          Difficulty Level
                        </label>
                        <div className="mt-1">
                          <select
                            id="difficulty_level"
                            name="difficulty_level"
                            value={formData.difficulty_level}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-colors sm:text-sm py-3 h-12"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                      </div>

                      {/* Duration hours */}
                      <div>
                        <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700">
                          Duration (hours) *
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="duration_hours"
                            id="duration_hours"
                            min="1"
                            value={formData.duration_hours}
                            onChange={handleInputChange}
                            placeholder="Estimated hours to complete"
                            className={`block w-full rounded-md sm:text-sm border-2 py-3 h-12 ${
                              errors.duration_hours
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-colors'
                            }`}
                            required
                          />
                          {errors.duration_hours && (
                            <p className="mt-1 text-sm text-red-600">{errors.duration_hours}</p>
                          )}
                        </div>
                      </div>

                      {/* Language */}
                      <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                          Language
                        </label>
                        <div className="mt-1">
                          <select
                            id="language"
                            name="language"
                            value={formData.language}
                            onChange={handleInputChange}
                            className="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-colors sm:text-sm py-3 h-12"
                          >
                            <option value="English">English</option>
                            <option value="Oshiwambo">Oshiwambo</option>
                            <option value="Otjiherero">Otjiherero</option>
                            <option value="Damara/Nama">Damara/Nama</option>
                            <option value="Rukwangali">Rukwangali</option>
                            <option value="Silozi">Silozi</option>
                            <option value="Setswana">Setswana</option>
                            <option value="Afrikaans">Afrikaans</option>
                            <option value="Khoekhoegowab">Khoekhoegowab</option>
                            <option value="San">San</option>
                          </select>
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div className="space-y-4">
                        {/* Certificate */}
                        <div className="flex items-center">
                          <input
                            id="has_certificate"
                            name="has_certificate"
                            type="checkbox"
                            checked={formData.has_certificate}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                          />
                          <label htmlFor="has_certificate" className="ml-2 block text-sm text-gray-700">
                            Offer certificate of completion
                          </label>
                        </div>

                        {/* Featured */}
                        <div className="flex items-center">
                          <input
                            id="is_featured"
                            name="is_featured"
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                          />
                          <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                            Feature this course
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right column - Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Course Thumbnail
                    </label>
                    <div className="mt-1 flex flex-col items-center space-y-4">
                      <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                        {thumbnailPreview ? (
                          <img
                            src={thumbnailPreview}
                            alt="Course thumbnail preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Book className="w-12 h-12 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="w-full">
                        <label
                          htmlFor="thumbnail"
                          className="cursor-pointer w-full flex items-center justify-center px-4 py-2 border-2 border-gray-300 border-dashed rounded-md hover:border-emerald-300 transition-colors"
                        >
                          <div className="space-y-1 text-center">
                            <Upload className="mx-auto h-8 w-8 text-gray-400" />
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-emerald-600 hover:text-emerald-500">
                                Upload a file
                              </span>{' '}
                              or drag and drop
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                          </div>
                          <input
                            id="thumbnail"
                            name="thumbnail"
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      {uploadProgress > 0 && (
                        <div className="w-full">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-emerald-600 h-2.5 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-center">
                            Uploading: {uploadProgress}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'content' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Course Modules</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Organize your course content into modules. Drag to reorder modules.
                  </p>
                  
                  {/* Module list */}
                  {loadingModules ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                  ) : modules.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h4>
                      <p className="text-gray-500 mb-6">
                        Create your first module to organize your course content.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {modules.map((module, index) => (
                        <div 
                          key={module.id} 
                          className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center">
                            <div className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                              {index + 1}
                            </div>
                            {editingModuleId === module.id ? (
                              <input
                                type="text"
                                value={editModuleTitle}
                                onChange={(e) => setEditModuleTitle(e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                                placeholder="Module title"
                                autoFocus
                              />
                            ) : (
                              <span className="font-medium">{module.title}</span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            {editingModuleId === module.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!editModuleTitle.trim()) return;
                                    
                                    try {
                                      setSavingModule(true);
                                      const { error } = await supabase
                                        .from('course_modules')
                                        .update({ title: editModuleTitle })
                                        .eq('id', module.id);
                                        
                                      if (error) throw error;
                                      
                                      // Update local state
                                      setModules(modules.map(m => 
                                        m.id === module.id ? { ...m, title: editModuleTitle } : m
                                      ));
                                      setEditingModuleId(null);
                                    } catch (error) {
                                      console.error('Error updating module:', error);
                                      alert('Failed to update module. Please try again.');
                                    } finally {
                                      setSavingModule(false);
                                    }
                                  }}
                                  className="p-2 text-emerald-600 hover:text-emerald-800 focus:outline-none"
                                  disabled={savingModule}
                                >
                                  {savingModule ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingModuleId(null)}
                                  className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                  <ArrowLeft className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                {/* Lessons button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenLessonsModal(module.id)}
                                  className="p-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                                  title="Manage Lessons"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>
                                {/* Edit button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingModuleId(module.id);
                                    setEditModuleTitle(module.title);
                                  }}
                                  className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                    <path d="m15 5 4 4"/>
                                  </svg>
                                </button>
                                {/* Delete button */}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    if (!window.confirm('Are you sure you want to delete this module?')) return;
                                    
                                    try {
                                      const { error } = await supabase
                                        .from('course_modules')
                                        .delete()
                                        .eq('id', module.id);
                                        
                                      if (error) throw error;
                                      
                                      // Update local state
                                      setModules(modules.filter(m => m.id !== module.id));
                                      
                                      // Update positions for remaining modules
                                      const remainingModules = modules.filter(m => m.id !== module.id);
                                      for (let i = 0; i < remainingModules.length; i++) {
                                        if (remainingModules[i].position !== i + 1) {
                                          await supabase
                                            .from('course_modules')
                                            .update({ position: i + 1 })
                                            .eq('id', remainingModules[i].id);
                                        }
                                      }
                                    } catch (error) {
                                      console.error('Error deleting module:', error);
                                      alert('Failed to delete module. Please try again.');
                                    }
                                  }}
                                  className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add module form */}
                  {isAddingModule ? (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h4 className="text-md font-medium text-gray-900 mb-3">Add New Module</h4>
                      <div className="flex">
                        <input
                          type="text"
                          value={newModuleTitle}
                          onChange={(e) => setNewModuleTitle(e.target.value)}
                          placeholder="Enter module title"
                          className="block w-full rounded-l-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            if (!newModuleTitle.trim()) return;
                            
                            try {
                              setSavingModule(true);
                              
                              // Calculate next position
                              const position = modules.length + 1;
                              
                              const { data, error } = await supabase
                                .from('course_modules')
                                .insert({
                                  course_id: courseId,
                                  title: newModuleTitle,
                                  position
                                })
                                .select();
                                
                              if (error) throw error;
                              
                              // Update local state
                              if (data && data.length > 0) {
                                setModules([...modules, data[0]]);
                              }
                              
                              setNewModuleTitle('');
                              setIsAddingModule(false);
                            } catch (error) {
                              console.error('Error adding module:', error);
                              alert('Failed to add module. Please try again.');
                            } finally {
                              setSavingModule(false);
                            }
                          }}
                          disabled={savingModule || !newModuleTitle.trim()}
                          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${savingModule || !newModuleTitle.trim() ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                          {savingModule ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : 'Add Module'}
                        </button>
                      </div>
                      <div className="flex justify-end mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setNewModuleTitle('');
                            setIsAddingModule(false);
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingModule(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus mr-2">
                        <path d="M5 12h14"/>
                        <path d="M12 5v14"/>
                      </svg>
                      Add Module
                    </button>
                  )}
                  

                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="p-6" data-component-name="ManageCourse">
                <div className="bg-white p-6 rounded-lg shadow-sm" data-component-name="ManageCourse">
                  {loadingStudents ? (
                    <div className="text-center py-12" data-component-name="ManageCourse">
                      <Loader2 className="w-16 h-16 text-emerald-500 animate-spin mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Students</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">Please wait while we fetch the enrolled students.</p>
                    </div>
                  ) : enrolledStudents.length === 0 ? (
                    <div className="text-center py-12" data-component-name="ManageCourse">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2" data-component-name="ManageCourse">No Students Enrolled</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto" data-component-name="ManageCourse">
                        There are no students enrolled in this course yet. Students will appear here once they enroll.
                      </p>
                      
                      <button 
                        onClick={() => {
                          // Create a sample enrollment for demonstration
                          const addSampleEnrollment = async () => {
                            if (!courseId || !courseData) return;
                            
                            try {
                              setLoadingStudents(true);
                              
                              // First get a random student from the users table
                              const { data: userData, error: userError } = await supabase
                                .from('users')
                                .select('id, full_name, role, identifier_code')
                                .eq('role', 'student')
                                .limit(1)
                                .single();
                                
                              if (userError) {
                                console.error('Error finding a student:', userError);
                                throw userError;
                              }
                              
                              if (!userData) {
                                console.error('No students found in the database');
                                return;
                              }
                              
                              console.log('Found student for enrollment:', userData);
                              
                              // Create the enrollment
                              const { data: enrollmentData, error: enrollmentError } = await supabase
                                .from('course_enrollments')
                                .insert({
                                  course_id: courseId,
                                  user_id: userData.id,
                                  progress_percentage: Math.floor(Math.random() * 100),
                                  last_accessed_at: new Date().toISOString()
                                })
                                .select();
                                
                              if (enrollmentError) {
                                console.error('Error creating enrollment:', enrollmentError);
                                throw enrollmentError;
                              }
                              
                              console.log('Created enrollment:', enrollmentData);
                              
                              // Refetch the enrollments
                              await fetchEnrolledStudents();
                              
                            } catch (error) {
                              console.error('Error adding sample enrollment:', error);
                              alert('Failed to add sample enrollment. See console for details.');
                            } finally {
                              setLoadingStudents(false);
                            }
                          };
                          
                          void addSampleEnrollment();
                        }}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Add Sample Student (Demo)
                      </button>
                    </div>
                  ) : (
                    <div data-component-name="ManageCourse">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900" data-component-name="ManageCourse">
                          Enrolled Students 
                          <span className="text-emerald-600 bg-emerald-50 text-sm py-1 px-2 rounded-full ml-2">
                            {enrolledStudents.length}
                          </span>
                        </h3>
                        <div className="flex space-x-2">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              placeholder="Search students..."
                              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 block w-full shadow-sm sm:text-sm"
                            />
                          </div>
                          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                            <UserCheck className="h-4 w-4 mr-2" />
                            Add Student
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-emerald-500" />
                          <span>Course enrollment statistics:</span>
                          <span className="ml-4 flex items-center"><Users className="h-4 w-4 mr-1 text-blue-500" /> {enrolledStudents.length} total students</span>
                          <span className="ml-4 flex items-center"><Clock className="h-4 w-4 mr-1 text-amber-500" /> {enrolledStudents.filter(e => e.last_accessed_at && new Date(e.last_accessed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} active in last week</span>
                          <span className="ml-4 flex items-center"><Percent className="h-4 w-4 mr-1 text-purple-500" /> {Math.round(enrolledStudents.reduce((acc, curr) => acc + curr.progress_percentage, 0) / enrolledStudents.length)}% avg. completion</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {enrolledStudents.slice(0, 3).map((enrollment) => (
                          <div key={`card-${enrollment.id}`} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden" data-component-name="ManageCourse">
                            <div className="p-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 mr-3">
                                  {enrollment.user?.avatar_url ? (
                                    <img 
                                      className="h-12 w-12 rounded-full object-cover border-2 border-emerald-200" 
                                      src={enrollment.user.avatar_url} 
                                      alt={enrollment.user?.full_name || 'Student'} 
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center border-2 border-emerald-200">
                                      <Users className="h-6 w-6 text-emerald-600" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-md font-medium text-gray-900">{enrollment.user?.full_name || 'Unnamed Student'}</h4>
                                  <div className="flex items-center text-sm text-gray-500">
                                    <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full capitalize mr-2">{enrollment.user?.role || 'student'}</span>
                                    <span>{enrollment.user?.identifier_code || 'No ID'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-700">Progress</span>
                                  <span className="text-sm font-semibold text-emerald-600">{enrollment.progress_percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      enrollment.progress_percentage < 30 ? 'bg-red-500' : 
                                      enrollment.progress_percentage < 70 ? 'bg-yellow-500' : 
                                      'bg-emerald-500'
                                    }`}
                                    style={{ width: `${enrollment.progress_percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                                <div>
                                  <span className="block text-gray-400">Last Active</span>
                                  <span className="font-medium text-gray-600">
                                    {enrollment.last_accessed_at ? (
                                      new Date(enrollment.last_accessed_at).toLocaleDateString()
                                    ) : (
                                      'Never'
                                    )}
                                  </span>
                                </div>
                                <div>
                                  <span className="block text-gray-400">Enrolled On</span>
                                  <span className="font-medium text-gray-600">
                                    {enrollment.created_at ? (
                                      new Date(enrollment.created_at).toLocaleDateString()
                                    ) : (
                                      'Unknown'
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 flex justify-between">
                              <button className="text-sm text-emerald-600 hover:text-emerald-800 font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Message
                              </button>
                              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                View Progress
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID Code
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Progress
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Last Accessed
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Enrolled On
                              </th>
                              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {enrolledStudents.map((enrollment) => (
                              <tr key={enrollment.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 relative">
                                      {enrollment.user?.avatar_url ? (
                                        <img 
                                          className="h-10 w-10 rounded-full object-cover" 
                                          src={enrollment.user.avatar_url} 
                                          alt="" 
                                        />
                                      ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                          <Users className="h-5 w-5 text-gray-400" />
                                        </div>
                                      )}
                                      {enrollment.user?.role && (
                                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white bg-emerald-400" />
                                      )}
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">
                                        {enrollment.user?.full_name || 'Unnamed User'}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {enrollment.user?.role ? (
                                          <span className="capitalize">{enrollment.user.role}</span>
                                        ) : 'Unknown role'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{enrollment.user?.identifier_code || 'N/A'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-[100px]">
                                      <div 
                                        className={`h-2.5 rounded-full ${
                                          enrollment.progress_percentage < 30 ? 'bg-red-500' : 
                                          enrollment.progress_percentage < 70 ? 'bg-yellow-500' : 
                                          'bg-emerald-500'
                                        }`}
                                        style={{ width: `${enrollment.progress_percentage}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm text-gray-500">{enrollment.progress_percentage}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {enrollment.last_accessed_at ? (
                                    new Date(enrollment.last_accessed_at).toLocaleDateString()
                                  ) : (
                                    'Never'
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {enrollment.created_at ? (
                                    new Date(enrollment.created_at).toLocaleDateString()
                                  ) : (
                                    'Unknown'
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                  <div className="flex justify-center space-x-2">
                                    <button className="text-emerald-600 hover:text-emerald-900 focus:outline-none" title="Send message">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                      </svg>
                                    </button>
                                    <button className="text-blue-600 hover:text-blue-900 focus:outline-none" title="View progress details">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                      </svg>
                                    </button>
                                    <button className="text-red-600 hover:text-red-900 focus:outline-none" title="Remove from course">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="mt-6 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Showing <span className="font-medium">{enrolledStudents.length}</span> students
                        </div>
                        <div className="flex space-x-2">
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                            Export CSV
                          </button>
                          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                            Send Group Message
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-center py-12">
                  <BarChart2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Course Analytics</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    This feature is coming soon. You'll be able to view detailed analytics about your course performance.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                    <div className="border border-red-200 rounded-md p-4 bg-red-50">
                      <h4 className="text-md font-medium text-red-800 mb-2">Delete Course</h4>
                      <p className="text-sm text-red-600 mb-4">
                        Once you delete a course, all of its data will be permanently removed. This action cannot be undone.
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                            // Delete course logic would go here
                            alert('Delete functionality will be implemented soon.');
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Course
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Lessons Modal */}
      {showLessonsModal && selectedModuleId && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              aria-hidden="true"
              onClick={() => !savingLesson && setShowLessonsModal(false)}
            ></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => !savingLesson && setShowLessonsModal(false)}
                  disabled={savingLesson}
                >
                  <span className="sr-only">Close</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">
                      Manage Lessons
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {modules.find(m => m.id === selectedModuleId)?.title || 'Module'} - Lessons
                    </p>
                    
                    {/* Lessons list */}
                    {loadingLessons ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                      </div>
                    ) : lessons.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h4>
                        <p className="text-gray-500 mb-6">
                          Add your first lesson to this module.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                        {lessons.map((lesson, index) => (
                          <div 
                            key={lesson.id} 
                            className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center">
                              <div className="bg-blue-100 text-blue-600 w-7 h-7 rounded-full flex items-center justify-center mr-3">
                                {index + 1}
                              </div>
                              <div>
                                <span className="font-medium block">{lesson.title}</span>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  {lesson.duration_minutes && (
                                    <span className="flex items-center mr-3">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {lesson.duration_minutes} min
                                    </span>
                                  )}
                                  {lesson.is_free && (
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                      Free
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (!window.confirm('Are you sure you want to delete this lesson?')) return;
                                  
                                  try {
                                    const { error } = await supabase
                                      .from('course_lessons')
                                      .delete()
                                      .eq('id', lesson.id);
                                      
                                    if (error) throw error;
                                    
                                    // Update local state
                                    setLessons(lessons.filter(l => l.id !== lesson.id));
                                    
                                    // Update positions for remaining lessons
                                    const remainingLessons = lessons.filter(l => l.id !== lesson.id);
                                    for (let i = 0; i < remainingLessons.length; i++) {
                                      if (remainingLessons[i].position !== i + 1) {
                                        await supabase
                                          .from('course_lessons')
                                          .update({ position: i + 1 })
                                          .eq('id', remainingLessons[i].id);
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Error deleting lesson:', error);
                                    alert('Failed to delete lesson. Please try again.');
                                  }
                                }}
                                className="p-1.5 text-red-500 hover:text-red-700 focus:outline-none"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Add lesson form */}
                    {addingLesson ? (
                      <div className="bg-gray-50 rounded-lg p-4 mt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-3">Add New Lesson</h4>
                        <div className="space-y-4 border border-gray-200 rounded-md p-4 min-h-[300px]" data-component-name="ManageCourse">
                          {/* Lesson title */}
                          <div>
                            <label htmlFor="lesson_title" className="block text-sm font-medium text-gray-700">
                              Lesson Title *
                            </label>
                            <input
                              type="text"
                              id="lesson_title"
                              value={newLessonTitle}
                              onChange={(e) => setNewLessonTitle(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                              placeholder="Enter lesson title"
                            />
                          </div>
                          
                          {/* Duration */}
                          <div>
                            <label htmlFor="lesson_duration" className="block text-sm font-medium text-gray-700">
                              Duration (minutes)
                            </label>
                            <input
                              type="number"
                              id="lesson_duration"
                              value={newLessonDuration}
                              onChange={(e) => setNewLessonDuration(e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                              placeholder="Enter duration in minutes"
                              min="1"
                            />
                          </div>
                          
                          {/* Is free checkbox */}
                          <div className="flex items-center">
                            <input
                              id="is_free"
                              type="checkbox"
                              checked={newLessonIsFree}
                              onChange={(e) => setNewLessonIsFree(e.target.checked)}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <label htmlFor="is_free" className="ml-2 block text-sm text-gray-700">
                              Free preview lesson
                            </label>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="flex justify-end space-x-3 pt-4">
                            <button
                              type="button"
                              onClick={() => {
                                setNewLessonTitle('');
                                setNewLessonDuration('');
                                setNewLessonIsFree(false);
                                setAddingLesson(false);
                              }}
                              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                              disabled={savingLesson}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                if (!selectedModuleId || !newLessonTitle.trim()) return;
                                
                                try {
                                  setSavingLesson(true);
                                  
                                  // Calculate next position
                                  const position = lessons.length + 1;
                                  
                                  // Parse duration as integer
                                  const duration = newLessonDuration ? parseInt(newLessonDuration, 10) : null;
                                  
                                  const { data, error } = await supabase
                                    .from('course_lessons')
                                    .insert({
                                      module_id: selectedModuleId,
                                      title: newLessonTitle,
                                      duration_minutes: duration,
                                      is_free: newLessonIsFree,
                                      position
                                    })
                                    .select();
                                    
                                  if (error) throw error;
                                  
                                  // Update local state
                                  if (data && data.length > 0) {
                                    setLessons([...lessons, data[0]]);
                                  }
                                  
                                  // Reset form
                                  setNewLessonTitle('');
                                  setNewLessonDuration('');
                                  setNewLessonIsFree(false);
                                  setAddingLesson(false);
                                } catch (error) {
                                  console.error('Error adding lesson:', error);
                                  alert('Failed to add lesson. Please try again.');
                                } finally {
                                  setSavingLesson(false);
                                }
                              }}
                              disabled={savingLesson || !newLessonTitle.trim()}
                              className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors ${savingLesson || !newLessonTitle.trim() 
                                ? 'bg-emerald-400 cursor-not-allowed' 
                                : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            >
                              {savingLesson ? (
                                <span className="flex items-center">
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </span>
                              ) : (
                                'Add Lesson'
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddingLesson(true)}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Lesson
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourse;
