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
  Video,
  Award,
  Clock,
  Globe,
  BarChart2,
  Loader2
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
                onClick={() => setActiveTab('students')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'students'
                    ? 'border-b-2 border-emerald-500 text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Students
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'analytics'
                    ? 'border-b-2 border-emerald-500 text-emerald-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  Analytics
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
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Arabic">Arabic</option>
                            <option value="Russian">Russian</option>
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
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Student Management</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    This feature is coming soon. You'll be able to view and manage students enrolled in your course.
                  </p>
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
    </div>
  );
};

export default ManageCourse;
