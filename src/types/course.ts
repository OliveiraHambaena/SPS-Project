export interface Course {
  id: string
  title: string
  description: string
  rating?: number
  review_count?: number
  student_count?: number
  duration_hours?: number
  difficulty_level?: 'Beginner' | 'Intermediate' | 'Advanced'
  instructor_id: string
  created_by: string
  created_at?: string
  updated_at?: string
  last_updated?: string
  language?: string
  has_certificate?: boolean
  is_featured?: boolean
  thumbnail_url?: string
  video_preview_url?: string
}

export interface CourseModule {
  id: string
  course_id: string
  title: string
  position: number
  created_at?: string
  updated_at?: string
  lessons?: CourseLesson[]
}

export interface CourseLesson {
  id: string
  module_id: string
  title: string
  duration_minutes?: number
  is_free?: boolean
  video_url?: string
  position: number
  created_at?: string
  updated_at?: string
}

export interface CourseReview {
  id: string
  course_id: string
  user_id?: string
  rating: number
  comment?: string
  created_at?: string
  updated_at?: string
  // Additional fields that might be joined from users table
  user_full_name?: string
  user_avatar_url?: string
}

export interface CourseEnrollment {
  id: string
  course_id: string
  user_id: string
  progress_percentage?: number
  last_accessed_at?: string
  created_at?: string
  updated_at?: string
}



export interface CourseWithDetails extends Course {
  modules?: CourseModule[]
  reviews?: CourseReview[]
  instructor?: {
    id: string
    full_name?: string
    avatar_url?: string
    bio?: string
  }
  creator?: {
    id: string
    full_name?: string
    avatar_url?: string
  }
}
