import React from 'react';
import { format } from 'date-fns';
import { 
  Tag, 
  Clock, 
  Users, 
  Pencil, 
  Trash2, 
  BookOpen,
  Eye,
  ChevronRight
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  created_at: string;
  teacher_id: string;
  status: 'draft' | 'published';
  category?: string;
  duration?: number;
  max_students?: number;
  level?: 'beginner' | 'intermediate' | 'advanced';
  course_image_url?: string;
}

interface CourseCardProps {
  course: Course;
  onEdit: (courseId: string) => void;
  onDelete: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit, onDelete }) => {
  // Format the date
  const formattedDate = format(new Date(course.created_at), 'M/d/yyyy');
  
  // Get status color
  const getStatusColor = (status: string) => {
    return status === 'published' 
      ? 'bg-emerald-100 text-emerald-800' 
      : 'bg-amber-100 text-amber-800';
  };
  
  // Get level color
  const getLevelColor = (level?: string) => {
    switch(level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-purple-100 text-purple-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Course Image */}
      <div className="relative">
        {course.course_image_url ? (
          <img 
            src={course.course_image_url} 
            alt={course.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(course.status)}`}>
            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
          </span>
        </div>
      </div>
      
      {/* Course Content */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
              {course.title}
            </h4>
            
            {/* Course Description */}
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {course.description}
            </p>
          </div>
        </div>
        
        {/* Course Metadata */}
        <div className="flex flex-wrap gap-2 mt-4">
          {course.category && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
              <Tag className="w-3 h-3 mr-1" />
              {course.category}
            </span>
          )}
          
          {course.level && (
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getLevelColor(course.level)}`}>
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </span>
          )}
          
          {course.duration !== null && course.duration !== undefined && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
              <Clock className="w-3 h-3 mr-1" />
              {course.duration} hours
            </span>
          )}
          
          {course.max_students !== null && course.max_students !== undefined && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
              <Users className="w-3 h-3 mr-1" />
              {course.max_students} students
            </span>
          )}
        </div>
        
        {/* Created Date */}
        <p className="text-xs text-gray-400 mt-4">
          Created: {formattedDate}
        </p>
        
        {/* Action Buttons */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => onEdit(course.id)}
              className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors flex items-center"
            >
              <Pencil className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">Edit</span>
            </button>
            
            <button 
              onClick={() => onDelete(course.id)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">Delete</span>
            </button>
          </div>
          
          <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">Preview</span>
            <ChevronRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
