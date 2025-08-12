// app/dashboard/intern/assignments.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Link as LinkIcon,
  Star,
  Eye,
  Search,
  Download,
  ExternalLink,
  X,
  Info,
} from "lucide-react";

interface Assignment {
  _id: string;
  assignmentName: string;
  description: string;
  assignmentFrom: string;
  assignmentTeamName: string;
  deadline: string;
  status: string;
  instructions?: string;
  userSubmission?: {
    submissionType: 'link' | 'pdf';
    submissionContent: string;
    fileName?: string;
    submittedAt: string;
    status: string;
    isLateSubmission?: boolean;
    mentorReview?: {
      rating: number;
      comments: string;
      reviewedAt: string;
      reviewedBy: string;
    };
  };
  isOverdue: boolean;
  createdAt: string;
}

export default function InternAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "submitted" | "reviewed">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Submission form state
  const [submissionData, setSubmissionData] = useState({
    submissionType: 'link' as 'link' | 'pdf',
    submissionContent: '',
    file: null as File | null,
  });

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setError("User not found");
        return;
      }

      const user = JSON.parse(userStr);
      
      const response = await fetch(
        `/api/assignments?username=${user.username}&role=${user.role}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch assignments");
      }

      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    try {
      if (!selectedAssignment || !currentUser) return;

      const formData = new FormData();
      formData.append('assignmentId', selectedAssignment._id);
      formData.append('username', currentUser.username);
      formData.append('submissionType', submissionData.submissionType);
      
      if (submissionData.submissionType === 'link') {
        if (!submissionData.submissionContent.trim()) {
          setError('Please enter a valid URL');
          return;
        }
        formData.append('submissionContent', submissionData.submissionContent);
      } else if (submissionData.submissionType === 'pdf' && submissionData.file) {
        formData.append('file', submissionData.file);
        formData.append('submissionContent', '');
      } else {
        setError('Please select a file to upload');
        return;
      }

      const response = await fetch("/api/assignments/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit assignment");
      }

      setShowSubmitModal(false);
      setSelectedAssignment(null);
      setSubmissionData({
        submissionType: 'link',
        submissionContent: '',
        file: null,
      });
      
      fetchAssignments();
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getSubmissionStatus = (assignment: Assignment) => {
    if (!assignment.userSubmission) return 'not_submitted';
    return assignment.userSubmission.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_submitted':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-orange-100 text-orange-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_submitted':
        return <AlertCircle className="h-4 w-4" />;
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      case 'under_review':
        return <Eye className="h-4 w-4" />;
      case 'reviewed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const submissionStatus = getSubmissionStatus(assignment);
    const matchesTab = activeTab === "all" || 
      (activeTab === "pending" && submissionStatus === 'not_submitted') ||
      (activeTab === "submitted" && (submissionStatus === 'submitted' || submissionStatus === 'under_review')) ||
      (activeTab === "reviewed" && submissionStatus === 'reviewed');
    
    const matchesSearch = assignment.assignmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.assignmentTeamName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600">View and submit your assignments</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'submitted', 'reviewed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold">{assignments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-gray-100 p-2 rounded-lg mr-3">
              <AlertCircle className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-xl font-bold">
                {assignments.filter(a => getSubmissionStatus(a) === 'not_submitted').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Review</p>
              <p className="text-xl font-bold">
                {assignments.filter(a => ['submitted', 'under_review'].includes(getSubmissionStatus(a))).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-green-100 p-2 rounded-lg mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-xl font-bold">
                {assignments.filter(a => getSubmissionStatus(a) === 'reviewed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => {
          const submissionStatus = getSubmissionStatus(assignment);
          const isSubmitted = !!assignment.userSubmission;
          const overdue = assignment.isOverdue && !isSubmitted;
          
          return (
            <div key={assignment._id} className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
              overdue ? 'border-red-200' : ''
            }`}>
              <div className="p-6">
                {/* Assignment Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {assignment.assignmentName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Team: {assignment.assignmentTeamName}
                    </p>
                    <p className="text-sm text-gray-600">
                      From: {assignment.assignmentFrom}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(submissionStatus)}`}>
                    {getStatusIcon(submissionStatus)}
                    <span>{submissionStatus.replace('_', ' ')}</span>
                  </span>
                </div>

                {/* Assignment Description */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {assignment.description}
                </p>

                {/* Assignment Details */}
                <div className="space-y-2 mb-4">
                  <div className={`flex items-center text-sm ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                    {overdue && (
                      <span className="ml-2 text-xs font-medium text-red-600">(Overdue)</span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Assigned: {new Date(assignment.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Instructions */}
                {assignment.instructions && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 mb-1">Instructions:</p>
                        <p className="text-sm text-blue-700">{assignment.instructions}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submission Status */}
                {isSubmitted ? (
                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Your Submission</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(submissionStatus)}`}>
                        {submissionStatus.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        {assignment.userSubmission?.submissionType === 'pdf' ? (
                          <FileText className="h-3 w-3 text-red-500 mr-1" />
                        ) : (
                          <LinkIcon className="h-3 w-3 text-blue-500 mr-1" />
                        )}
                        <span className="capitalize">{assignment.userSubmission?.submissionType} submission</span>
                        {assignment.userSubmission?.isLateSubmission && (
                          <span className="ml-2 text-xs text-red-600 font-medium">Late</span>
                        )}
                      </div>
                      <div>
                        Submitted: {new Date(assignment.userSubmission?.submittedAt || '').toLocaleDateString()}
                      </div>
                      
                      {assignment.userSubmission?.mentorReview && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <div className="flex items-center mb-1">
                            <Star className="h-3 w-3 text-yellow-500 mr-1" />
                            <span className="font-medium">{assignment.userSubmission.mentorReview.rating}/5</span>
                            <span className="text-xs text-gray-500 ml-2">
                              by {assignment.userSubmission.mentorReview.reviewedBy}
                            </span>
                          </div>
                          {assignment.userSubmission.mentorReview.comments && (
                            <div className="bg-white p-2 rounded border">
                              <p className="text-xs text-gray-700">{assignment.userSubmission.mentorReview.comments}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center ${
                    overdue ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <Upload className={`h-8 w-8 mx-auto mb-2 ${overdue ? 'text-red-400' : 'text-gray-400'}`} />
                    <p className={`text-sm ${overdue ? 'text-red-600' : 'text-gray-600'}`}>
                      {overdue ? 'Assignment overdue!' : 'Not submitted yet'}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {!isSubmitted && (
                    <button
                      onClick={() => {
                        setSelectedAssignment(assignment);
                        setShowSubmitModal(true);
                      }}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        overdue
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-cyan-600 hover:bg-cyan-700 text-white'
                      }`}
                    >
                      Submit Assignment
                    </button>
                  )}
                  
                  {isSubmitted && assignment.userSubmission?.submissionType === 'link' && (
                    <button
                      onClick={() => window.open(assignment.userSubmission!.submissionContent, '_blank')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View Submission
                    </button>
                  )}
                  
                  {isSubmitted && assignment.userSubmission?.submissionType === 'pdf' && (
                    <button
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download PDF
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600">
            {activeTab === "all" 
              ? "No assignments have been posted yet"
              : `No assignments with status "${activeTab}"`}
          </p>
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Submit Assignment</h2>
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setError("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-gray-900 mb-2">{selectedAssignment.assignmentName}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedAssignment.description}</p>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Due:</span> {new Date(selectedAssignment.deadline).toLocaleString()}
                </div>
                {selectedAssignment.instructions && (
                  <div className="mt-2 text-sm text-blue-800">
                    <span className="font-medium">Instructions:</span> {selectedAssignment.instructions}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="link"
                        checked={submissionData.submissionType === 'link'}
                        onChange={(e) => setSubmissionData({ 
                          ...submissionData, 
                          submissionType: e.target.value as 'link' | 'pdf',
                          file: null,
                          submissionContent: '' 
                        })}
                        className="mr-2"
                      />
                      <LinkIcon className="h-4 w-4 mr-1 text-blue-500" />
                      <span>Link/URL</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        value="pdf"
                        checked={submissionData.submissionType === 'pdf'}
                        onChange={(e) => setSubmissionData({ 
                          ...submissionData, 
                          submissionType: e.target.value as 'link' | 'pdf',
                          file: null,
                          submissionContent: '' 
                        })}
                        className="mr-2"
                      />
                      <FileText className="h-4 w-4 mr-1 text-red-500" />
                      <span>PDF Upload</span>
                    </label>
                  </div>
                </div>

                {submissionData.submissionType === 'link' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Submission URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={submissionData.submissionContent}
                      onChange={(e) => setSubmissionData({ ...submissionData, submissionContent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="https://github.com/username/repo or https://drive.google.com/..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the URL to your project, repository, or shared document
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload PDF File <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 1048576) {
                              setError('File size must be less than 1MB');
                              return;
                            }
                            if (file.type !== 'application/pdf') {
                              setError('Only PDF files are allowed');
                              return;
                            }
                            setSubmissionData({ ...submissionData, file });
                            setError('');
                          }
                        }}
                        className="hidden"
                        id="pdf-upload"
                      />
                      <label htmlFor="pdf-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {submissionData.file ? (
                            <span className="font-medium text-green-600">
                              {submissionData.file.name} ({Math.round(submissionData.file.size / 1024)}KB)
                            </span>
                          ) : (
                            'Click to upload PDF file'
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Maximum file size: 1MB</p>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    setSubmissionData({
                      submissionType: 'link',
                      submissionContent: '',
                      file: null,
                    });
                    setError("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAssignment}
                  disabled={
                    (submissionData.submissionType === 'link' && !submissionData.submissionContent.trim()) ||
                    (submissionData.submissionType === 'pdf' && !submissionData.file)
                  }
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
            <button 
              onClick={() => setError("")}
              className="ml-2 text-red-200 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}