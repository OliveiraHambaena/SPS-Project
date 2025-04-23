-- Create courses table for SPS PRO
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
    category TEXT,
    duration INTEGER,
    max_students INTEGER,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    course_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow teachers to see only their own courses
CREATE POLICY "Teachers can view their own courses" 
ON public.courses 
FOR SELECT 
USING (auth.uid() = teacher_id);

-- Create policy to allow teachers to insert their own courses
CREATE POLICY "Teachers can insert their own courses" 
ON public.courses 
FOR INSERT 
WITH CHECK (auth.uid() = teacher_id);

-- Create policy to allow teachers to update their own courses
CREATE POLICY "Teachers can update their own courses" 
ON public.courses 
FOR UPDATE 
USING (auth.uid() = teacher_id);

-- Create policy to allow teachers to delete their own courses
CREATE POLICY "Teachers can delete their own courses" 
ON public.courses 
FOR DELETE 
USING (auth.uid() = teacher_id);

-- Create index for faster queries
CREATE INDEX courses_teacher_id_idx ON public.courses(teacher_id);
CREATE INDEX courses_status_idx ON public.courses(status);
CREATE INDEX courses_category_idx ON public.courses(category);

-- Create view for users with additional fields
CREATE OR REPLACE VIEW public.users_view AS
SELECT
  users.id,
  users.name,
  users.role,
  users.identifier_code,
  users.subject,
  users.grade,
  users.avatar_url,
  users.phone,
  users.created_at,
  users.updated_at
FROM
  users;

-- Create view for courses with teacher information
CREATE OR REPLACE VIEW public.courses_with_teacher AS
SELECT 
    c.*,
    u.name AS teacher_name
FROM 
    public.courses c
JOIN 
    public.users u ON c.teacher_id = u.id;

-- Grant access to authenticated users
GRANT SELECT ON public.courses TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.courses TO authenticated;
GRANT SELECT ON public.courses_with_teacher TO authenticated;
GRANT SELECT ON public.users_view TO authenticated;

-- Add comment to table
COMMENT ON TABLE public.courses IS 'Stores course information created by teachers';
