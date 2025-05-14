-- Insert sample courses
INSERT INTO courses (
  title,
  description,
  rating,
  review_count,
  student_count,
  duration_hours,
  difficulty_level,
  instructor_id,
  created_by,
  language,
  has_certificate,
  is_featured,
  thumbnail_url
)
SELECT
  'Introduction to Web Development',
  'Learn the fundamentals of web development including HTML, CSS, and JavaScript. This course is perfect for beginners with no prior experience.',
  4.8,
  124,
  1500,
  12,
  'Beginner',
  id, -- instructor_id (using the same user as created_by for this example)
  id, -- created_by
  'English',
  true,
  true,
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
FROM users
WHERE role = 'teacher'
LIMIT 1;

INSERT INTO courses (
  title,
  description,
  rating,
  review_count,
  student_count,
  duration_hours,
  difficulty_level,
  instructor_id,
  created_by,
  language,
  has_certificate,
  is_featured,
  thumbnail_url
)
SELECT
  'Advanced JavaScript Concepts',
  'Dive deep into advanced JavaScript concepts including closures, prototypes, async/await, and modern ES6+ features. Ideal for intermediate developers.',
  4.7,
  98,
  850,
  15,
  'Intermediate',
  id, -- instructor_id
  id, -- created_by
  'English',
  true,
  false,
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
FROM users
WHERE role = 'teacher'
LIMIT 1;

INSERT INTO courses (
  title,
  description,
  rating,
  review_count,
  student_count,
  duration_hours,
  difficulty_level,
  instructor_id,
  created_by,
  language,
  has_certificate,
  is_featured,
  thumbnail_url
)
SELECT
  'React for Beginners',
  'Learn React from scratch. Build modern, interactive UIs with the most popular JavaScript library. Includes hooks, context API, and more.',
  4.9,
  210,
  2200,
  18,
  'Beginner',
  id, -- instructor_id
  id, -- created_by
  'English',
  true,
  true,
  'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
FROM users
WHERE role = 'teacher'
LIMIT 1;

INSERT INTO courses (
  title,
  description,
  rating,
  review_count,
  student_count,
  duration_hours,
  difficulty_level,
  instructor_id,
  created_by,
  language,
  has_certificate,
  is_featured,
  thumbnail_url
)
SELECT
  'Full Stack Development with Node.js and Express',
  'Build complete web applications with Node.js and Express. Learn server-side JavaScript, RESTful APIs, MongoDB, and how to connect with front-end frameworks.',
  4.6,
  156,
  1250,
  24,
  'Intermediate',
  id, -- instructor_id
  id, -- created_by
  'English',
  true,
  false,
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
FROM users
WHERE role = 'teacher'
LIMIT 1;

INSERT INTO courses (
  title,
  description,
  rating,
  review_count,
  student_count,
  duration_hours,
  difficulty_level,
  instructor_id,
  created_by,
  language,
  has_certificate,
  is_featured,
  thumbnail_url
)
SELECT
  'Python for Data Science',
  'Master Python for data analysis and visualization. Learn pandas, NumPy, Matplotlib, and how to work with real-world datasets to extract insights.',
  4.8,
  185,
  1800,
  20,
  'Intermediate',
  id, -- instructor_id
  id, -- created_by
  'English',
  true,
  true,
  'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80'
FROM users
WHERE role = 'teacher'
LIMIT 1;
