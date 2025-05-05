-- Create courses table
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  rating DECIMAL(2,1),
  review_count INTEGER DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  duration_hours INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('Beginner', 'Intermediate', 'Advanced')),
  instructor_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TEXT,
  language TEXT DEFAULT 'English',
  has_certificate BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  video_preview_url TEXT
);

-- Create course_modules table for course content structure
CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_lessons table
CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  duration_minutes INTEGER,
  is_free BOOLEAN DEFAULT false,
  video_url TEXT,
  position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_reviews table
CREATE TABLE course_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create course_enrollments table to track student enrollments
CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);



-- Create RLS policies for courses table
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policy for viewing courses (public)
CREATE POLICY "Courses are viewable by everyone" 
ON courses FOR SELECT 
USING (true);

-- Policy for inserting courses (instructors only)
CREATE POLICY "Instructors can create courses" 
ON courses FOR INSERT 
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = auth.uid() AND users.role = 'teacher'
));

-- Policy for updating courses (course owner only)
CREATE POLICY "Instructors can update their own courses" 
ON courses FOR UPDATE 
TO authenticated
USING (instructor_id = auth.uid() OR created_by = auth.uid());

-- Create indexes for performance
CREATE INDEX courses_instructor_id_idx ON courses(instructor_id);
CREATE INDEX courses_created_by_idx ON courses(created_by);
CREATE INDEX course_modules_course_id_idx ON course_modules(course_id);
CREATE INDEX course_lessons_module_id_idx ON course_lessons(module_id);
CREATE INDEX course_reviews_course_id_idx ON course_reviews(course_id);
CREATE INDEX course_enrollments_user_id_idx ON course_enrollments(user_id);
CREATE INDEX course_enrollments_course_id_idx ON course_enrollments(course_id);
