import React, { useState } from 'react';
import Dashboard from './Dashboard';
import { Award, Download, Eye, Medal, Calendar, BookOpen, ChevronRight, Search, Clock } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  course: string;
  issueDate: string;
  expiryDate?: string;
  credentialId: string;
  imageUrl: string;
  status: 'completed' | 'in-progress' | 'expired';
}

export default function Certificates() {
  // Sample certificates data
  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      title: 'Introduction to Web Development',
      course: 'Web Development Fundamentals',
      issueDate: '2025-03-15',
      credentialId: 'WD-2025-7842',
      imageUrl: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Advanced React Patterns',
      course: 'Modern Frontend Development',
      issueDate: '2025-04-20',
      credentialId: 'MFD-2025-9371',
      imageUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Data Science Fundamentals',
      course: 'Introduction to Data Science',
      issueDate: '2025-01-10',
      expiryDate: '2026-01-10',
      credentialId: 'DS-2025-4512',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
      status: 'in-progress'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in-progress' | 'expired'>('all');

  // Filter certificates based on search query and status filter
  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cert.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cert.credentialId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dashboard>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        {/* Header with title and description */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <Award className="w-7 h-7 mr-2 text-emerald-600" />
            My Certificates
          </h1>
          <p className="text-gray-600">
            View and download your earned certificates and achievements
          </p>
        </div>

        {/* Search and filter bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Search certificates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="sm:w-48">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">All Certificates</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Certificates grid */}
        {filteredCertificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <div key={certificate.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
                {/* Certificate image */}
                <div className="h-48 bg-gradient-to-r from-emerald-500 to-teal-500 relative overflow-hidden">
                  <img 
                    src={`${certificate.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80`} 
                    alt={certificate.title} 
                    className="w-full h-full object-cover mix-blend-overlay"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-4">
                      <Award className="w-12 h-12 text-emerald-600" />
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(certificate.status)}`}>
                      {certificate.status === 'completed' ? 'Completed' : 
                       certificate.status === 'in-progress' ? 'In Progress' : 'Expired'}
                    </span>
                  </div>
                </div>
                
                {/* Certificate details */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{certificate.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{certificate.course}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">Issued: {formatDate(certificate.issueDate)}</span>
                    </div>
                    {certificate.expiryDate && (
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-gray-600">Expires: {formatDate(certificate.expiryDate)}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <Medal className="w-4 h-4 text-gray-500 mr-2" />
                      <span className="text-gray-600">ID: {certificate.credentialId}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-3 border-t border-gray-100">
                    <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No certificates found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterStatus !== 'all' ? 
                'Try adjusting your search or filter criteria.' : 
                'Complete courses to earn certificates and showcase your achievements.'}
            </p>
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse Courses
            </button>
          </div>
        )}
      </div>
    </Dashboard>
  );
}
