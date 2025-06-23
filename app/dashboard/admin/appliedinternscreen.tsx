"use client";

import React, { useState, useEffect } from "react";
import {
  UserSearch,
  Eye,
  Search,
  Mail,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  RotateCcw,
  Settings,
  Filter,
  X
} from "lucide-react";

// Type definitions
interface Application {
  _id: string;
  internshipId: string;
  companyName: string;
  position: string;
  appliedDate: string;
  status: "pending" | "shortlisted" | "interview_scheduled" | "selected" | "rejected";
  applicationData: {
    coverLetter: string;
    whyInterestedReason: string;
    relevantExperience: string;
    additionalComments: string;
  };
  userProfileSnapshot: {
    fullName: string;
    email: string;
    phone: string;
    university: string;
    degree: string;
    major: string;
    graduationYear: string;
    skills: string;
    gpa: string;
  };
  applicantInfo: {
    username: string;
    fullName: string;
    email: string;
  };
}

interface Internship {
  _id: string;
  title: string;
  organizationName: string;
  department: string;
  mode: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
}

export default function AppliedInternScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInternship, setSelectedInternship] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchInternships();
    fetchApplications();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApplications();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedInternship, selectedStatus]);

  const fetchInternships = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User not authenticated");
      }

      const user = JSON.parse(storedUser);
      const response = await fetch(`/api/users/${user.username}`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      const organizationId = userData.user.organizationId;

      // Fetch internships for this organization
      const internshipsResponse = await fetch(
        `/api/internships/by-organization?organizationId=${organizationId}`
      );
      if (!internshipsResponse.ok) {
        throw new Error("Failed to fetch internships");
      }

      const internshipsData = await internshipsResponse.json();
      setInternships(internshipsData.internships || []);
    } catch (error: any) {
      console.error("Error fetching internships:", error);
      setError(error.message);
    }
  };

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User not authenticated");
      }

      const user = JSON.parse(storedUser);

      // Build query parameters
      let url = `/api/internships/applications?organizationAdmin=${user.username}`;
      if (selectedInternship !== "all") {
        url += `&internshipId=${selectedInternship}`;
      }
      if (selectedStatus !== "all") {
        url += `&status=${selectedStatus}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      setIsUpdatingStatus(true);

      const response = await fetch(`/api/internships/applications/${applicationId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      // Refresh applications
      fetchApplications();
      
      // Close modal if open
      if (showModal && selectedApplication?._id === applicationId) {
        setSelectedApplication(prev => prev ? {...prev, status: newStatus as any} : null);
      }

      alert("Application status updated successfully");
    } catch (error: any) {
      console.error("Error updating application status:", error);
      alert(`Failed to update status: ${error.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "shortlisted":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "interview_scheduled":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "selected":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shortlisted":
        return "bg-blue-100 text-blue-800";
      case "interview_scheduled":
        return "bg-purple-100 text-purple-800";
      case "selected":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-4" />
        <p className="text-gray-500">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchApplications}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <UserSearch className="mr-3 h-6 w-6 text-cyan-600" />
              Applied Interns
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Review and manage internship applications
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {applications.length} application{applications.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
              placeholder="Search by applicant name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
            value={selectedInternship}
            onChange={(e) => setSelectedInternship(e.target.value)}
          >
            <option value="all">All Internships</option>
            {internships.map((internship) => (
              <option key={internship._id} value={internship._id}>
                {internship.title} - {internship.department}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="selected">Selected/Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <UserSearch className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Applications not Found
          </h3>
          <p className="text-gray-500">
            {searchQuery || selectedInternship !== "all" || selectedStatus !== "all"
              ? "Try adjusting your filters"
              : "No applications have been submitted yet"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {applications.map((application) => (
              <div
                key={application._id}
                className="p-6 hover:bg-gray-50 transition-colors duration-150"
              >
                <div className="flex flex-col lg:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {application.userProfileSnapshot.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Applied for: {application.position}
                        </p>
                        <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" />
                            {application.userProfileSnapshot.email}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Applied: {formatDate(application.appliedDate)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {application.userProfileSnapshot.university}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {application.userProfileSnapshot.degree}
                      </span>
                    </div>

                    <div className="flex flex-col lg:items-end space-y-2 mt-4 lg:mt-0">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewApplication(application)}
                          className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </button>
                      </div>

                      {/* Enhanced Quick Status Actions */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {/* For Pending Applications */}
                        {application.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application._id, "shortlisted")}
                              disabled={isUpdatingStatus}
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 flex items-center"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Shortlist
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application._id, "rejected")}
                              disabled={isUpdatingStatus}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 flex items-center"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}

                        {/* For Shortlisted Applications */}
                        {application.status === "shortlisted" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application._id, "interview_scheduled")}
                              disabled={isUpdatingStatus}
                              className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50 flex items-center"
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Schedule
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application._id, "selected")}
                              disabled={isUpdatingStatus}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 flex items-center"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Select
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application._id, "rejected")}
                              disabled={isUpdatingStatus}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 flex items-center"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}

                        {/* For Interview Scheduled Applications */}
                        {application.status === "interview_scheduled" && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(application._id, "selected")}
                              disabled={isUpdatingStatus}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50 flex items-center"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Select
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(application._id, "rejected")}
                              disabled={isUpdatingStatus}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 flex items-center"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Reject
                            </button>
                          </>
                        )}

                        {/* For Selected Applications */}
                        {application.status === "selected" && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Selected
                          </span>
                        )}

                        {/* For Rejected Applications */}
                        {application.status === "rejected" && (
                          <>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs flex items-center">
                              <XCircle className="h-3 w-3 mr-1" />
                              Rejected
                            </span>
                            <button
                              onClick={() => handleStatusUpdate(application._id, "pending")}
                              disabled={isUpdatingStatus}
                              className="px-2 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 disabled:opacity-50 flex items-center"
                            >
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Reconsider
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">
                Application Details
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-full hover:bg-red-100"
              >
                <X className="h-6 w-6 text-gray-500 hover:text-red-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Applicant Information */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <UserSearch className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-medium">{selectedApplication.userProfileSnapshot.fullName}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{selectedApplication.userProfileSnapshot.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="h-5 w-5 text-gray-400 mr-3 flex items-center justify-center">
                      🎓
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Education</p>
                      <p className="font-medium">
                        {selectedApplication.userProfileSnapshot.degree} in {selectedApplication.userProfileSnapshot.major}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Graduation Year</p>
                      <p className="font-medium">{selectedApplication.userProfileSnapshot.graduationYear}</p>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                {selectedApplication.userProfileSnapshot.skills && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Skills</p>
                    <p className="text-gray-900">{selectedApplication.userProfileSnapshot.skills}</p>
                  </div>
                )}
              </div>

              {/* Application Content */}
              <div className="space-y-6 p-6">
                {/* Cover Letter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Cover Letter</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedApplication.applicationData.coverLetter}
                    </p>
                  </div>
                </div>

                {/* Application Questions */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Application Responses</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Why are you interested in this internship?</p>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded">
                        {selectedApplication.applicationData.whyInterestedReason}
                      </p>
                    </div>
                    
                    {selectedApplication.applicationData.relevantExperience && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Relevant Experience</p>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded">
                          {selectedApplication.applicationData.relevantExperience}
                        </p>
                      </div>
                    )}

                    {selectedApplication.applicationData.additionalComments && (
                      <div>
                        <p className="font-medium text-gray-700 mb-1">Additional Comments</p>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded">
                          {selectedApplication.applicationData.additionalComments}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Simple Status Management Section */}
              <div className="border-t border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Update Application Status</h4>
                
                {/* Current Status Display */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current Status:</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center w-fit ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusIcon(selectedApplication.status)}
                    <span className="ml-2 capitalize">{selectedApplication.status.replace('_', ' ')}</span>
                  </span>
                </div>

                {/* Status Selection Dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change Status To:
                  </label>
                  <select
                    value={selectedApplication.status}
                    onChange={(e) => {
                      if (window.confirm(`Are you sure you want to change the status to "${e.target.value.replace('_', ' ')}"?`)) {
                        handleStatusUpdate(selectedApplication._id, e.target.value);
                      }
                    }}
                    disabled={isUpdatingStatus}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black disabled:opacity-50"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interview_scheduled">Interview Scheduled</option>
                    <option value="selected">Selected/Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Loading Indicator */}
                {isUpdatingStatus && (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-500 mr-2" />
                    <span className="text-sm text-gray-600">Updating status...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}