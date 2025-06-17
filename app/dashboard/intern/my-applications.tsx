"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Loader2,
  RefreshCw,
  Filter,
  Search,
  MapPin,
  DollarSign,
  X,
} from "lucide-react";

interface Application {
  _id: string;
  internshipId: string;
  companyName: string;
  position: string;
  appliedDate: string;
  status: string;
  applicationData: {
    coverLetter: string;
    whyInterestedReason: string;
    relevantExperience: string;
    expectedOutcome: string;
    availableStartDate: string;
    additionalComments: string;
  };
  userProfileSnapshot: any;
  interviewDate?: string;
  notes?: string;
}

interface InternshipDetails {
  _id: string;
  title: string;
  organizationName: string;
  organizationLogo?: string;
  department: string;
  mode: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  startDate: string;
  endDate: string;
  isPaid: boolean;
  stipend?: string;
  applicationDeadline: string;
}

export default function MyApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [internshipDetails, setInternshipDetails] = useState<{[key: string]: InternshipDetails}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userData = localStorage.getItem("user");
      if (!userData) {
        throw new Error("User not authenticated");
      }

      const user = JSON.parse(userData);
      const response = await fetch(`/api/users/${user.username}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data.user?.appliedInternships) {
        setApplications(data.user.appliedInternships);
        
        // Fetch internship details for each application
        const internshipIds = data.user.appliedInternships.map((app: Application) => app.internshipId);
        await fetchInternshipDetails(internshipIds);
      }
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInternshipDetails = async (internshipIds: string[]) => {
    try {
      const detailsMap: {[key: string]: InternshipDetails} = {};
      
      // Fetch details for each internship
      await Promise.all(
        internshipIds.map(async (id) => {
          try {
            const response = await fetch(`/api/internships/${id}`);
            if (response.ok) {
              const internship = await response.json();
              detailsMap[id] = internship;
            }
          } catch (error) {
            console.error(`Error fetching internship ${id}:`, error);
          }
        })
      );
      
      setInternshipDetails(detailsMap);
    } catch (error) {
      console.error("Error fetching internship details:", error);
    }
  };

  const refreshApplications = async () => {
    setIsRefreshing(true);
    await fetchApplications();
    setIsRefreshing(false);
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
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "shortlisted":
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case "interview_scheduled":
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case "selected":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "shortlisted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "interview_scheduled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "selected":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "pending":
        return "Your application is under review";
      case "shortlisted":
        return "Congratulations! You've been shortlisted";
      case "interview_scheduled":
        return "Interview has been scheduled";
      case "selected":
        return "Congratulations! You've been selected";
      case "rejected":
        return "Unfortunately, your application was not successful";
      default:
        return "Status unknown";
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mb-4" />
        <p className="text-gray-500">Loading your applications...</p>
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FileText className="mr-3 h-6 w-6 text-cyan-600" />
              My Applications
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Track the status of your internship applications
            </p>
          </div>
          <button
            onClick={refreshApplications}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {applications.length === 0 ? "No Applications Yet" : "No Matching Applications"}
          </h3>
          <p className="text-gray-500">
            {applications.length === 0 
              ? "Start applying to internships to see them here"
              : "Try adjusting your search or filter criteria"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => {
            const internship = internshipDetails[application.internshipId];
            
            return (
              <div
                key={application._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.position}
                          </h3>
                          <p className="text-gray-600">{application.companyName}</p>
                          {internship && (
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {internship.mode === "remote" 
                                  ? "Remote" 
                                  : internship.location?.city 
                                    ? `${internship.location.city}, ${internship.location.country}`
                                    : "Location TBD"}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(internship.startDate)} - {formatDate(internship.endDate)}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {internship.isPaid 
                                  ? internship.stipend || "Paid" 
                                  : "Unpaid"}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 mb-3">
                        <div className={`flex items-center px-3 py-2 rounded-lg border ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-2 font-medium capitalize">
                            {application.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Applied on {formatDate(application.appliedDate)}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        {getStatusDescription(application.status)}
                      </p>
                    </div>

                    <div className="flex flex-col lg:items-end space-y-2 mt-4 lg:mt-0 lg:ml-6">
                      <button
                        onClick={() => handleViewDetails(application)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </button>
                      
                      {application.status === "interview_scheduled" && application.interviewDate && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Interview Date:</p>
                          <p className="font-medium text-purple-600">
                            {formatDate(application.interviewDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">
                Application Details
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-full hover:bg-red-100"
              >
                <X className="h-5 w-5 text-red-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-grow">
              {/* Application Info */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Application Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Position</p>
                    <p className="font-medium">{selectedApplication.position}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-medium">{selectedApplication.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Applied Date</p>
                    <p className="font-medium">{formatDate(selectedApplication.appliedDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <div className={`inline-flex items-center px-3 py-1 rounded-lg border ${getStatusColor(selectedApplication.status)}`}>
                      {getStatusIcon(selectedApplication.status)}
                      <span className="ml-2 font-medium capitalize">
                        {selectedApplication.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Content */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Cover Letter</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedApplication.applicationData.coverLetter}
                    </p>
                  </div>
                </div>

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

                {selectedApplication.notes && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Notes from Organization</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                      <p className="text-blue-900">{selectedApplication.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}