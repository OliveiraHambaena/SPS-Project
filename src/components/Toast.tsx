import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ 
  message, 
  type, 
  isVisible, 
  onClose, 
  duration = 5000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div 
        className={`flex items-center p-4 rounded-lg shadow-lg ${
          type === 'success' 
            ? 'bg-emerald-50 border-l-4 border-emerald-500' 
            : 'bg-red-50 border-l-4 border-red-500'
        }`}
      >
        <div className="flex-shrink-0 mr-3">
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
        
        <div className="flex-1 mr-2">
          <p className={`text-sm font-medium ${
            type === 'success' ? 'text-emerald-800' : 'text-red-800'
          }`}>
            {message}
          </p>
        </div>
        
        <button 
          onClick={onClose}
          className={`p-1 rounded-full hover:bg-opacity-20 ${
            type === 'success' ? 'hover:bg-emerald-200' : 'hover:bg-red-200'
          }`}
        >
          <X className={`w-4 h-4 ${
            type === 'success' ? 'text-emerald-500' : 'text-red-500'
          }`} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
