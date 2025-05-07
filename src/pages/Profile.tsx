import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Camera, Loader2, CheckCircle, ArrowLeft, Shield, Book, GraduationCap, Calendar, Clock, Star, Users, Clock3, Award, ExternalLink, X, Upload, Info, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

// TypeScript interfaces
interface UserProfile {
  id: string;
  role: 'student' | 'teacher' | 'parent';
  identifier_code: string;
  name?: string;
  subject?: string;
  grade?: string;
  created_at?: string;
  updated_at?: string;
  // These fields might come from other tables or be added client-side
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  email?: string;
}

interface FormData {
  full_name: string;
  email: string;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  avatar?: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'courses'>('profile');
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    difficulty_level: 'Beginner',
    duration_hours: 0,
    language: 'English',
    has_certificate: false,
    is_featured: false
  });
  const [courseErrors, setCourseErrors] = useState<Record<string, string>>({});
  const [courseSubmitting, setCourseSubmitting] = useState(false);
  const [courseSuccess, setCourseSuccess] = useState(false);
  const [courseThumbnail, setCourseThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const courseThumbnailRef = useRef<HTMLInputElement>(null);

  // Fetch user profile on component mount
  useEffect(() => {
    void fetchProfile();
  }, []);
  
  // Fetch user courses when the courses tab is selected
  useEffect(() => {
    if (activeTab === 'courses' && userProfile) {
      void fetchUserCourses();
    }
  }, [activeTab, userProfile]);

  // Reset success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Track form changes
  useEffect(() => {
    if (userProfile) {
      const initialFormData = {
        full_name: userProfile.full_name || '',
        email: userProfile.email || '',
      };
      
      const hasFormChanges = 
        formData.full_name !== initialFormData.full_name ||
        formData.email !== initialFormData.email;
      
      setHasChanges(hasFormChanges || !!avatarFile);
    }
  }, [formData, avatarFile, userProfile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login', { replace: true });
        return;
      }
      
      let profileData: UserProfile | null = null;
      
      // Try to get data from users_view first
      const { data: viewData, error: viewError } = await supabase
        .from('users_view')
        .select('id, name, role, identifier_code, subject, grade, created_at, updated_at')
        .eq('id', user.id)
        .single();
      
      // If users_view query fails, fall back to users table
      if (viewError) {
        console.log('Falling back to users table');
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, role, identifier_code, name, subject, grade, created_at, updated_at, full_name, avatar_url, phone')
          .eq('id', user.id)
          .single();
        
        if (userError) throw userError;
        
        profileData = userData as UserProfile;
      } else {
        // If users_view query succeeds, get additional profile data
        profileData = viewData as UserProfile;
        
        // Get additional profile data that might be in the users table but not in the view
        const { data: additionalData, error: additionalError } = await supabase
          .from('users')
          .select('full_name, avatar_url, phone')
          .eq('id', user.id)
          .single();
        
        // Only merge if we got additional data without error
        if (!additionalError && additionalData) {
          profileData = {
            ...profileData,
            full_name: additionalData.full_name || profileData.name || '',
            avatar_url: additionalData.avatar_url || undefined,
            phone: additionalData.phone || '',
          };
        } else {
          // Set defaults for missing fields
          profileData = {
            ...profileData,
            full_name: profileData.name || '',
            avatar_url: undefined,
            phone: '',
          };
        }
      }
      
      // Get email from auth user
      profileData = {
        ...profileData,
        email: user.email || '',
      };
      
      if (profileData) {
        setUserProfile(profileData);
        setFormData({
          full_name: profileData.full_name || profileData.name || '',
          email: profileData.email || '',
        });
        
        if (profileData.avatar_url) {
          setAvatarPreview(profileData.avatar_url);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = (data: FormData, file?: File): FormErrors => {
    const errors: FormErrors = {};
    
    // Full name validation
    if (!data.full_name.trim()) {
      errors.full_name = 'Full name is required';
    } else if (data.full_name.length > 100) {
      errors.full_name = 'Full name must be less than 100 characters';
    }
    
    // Email validation
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    // Avatar file validation
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        errors.avatar = 'Please upload a JPG, PNG, or GIF file';
      } else if (file.size > maxSize) {
        errors.avatar = 'File size must be less than 5MB';
      }
    }
    
    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file
      const fileErrors = validateForm(formData, file);
      if (fileErrors.avatar) {
        setErrors(prev => ({ ...prev, avatar: fileErrors.avatar }));
        return;
      }
      
      // Clear previous error
      setErrors(prev => ({ ...prev, avatar: undefined }));
      
      // Set file for upload
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !userProfile) return null;
    
    try {
      setIsUploading(true);
      
      // Create a unique file path
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `avatars/${userProfile.id}-${Date.now()}.${fileExt}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setErrors(prev => ({ ...prev, avatar: 'Failed to upload image' }));
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) return;
    
    // Validate form
    const validationErrors = validateForm(formData, avatarFile || undefined);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Upload avatar if changed
      let avatarUrl = userProfile.avatar_url;
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }
      
      // Update profile
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userProfile.id);
      
      if (error) throw error;
      
      // Update local state
      setUserProfile(prev => prev ? {
        ...prev,
        full_name: formData.full_name,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      } : null);
      
      // Reset file state
      setAvatarFile(null);
      
      // Show success message
      setSuccessMessage('Profile updated successfully');
      
      // Reset changes flag
      setHasChanges(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ ...errors, full_name: 'Failed to update profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Show confirmation if there are changes
    if (hasChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to discard them?')) {
        return;
      }
    }
    
    // Reset form data to original values
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        email: userProfile.email || '',
      });
    }
    
    // Reset avatar preview
    if (userProfile?.avatar_url) {
      setAvatarPreview(userProfile.avatar_url);
    } else {
      setAvatarPreview(null);
    }
    
    // Clear file input
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear errors
    setErrors({});
    
    // Reset changes flag
    setHasChanges(false);
  };

  const handleBack = () => {
    if (hasChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to go back?')) {
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };
  
  // Handle course thumbnail change
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setCourseErrors(prev => ({ ...prev, thumbnail: 'File size must be less than 5MB' }));
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setCourseErrors(prev => ({ ...prev, thumbnail: 'Please upload a JPG, PNG, or GIF file' }));
        return;
      }
      
      // Clear previous error
      setCourseErrors(prev => ({ ...prev, thumbnail: undefined }));
      
      // Set file for upload
      setCourseThumbnail(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle course form input change
  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setCourseFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setCourseFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user starts typing
    if (courseErrors[name]) {
      setCourseErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  // Upload course thumbnail
  const uploadCourseThumbnail = async (): Promise<string | null> => {
    if (!courseThumbnail || !userProfile) return null;
    
    try {
      // Create a unique file path
      const fileExt = courseThumbnail.name.split('.').pop();
      const filePath = `courses/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('courses')
        .upload(filePath, courseThumbnail, {
          cacheControl: '3600',
          upsert: true,
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('courses')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      setCourseErrors(prev => ({ ...prev, thumbnail: 'Failed to upload image' }));
      return null;
    }
  };
  
  // Validate course form
  const validateCourseForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!courseFormData.title.trim()) {
      errors.title = 'Title is required';
    } else if (courseFormData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    if (!courseFormData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (courseFormData.duration_hours <= 0) {
      errors.duration_hours = 'Duration must be greater than 0';
    }
    
    setCourseErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle course form submission
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) return;
    if (!validateCourseForm()) return;
    
    try {
      setCourseSubmitting(true);
      
      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (courseThumbnail) {
        thumbnailUrl = await uploadCourseThumbnail();
      }
      
      // Create the course
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: courseFormData.title,
            description: courseFormData.description,
            difficulty_level: courseFormData.difficulty_level,
            duration_hours: courseFormData.duration_hours,
            language: courseFormData.language,
            has_certificate: courseFormData.has_certificate,
            is_featured: courseFormData.is_featured,
            thumbnail_url: thumbnailUrl,
            instructor_id: userProfile.id,
            created_by: userProfile.id,
          }
        ])
        .select('id');
      
      if (error) throw error;
      
      // Show success message and reset form
      setCourseSuccess(true);
      setCourseFormData({
        title: '',
        description: '',
        difficulty_level: 'Beginner',
        duration_hours: 0,
        language: 'English',
        has_certificate: false,
        is_featured: false
      });
      setCourseThumbnail(null);
      setThumbnailPreview(null);
      
      // Refresh courses after a short delay
      setTimeout(() => {
        void fetchUserCourses();
        setCourseSuccess(false);
        setShowCourseModal(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error creating course:', error);
      setCourseErrors(prev => ({ ...prev, general: 'Failed to create course' }));
    } finally {
      setCourseSubmitting(false);
    }
  };
  
  // Fetch courses for the current user
  const fetchUserCourses = async () => {
    if (!userProfile) return;
    
    try {
      setLoadingCourses(true);
      
      // Different queries based on user role
      if (userProfile.role === 'student') {
        // For students, get enrolled courses
        const { data, error } = await supabase
          .from('course_enrollments')
          .select(`
            course_id,
            courses:course_id(
              id, title, description, rating, 
              review_count, student_count, duration_hours, 
              difficulty_level, thumbnail_url, language, has_certificate
            )
          `)
          .eq('user_id', userProfile.id);
          
        if (error) throw error;
        
        // Extract the courses from the enrollments data
        const coursesData = data?.map((enrollment: any) => enrollment.courses) || [];
        setUserCourses(coursesData);
      } else if (userProfile.role === 'teacher') {
        // For teachers, get courses they teach
        const { data, error } = await supabase
          .from('courses')
          .select('id, title, description, rating, review_count, student_count, duration_hours, difficulty_level, thumbnail_url, language, has_certificate')
          .eq('instructor_id', userProfile.id);
          
        if (error) throw error;
        setUserCourses(data || []);
      } else {
        // For parents or other roles, show a different view or empty state
        setUserCourses([]);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setUserCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
          <span className="text-sm font-medium text-gray-700">Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with navigation */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={handleBack}
              className="mb-2 flex items-center text-sm font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
              aria-label="Go back"
              data-component-name="Profile"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Dashboard
            </button>
            
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your personal information and account settings
            </p>
          </div>
        </div>
        
        {/* Success message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center text-emerald-700 animate-fadeIn">
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}
        
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Profile picture and role info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="flex flex-col items-center">
                {/* Profile picture with upload */}
                <div className="relative group mb-6">
                  <div className="w-36 h-36 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg ring-2 ring-emerald-50">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                        <User className="w-16 h-16 text-emerald-300" />
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2.5 rounded-full shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors group-hover:scale-105 transform duration-200"
                    aria-label="Change profile picture"
                  >
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  aria-label="Upload profile picture"
                />
                
                {errors.avatar && (
                  <div className="mt-2 p-2 bg-red-50 rounded-md text-center w-full">
                    <p className="text-sm text-red-600 font-medium">{errors.avatar}</p>
                  </div>
                )}
                
                {isUploading && (
                  <div className="mt-4 w-full max-w-xs">
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-1">
                      Uploading: {uploadProgress}%
                    </p>
                  </div>
                )}
                
                {/* User role badge */}
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-bold text-gray-900">
                    {userProfile?.full_name || userProfile?.name || 'User'}
                  </h2>
                  <div className="mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    {userProfile?.role === 'teacher' ? (
                      <>
                        <GraduationCap className="w-4 h-4 mr-1" />
                        Teacher
                      </>
                    ) : userProfile?.role === 'student' ? (
                      <>
                        <Book className="w-4 h-4 mr-1" />
                        Student
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-1" />
                        Parent
                      </>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    ID: {userProfile?.identifier_code}
                  </p>
                </div>
                
                {/* Quick stats */}
                <div className="mt-6 w-full pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Member since</p>
                      <p className="text-sm font-medium text-gray-900">
                        {userProfile?.created_at ? (
                          <span className="flex items-center justify-center mt-1">
                            <Calendar className="w-4 h-4 mr-1 text-emerald-500" />
                            {new Date(userProfile.created_at).toLocaleDateString()}
                          </span>
                        ) : 'N/A'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Last updated</p>
                      <p className="text-sm font-medium text-gray-900">
                        {userProfile?.updated_at ? (
                          <span className="flex items-center justify-center mt-1">
                            <Clock className="w-4 h-4 mr-1 text-emerald-500" />
                            {new Date(userProfile.updated_at).toLocaleDateString()}
                          </span>
                        ) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Tabs and form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex -mb-px" data-component-name="Profile">
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'profile' 
                      ? 'border-emerald-500 text-emerald-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Profile Information
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('courses')}
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'courses' 
                      ? 'border-emerald-500 text-emerald-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Courses
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('account')}
                    className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'account' 
                      ? 'border-emerald-500 text-emerald-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                  >
                    Account Details
                  </button>
                </div>
              </div>
              
              {/* Tab content */}
              <div className="p-6">
                {activeTab === 'profile' ? (
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                      {/* Full name field */}
                      <div>
                        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                          Full Name
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="text"
                            name="full_name"
                            id="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            className={`block w-full rounded-md py-3 px-4 border ${errors.full_name 
                              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'}`}
                            placeholder="Your full name"
                            maxLength={100}
                          />
                        </div>
                        {errors.full_name && (
                          <p className="mt-2 text-sm text-red-600">{errors.full_name}</p>
                        )}
                      </div>
                      
                      {/* Email field */}
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`block w-full rounded-md py-3 px-4 bg-gray-50 border ${errors.email 
                              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-300'}`}
                            placeholder="your.email@example.com"
                            disabled
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Email address cannot be changed here. Contact support for assistance.</p>
                        {errors.email && (
                          <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>
                      
                      {/* Subject/Grade info (read-only) */}
                      {userProfile?.role === 'teacher' && userProfile.subject && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Subject</label>
                          <div className="mt-1 py-3 px-4 bg-gray-50 rounded-md border border-gray-200">
                            {userProfile.subject}
                          </div>
                        </div>
                      )}
                      
                      {userProfile?.role === 'student' && userProfile.grade && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Grade</label>
                          <div className="mt-1 py-3 px-4 bg-gray-50 rounded-md border border-gray-200">
                            {userProfile.grade}
                          </div>
                        </div>
                      )}
                      
                      {/* Action buttons */}
                      <div className="flex justify-end space-x-3 pt-6 border-t">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting || !hasChanges}
                          className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors ${isSubmitting || !hasChanges 
                            ? 'bg-emerald-400 cursor-not-allowed' 
                            : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center">
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </span>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                ) : activeTab === 'courses' ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        {userProfile?.role === 'teacher' ? 'Courses You Teach' : 'Your Enrolled Courses'}
                      </h3>
                      {userProfile?.role === 'teacher' && (
                        <button
                          type="button"
                          onClick={() => setShowCourseModal(true)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
                        >
                          Add Course
                          <PlusCircle className="ml-1.5 w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {loadingCourses ? (
                      <div className="py-12 flex justify-center items-center">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        <span className="ml-2 text-gray-600">Loading courses...</span>
                      </div>
                    ) : userCourses.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          {userProfile?.role === 'teacher' 
                            ? 'You don\'t have any courses yet' 
                            : 'You\'re not enrolled in any courses yet'}
                        </h4>
                        <p className="text-gray-500 mb-6">
                          {userProfile?.role === 'teacher'
                            ? 'Create your first course to share your knowledge with students.'
                            : 'Browse our course catalog and enroll in courses to start learning.'}
                        </p>
                        {userProfile?.role === 'teacher' ? (
                          <button
                            type="button"
                            onClick={() => setShowCourseModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            Create a Course
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </button>
                        ) : (
                          <Link 
                            to="/courses"
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          >
                            Browse Courses
                            <ExternalLink className="ml-2 w-4 h-4" />
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userCourses.map((course: any) => (
                          <div key={course.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Course thumbnail */}
                            <div className="relative h-40 bg-gray-100">
                              {course.thumbnail_url ? (
                                <img 
                                  src={course.thumbnail_url} 
                                  alt={course.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                                  <Book className="w-12 h-12 text-emerald-200" />
                                </div>
                              )}
                              
                              {/* Difficulty badge */}
                              {course.difficulty_level && (
                                <div className="absolute top-2 right-2 bg-white bg-opacity-90 text-xs font-medium px-2 py-1 rounded-full">
                                  {course.difficulty_level === 'Beginner' ? (
                                    <span className="text-green-600">{course.difficulty_level}</span>
                                  ) : course.difficulty_level === 'Intermediate' ? (
                                    <span className="text-yellow-600">{course.difficulty_level}</span>
                                  ) : (
                                    <span className="text-red-600">{course.difficulty_level}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {/* Course details */}
                            <div className="p-4">
                              <h4 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">{course.title}</h4>
                              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>
                              
                              {/* Course stats */}
                              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                {course.rating && (
                                  <div className="flex items-center">
                                    <Star className="w-3.5 h-3.5 text-yellow-500 mr-1" />
                                    <span>{course.rating} ({course.review_count || 0} reviews)</span>
                                  </div>
                                )}
                                
                                {course.student_count !== null && (
                                  <div className="flex items-center">
                                    <Users className="w-3.5 h-3.5 text-gray-400 mr-1" />
                                    <span>{course.student_count} students</span>
                                  </div>
                                )}
                                
                                {course.duration_hours && (
                                  <div className="flex items-center">
                                    <Clock3 className="w-3.5 h-3.5 text-gray-400 mr-1" />
                                    <span>{course.duration_hours} hours</span>
                                  </div>
                                )}
                                
                                {course.language && (
                                  <div className="flex items-center">
                                    <span className="text-gray-400 mr-1">🌐</span>
                                    <span>{course.language}</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Certificate badge */}
                              {course.has_certificate && (
                                <div className="mt-3 flex items-center text-xs text-emerald-600">
                                  <Award className="w-3.5 h-3.5 mr-1" />
                                  <span>Certificate of completion</span>
                                </div>
                              )}
                              
                              {/* Action button */}
                              <div className="mt-4 flex justify-end">
                                <Link 
                                  to={userProfile?.role === 'teacher' ? `/manage-course/${course.id}` : `/courses/${course.id}`}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                >
                                  {userProfile?.role === 'teacher' ? 'Manage Course' : 'Continue Learning'}
                                  <ArrowLeft className="ml-1 w-3 h-3 rotate-180" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Account settings are managed by your institution administrator. Contact support for assistance.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="rounded-md bg-gray-50 p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500">User ID</p>
                          <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded overflow-x-auto">
                            {userProfile?.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Identifier Code</p>
                          <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                            {userProfile?.identifier_code}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Role</p>
                          <p className="mt-1 text-sm text-gray-900">{userProfile?.role}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="mt-1 text-sm text-gray-900">{userProfile?.email || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Created At</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleString() : 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Last Updated</p>
                          <p className="mt-1 text-sm text-gray-900">
                            {userProfile?.updated_at ? new Date(userProfile.updated_at).toLocaleString() : 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Creation Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
              aria-hidden="true"
              onClick={() => !courseSubmitting && setShowCourseModal(false)}
            ></div>
            
            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  onClick={() => !courseSubmitting && setShowCourseModal(false)}
                  disabled={courseSubmitting}
                >
                  <span className="sr-only">Close</span>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Create New Course
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Fill in the details below to create a new course. You can add modules and lessons after creating the course.
                    </p>
                    
                    {courseSuccess && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700">
                        <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>Course created successfully!</span>
                      </div>
                    )}
                    
                    {courseErrors.general && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
                        <Info className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{courseErrors.general}</span>
                      </div>
                    )}
                    
                    <form onSubmit={handleCourseSubmit} className="mt-4">
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                        {/* Course thumbnail */}
                        <div className="sm:col-span-6">
                          <label className="block text-sm font-medium text-gray-700">
                            Course Thumbnail
                          </label>
                          <div className="mt-1 flex items-center">
                            <div className="relative group w-full">
                              <div 
                                className="flex justify-center items-center border-2 border-gray-300 border-dashed rounded-md h-48 w-full overflow-hidden bg-gray-50 hover:border-emerald-500 transition-colors cursor-pointer"
                                onClick={() => courseThumbnailRef.current?.click()}
                              >
                                {thumbnailPreview ? (
                                  <img 
                                    src={thumbnailPreview} 
                                    alt="Course thumbnail preview" 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="space-y-1 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-300" />
                                    <div className="text-sm text-gray-600">
                                      <label
                                        htmlFor="thumbnail"
                                        className="relative cursor-pointer rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                                      >
                                        <span>Upload a thumbnail</span>
                                      </label>
                                      <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                  </div>
                                )}
                              </div>
                              
                              <input
                                type="file"
                                ref={courseThumbnailRef}
                                onChange={handleThumbnailChange}
                                accept="image/jpeg,image/png,image/gif"
                                className="hidden"
                                id="thumbnail"
                              />
                            </div>
                          </div>
                          {courseErrors.thumbnail && (
                            <p className="mt-2 text-sm text-red-600">{courseErrors.thumbnail}</p>
                          )}
                        </div>
                        
                        {/* Course title */}
                        <div className="sm:col-span-6">
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Course Title *
                          </label>
                          <div className="mt-1">
                            <input
                              type="text"
                              name="title"
                              id="title"
                              value={courseFormData.title}
                              onChange={handleCourseInputChange}
                              placeholder="Enter a descriptive title for your course"
                              className={`block w-full rounded-md sm:text-sm border-2 py-3 h-12 ${courseErrors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300'}`}
                              maxLength={100}
                              required
                            />
                          </div>
                          {courseErrors.title && (
                            <p className="mt-2 text-sm text-red-600">{courseErrors.title}</p>
                          )}
                        </div>
                        
                        {/* Course description */}
                        <div className="sm:col-span-6">
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description *
                          </label>
                          <div className="mt-1">
                            <textarea
                              id="description"
                              name="description"
                              rows={4}
                              value={courseFormData.description}
                              onChange={handleCourseInputChange}
                              placeholder="Describe what students will learn in this course"
                              className={`block w-full rounded-md sm:text-sm border-2 py-3 ${courseErrors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300'}`}
                              required
                            />
                          </div>
                          {courseErrors.description && (
                            <p className="mt-2 text-sm text-red-600">{courseErrors.description}</p>
                          )}
                        </div>
                        
                        {/* Difficulty level */}
                        <div className="sm:col-span-3">
                          <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700">
                            Difficulty Level
                          </label>
                          <div className="mt-1">
                            <select
                              id="difficulty_level"
                              name="difficulty_level"
                              value={courseFormData.difficulty_level}
                              onChange={handleCourseInputChange}
                              className="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-colors sm:text-sm py-3 h-12"
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* Duration hours */}
                        <div className="sm:col-span-3">
                          <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700">
                            Duration (hours) *
                          </label>
                          <div className="mt-1">
                            <input
                              type="number"
                              name="duration_hours"
                              id="duration_hours"
                              min="1"
                              value={courseFormData.duration_hours}
                              onChange={handleCourseInputChange}
                              placeholder="Estimated hours to complete"
                              className={`block w-full rounded-md sm:text-sm border-2 py-3 h-12 ${courseErrors.duration_hours ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300'}`}
                              required
                            />
                          </div>
                          {courseErrors.duration_hours && (
                            <p className="mt-2 text-sm text-red-600">{courseErrors.duration_hours}</p>
                          )}
                        </div>
                        
                        {/* Language */}
                        <div className="sm:col-span-3">
                          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                            Language
                          </label>
                          <div className="mt-1">
                            <select
                              id="language"
                              name="language"
                              value={courseFormData.language}
                              onChange={handleCourseInputChange}
                              className="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-300 transition-colors sm:text-sm py-4 h-16"
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
                        
                        {/* Certificate checkbox */}
                        <div className="sm:col-span-3">
                          <div className="flex items-center">
                            <input
                              id="has_certificate"
                              name="has_certificate"
                              type="checkbox"
                              checked={courseFormData.has_certificate}
                              onChange={handleCourseInputChange}
                              className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                            />
                            <label htmlFor="has_certificate" className="ml-2 block text-sm text-gray-700">
                              Offers Certificate
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-end">
                        <button
                          type="button"
                          className="mr-3 inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                          onClick={() => setShowCourseModal(false)}
                          disabled={courseSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 disabled:cursor-not-allowed"
                          disabled={courseSubmitting}
                        >
                          {courseSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : 'Create Course'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
