import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const TestStudentList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFirstCourse = async () => {
      try {
        // Get the first available course
        const { data, error } = await supabase
          .from('courses')
          .select('id')
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          setCourseId(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchFirstCourse();
  }, []);

  useEffect(() => {
    if (courseId) {
      // Navigate to the course management page with the students tab active
      navigate(`/manage-course/${courseId}?tab=students`);
    }
  }, [courseId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        {loading ? (
          <div>
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Finding a course to display student enrollments...</p>
          </div>
        ) : courseId ? (
          <p className="text-gray-600">Redirecting to course student list...</p>
        ) : (
          <div>
            <p className="text-red-500 mb-4">No courses found. Please create a course first.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestStudentList;
