"use client";

import { useState, useEffect } from "react";
import {
  UserSearch,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  Mail,
  Phone,
  GraduationCap,
  Briefcase,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  X,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface Application {
  _id: string;
  internshipId: string;
  companyName: string;
  position: string;
  appliedDate: string;
  status: string;
  respondedDate?: string; // When intern responded to selection
  applicationData: {
    coverLetter: string;
    whyInterestedReason: string;
    relevantExperience: string;
    expectedOutcome: string;
    availableStartDate: string;
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
    resumeFile: string;
    gpa?: string;
    portfolioLinks?: string[];
    internshipGoals?: string;
    previousExperience?: string;
  };
  applicantInfo: {
    username: string;
    fullName: string;
    email: string;
  };
}

interface InternshipPost {
  _id: string;
  title: string;
  department: string;
  applications: string[];
}

export default function AppliedInternScreen() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<InternshipPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, []);

  useEffect(() => {
    if (internships.length > 0) {
      fetchApplications();
    }
  }, [internships, selectedInternship, selectedStatus, searchQuery]);

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
        setSelectedApplication(prev => prev ? 
          {...prev, status: newStatus} : null);
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
      case "accepted":
        return <ThumbsUp className="h-4 w-4 text-green-600" />;
      case "declined":
        return <ThumbsDown className="h-4 w-4 text-gray-500" />;
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
      case "accepted":
        return "bg-green-200 text-green-900";
      case "declined":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesInternship = selectedInternship === "all" || app.internshipId === selectedInternship;
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicantInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesInternship && matchesStatus && matchesSearch;
  });

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
            {applications.length} application{applications.length !== 1 ? "s" : ""} total
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Internship Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
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

          {/* Status Filter */}
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="selected">Selected (Awaiting Response)</option>
            <option value="accepted">Accepted by Intern</option>
            <option value="declined">Declined by Intern</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Actions */}
          <div className="flex space-x-2">
            <button
              onClick={fetchApplications}
              className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <UserSearch className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {applications.length === 0 ? "No Applications Yet" : "No Matching Applications"}
          </h3>
          <p className="text-gray-500">
            {applications.length === 0 
              ? "Applications will appear here once students start applying to your internships."
              : "Try adjusting your filters to see more applications."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md">
          <div className="overflow-x-auto">
            <div className="space-y-4 p-6">
              {filteredApplications.map((application) => (
                <div
                  key={application._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {application.applicantInfo.fullName}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {application.applicantInfo.email}
                            </div>
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              {application.position}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Applied {formatDate(application.appliedDate)}
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            <span className="ml-1 capitalize">{application.status.replace('_', ' ')}</span>
                          </div>

                          {/* Response Information */}
                          {application.respondedDate && (
                            <div className="mt-2 text-sm text-gray-600">
                              <span className="font-medium">Responded:</span> {formatDate(application.respondedDate)}
                            </div>
                          )}
                        </div>
                      </div>
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

                      {/* Quick Status Actions - only show if not already responded */}
                      {application.status === "pending" && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleStatusUpdate(application._id, "shortlisted")}
                            disabled={isUpdatingStatus}
                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(application._id, "rejected")}
                            disabled={isUpdatingStatus}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {application.status === "shortlisted" && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleStatusUpdate(application._id, "interview_scheduled")}
                            disabled={isUpdatingStatus}
                            className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50"
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(application._id, "selected")}
                            disabled={isUpdatingStatus}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                          >
                            Select
                          </button>
                        </div>
                      )}

                      {application.status === "interview_scheduled" && (
                        <button
                          onClick={() => handleStatusUpdate(application._id, "selected")}
                          disabled={isUpdatingStatus}
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                        >
                          Select
                        </button>
                      )}

                      {/* Response Status Indicators */}
                      {application.status === "selected" && (
                        <div className="text-xs text-yellow-700 bg-yellow-100 px-2 py-1 rounded">
                          ⏳ Awaiting intern response
                        </div>
                      )}

                      {application.status === "accepted" && (
                        <div className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded">
                          ✅ Offer accepted
                        </div>
                      )}

                      {application.status === "declined" && (
                        <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          ❌ Offer declined
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Applicant Info */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Applicant Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-900">{selectedApplication.userProfileSnapshot.fullName}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2 text-gray-900">{selectedApplication.userProfileSnapshot.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span className="ml-2 text-gray-900">{selectedApplication.userProfileSnapshot.phone}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700">University:</span>
                        <span className="ml-2 text-gray-900">{selectedApplication.userProfileSnapshot.university}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700">Major:</span>
                        <span className="ml-2 text-gray-900">{selectedApplication.userProfileSnapshot.major}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium text-gray-700">Graduation:</span>
                        <span className="ml-2 text-gray-900">{selectedApplication.userProfileSnapshot.graduationYear}</span>
                      </div>
                    </div>
                  </div>

                  {selectedApplication.userProfileSnapshot.resumeFile && (
                    <div className="mt-4">
                      <a
                        href={selectedApplication.userProfileSnapshot.resumeFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        View Resume
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Intern Response Status */}
                {selectedApplication.status === "accepted" && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                      <ThumbsUp className="h-5 w-5 mr-2" />
                      Offer Accepted
                    </h5>
                    <p className="text-green-700 text-sm">
                      The intern has accepted this internship offer.
                      {selectedApplication.respondedDate && (
                        <span className="block mt-1">
                          Responded on: {formatDate(selectedApplication.respondedDate)}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {selectedApplication.status === "declined" && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-2 flex items-center">
                      <ThumbsDown className="h-5 w-5 mr-2" />
                      Offer Declined
                    </h5>
                    <p className="text-gray-700 text-sm">
                      The intern has declined this internship offer.
                      {selectedApplication.respondedDate && (
                        <span className="block mt-1">
                          Responded on: {formatDate(selectedApplication.respondedDate)}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {selectedApplication.status === "selected" && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h5 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Awaiting Response
                    </h5>
                    <p className="text-yellow-700 text-sm">
                      The intern has been selected and is awaiting their response to accept or decline the offer.
                    </p>
                  </div>
                )}

                {/* Application Details */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Application Details</h4>
                  
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Cover Letter</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">
                      {selectedApplication.applicationData.coverLetter}
                    </p>
                  </div>

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

                  <div>
                    <p className="font-medium text-gray-700 mb-1">Expected Outcome</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">
                      {selectedApplication.applicationData.expectedOutcome}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium text-gray-700 mb-1">Available Start Date</p>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded">
                      {formatDate(selectedApplication.applicationData.availableStartDate)}
                    </p>
                  </div>

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

            {/* Modal Footer with Status and Actions */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusIcon(selectedApplication.status)}
                    <span className="ml-1 capitalize">{selectedApplication.status.replace('_', ' ')}</span>
                  </span>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                  >
                    Close
                  </button>
                  
                  {/* Status Update Buttons - only show if not already responded */}
                  {selectedApplication.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(selectedApplication._id, "shortlisted")}
                        disabled={isUpdatingStatus}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedApplication._id, "rejected")}
                        disabled={isUpdatingStatus}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {selectedApplication.status === "shortlisted" && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(selectedApplication._id, "interview_scheduled")}
                        disabled={isUpdatingStatus}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium disabled:opacity-50"
                      >
                        Schedule Interview
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedApplication._id, "selected")}
                        disabled={isUpdatingStatus}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedApplication._id, "rejected")}
                        disabled={isUpdatingStatus}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50"
                      >
                       Reject
                      </button>
                    </>  
                  )}
                  
                  
                  {selectedApplication.status === "interview_scheduled" && (
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication._id, "selected")}
                      disabled={isUpdatingStatus}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
                    >
                      Select Candidate
                    </button>
                  )}

                  {(selectedApplication.status === "accepted" || selectedApplication.status === "declined") && (
                    <div className="text-sm text-gray-600">
                      No further actions available - intern has responded to the offer.
                    </div>
                  )}

                  {selectedApplication.status === "selected" && (
                    <div className="text-sm text-yellow-700 bg-yellow-100 px-3 py-2 rounded">
                      Waiting for intern to accept or decline the offer.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}