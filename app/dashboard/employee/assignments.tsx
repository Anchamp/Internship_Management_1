// app/dashboard/employee/assignments.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Calendar,
  Users,
  Star,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Send,
  Link,
  Upload,
  Search,
  X,
  Download,
  ExternalLink,
} from "lucide-react";

interface Assignment {
  _id: string;
  assignmentName: string;
  description: string;
  assignmentFrom: string;
  assignmentTeamName: string;
  assignedTo: string[];
  deadline: string;
  status: string;
  instructions?: string;
  submissions: Array<{
    internUsername: string;
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
  }>;
  submissionCount: number;
  isOverdue: boolean;
  createdAt: string;
}

export default function EmployeeAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "posted" | "submitted" | "reviewed">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [newAssignment, setNewAssignment] = useState({
    assignmentName: "",
    description: "",
    assignmentTeamName: "",
    assignedTo: "all",
    deadline: "",
    instructions: "",
  });

  const [reviewData, setReviewData] = useState({
    rating: 5,
    comments: "",
  });

  useEffect(() => {
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

  const handleCreateAssignment = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);

      if (!newAssignment.assignmentName.trim() || !newAssignment.description.trim() || 
          !newAssignment.assignmentTeamName.trim() || !newAssignment.deadline) {
        setError("Please fill in all required fields");
        return;
      }

      const response = await fetch("/api/assignments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newAssignment,
          assignmentFrom: user.username,
          organizationName: user.organizationName,
          organizationId: user.organizationId,
          status: 'pending'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create assignment");
      }

      setShowCreateModal(false);
      setNewAssignment({
        assignmentName: "",
        description: "",
        assignmentTeamName: "",
        assignedTo: "all",
        deadline: "",
        instructions: "",
      });
      
      fetchAssignments();
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusUpdate = async (assignmentId: string, status: string) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      const user = JSON.parse(userStr);

      const response = await fetch("/api/assignments/status", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId,
          status,
          username: user.username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      fetchAssignments();
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReviewSubmission = async () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr || !selectedAssignment || !selectedSubmission) return;

      const user = JSON.parse(userStr);

      if (!reviewData.comments.trim()) {
        setError("Please provide feedback comments");
        return;
      }

      const response = await fetch("/api/assignments/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId: selectedAssignment._id,
          internUsername: selectedSubmission.internUsername,
          rating: reviewData.rating,
          comments: reviewData.comments,
          reviewerUsername: user.username,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      setShowReviewModal(false);
      setSelectedAssignment(null);
      setSelectedSubmission(null);
      setReviewData({ rating: 5, comments: "" });
      
      fetchAssignments();
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'posted':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-orange-100 text-orange-800';
      case 'reviewed':
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Edit className="h-4 w-4" />;
      case 'posted':
      case 'active':
        return <Send className="h-4 w-4" />;
      case 'submitted':
        return <Clock className="h-4 w-4" />;
      case 'under_review':
        return <Eye className="h-4 w-4" />;
      case 'reviewed':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const statusMatch = activeTab === "all" || 
      (activeTab === "pending" && assignment.status === "pending") ||
      (activeTab === "posted" && (assignment.status === "posted" || assignment.status === "active")) ||
      (activeTab === "submitted" && (assignment.status === "submitted" || assignment.status === "under_review")) ||
      (activeTab === "reviewed" && (assignment.status === "reviewed" || assignment.status === "completed"));
    
    const searchMatch = assignment.assignmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       assignment.assignmentTeamName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
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
          <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
          <p className="text-gray-600">Create, manage, and review assignments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Assignment</span>
        </button>
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
            {['all', 'pending', 'posted', 'submitted', 'reviewed'].map((tab) => (
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
            <div className="bg-yellow-100 p-2 rounded-lg mr-3">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-xl font-bold">
                {assignments.filter(a => a.status === 'submitted' || a.status === 'under_review').length}
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
                {assignments.filter(a => a.status === 'reviewed' || a.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-xl font-bold">
                {assignments.filter(a => a.isOverdue && !['reviewed', 'completed'].includes(a.status)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAssignments.map((assignment) => (
          <div key={assignment._id} className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
            assignment.isOverdue && !['reviewed', 'completed'].includes(assignment.status) ? 'border-red-200' : ''
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
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(assignment.status)}`}>
                  {getStatusIcon(assignment.status)}
                  <span>{assignment.status}</span>
                </span>
              </div>

              {/* Assignment Description */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                {assignment.description}
              </p>

              {/* Assignment Details */}
              <div className="space-y-2 mb-4">
                <div className={`flex items-center text-sm ${
                  assignment.isOverdue && !['reviewed', 'completed'].includes(assignment.status) 
                    ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
                  {assignment.isOverdue && !['reviewed', 'completed'].includes(assignment.status) && (
                    <span className="ml-2 text-xs text-red-600 font-medium">(Overdue)</span>
                  )}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  <span>{assignment.submissionCount} submission(s)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 mb-4">
                {assignment.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(assignment._id, 'posted')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Post Assignment
                  </button>
                )}
                
                {assignment.status === 'submitted' && (
                  <button
                    onClick={() => handleStatusUpdate(assignment._id, 'under_review')}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Start Review
                  </button>
                )}

                {assignment.submissionCount > 0 && (
                  <button
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setShowSubmissionsModal(true);
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    View Submissions
                  </button>
                )}
              </div>

              {/* Submissions Preview */}
              {assignment.submissions.length > 0 && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Submissions</h4>
                  <div className="space-y-2">
                    {assignment.submissions.slice(0, 2).map((submission, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">{submission.internUsername}</span>
                          {submission.isLateSubmission && (
                            <span className="text-xs text-red-600 font-medium">Late</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {submission.submissionType === 'pdf' ? (
                            <FileText className="h-3 w-3 text-red-500" />
                          ) : (
                            <Link className="h-3 w-3 text-blue-500" />
                          )}
                          {submission.mentorReview ? (
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              <span className="text-xs">{submission.mentorReview.rating}</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedAssignment(assignment);
                                setSelectedSubmission(submission);
                                setShowReviewModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600 mb-4">
            {activeTab === "all" 
              ? "Create your first assignment to get started"
              : `No assignments with status "${activeTab}"`}
          </p>
          {activeTab === "all" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Create Assignment
            </button>
          )}
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Create New Assignment</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError("");
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAssignment.assignmentName}
                    onChange={(e) => setNewAssignment({ ...newAssignment, assignmentName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter assignment name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newAssignment.description}
                    onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Describe the assignment requirements and objectives"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Team <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newAssignment.assignmentTeamName}
                    onChange={(e) => setNewAssignment({ ...newAssignment, assignmentTeamName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={newAssignment.deadline}
                    onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions (Optional)
                  </label>
                  <textarea
                    value={newAssignment.instructions}
                    onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Additional instructions or guidelines"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAssignment}
                  disabled={!newAssignment.assignmentName.trim() || !newAssignment.description.trim() || 
                           !newAssignment.assignmentTeamName.trim() || !newAssignment.deadline}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Create Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedSubmission && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Review Submission</h2>
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setError("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">Submission Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Student:</span> {selectedSubmission.internUsername}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedSubmission.submissionType === 'pdf' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedSubmission.submissionType.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span> {new Date(selectedSubmission.submittedAt).toLocaleString()}
                    </div>
                    {selectedSubmission.isLateSubmission && (
                      <div className="text-red-600">
                        <span className="font-medium">⚠️ Late Submission</span>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Content:</span>
                      <div className="mt-1">
                        {selectedSubmission.submissionType === 'link' ? (
                          <a
                            href={selectedSubmission.submissionContent}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline break-all"
                          >
                            {selectedSubmission.submissionContent}
                            <ExternalLink className="h-3 w-3 inline ml-1" />
                          </a>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-red-500" />
                            <span>{selectedSubmission.fileName}</span>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5 stars) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewData({ ...reviewData, rating: star })}
                        className={`p-1 rounded transition-colors ${
                          star <= reviewData.rating
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-300 hover:text-gray-400'
                        }`}
                      >
                        <Star className="h-6 w-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comments <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewData.comments}
                    onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Provide detailed feedback on the submission..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setError("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmission}
                  disabled={!reviewData.comments.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Review
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